import mongoose from 'mongoose';
import { Task, Project } from '../models/index.js';
import { notFound, forbidden, badRequest } from '../utils/apiError.js';

export const createTask = async (userId, { title, description, status, priority, dueDate, projectId }) => {
  // Validate project existence and ownership in MySQL
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw notFound(`Project with ID ${projectId} does not exist.`);
  }

  if (project.userId !== userId) {
    throw forbidden('Cannot create task: Project does not belong to the authenticated user.');
  }

  const task = await Task.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : null,
    projectId: Number(projectId),
    ownerId: userId
  });

  return task;
};

export const getTasks = async (userId, { page = 1, limit = 10, status, priority, projectId }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build filter criteria
  const filter = { ownerId: userId };

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (projectId) {
    filter.projectId = parseInt(projectId, 10);
  }

  // Execute count and query in parallel
  const [totalRecords, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum);

  return {
    tasks,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };
};

export const getTaskById = async (userId, taskId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw badRequest(`Invalid task ID '${taskId}'. Must be a valid 24-character hexadecimal ObjectId.`);
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw notFound(`Task with ID ${taskId} was not found.`);
  }

  if (task.ownerId !== userId) {
    throw forbidden('You do not have permission to access this task.');
  }

  return task;
};

export const updateTask = async (userId, taskId, updateData) => {
  const task = await getTaskById(userId, taskId);

  // If projectId is being changed, validate new project ownership in MySQL
  if (updateData.projectId !== undefined && updateData.projectId !== task.projectId) {
    const project = await Project.findByPk(updateData.projectId);
    if (!project) {
      throw notFound(`Target project with ID ${updateData.projectId} does not exist.`);
    }
    if (project.userId !== userId) {
      throw forbidden('Cannot move task: Target project does not belong to the authenticated user.');
    }
    task.projectId = Number(updateData.projectId);
  }

  if (updateData.title !== undefined) {
    task.title = updateData.title.trim();
  }

  if (updateData.description !== undefined) {
    task.description = updateData.description.trim();
  }

  if (updateData.status !== undefined) {
    task.status = updateData.status;
  }

  if (updateData.priority !== undefined) {
    task.priority = updateData.priority;
  }

  if (updateData.dueDate !== undefined) {
    task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
  }

  await task.save();

  return task;
};

export const deleteTask = async (userId, taskId) => {
  const task = await getTaskById(userId, taskId);

  await Task.findByIdAndDelete(task.id);

  return { id: taskId, deleted: true };
};
