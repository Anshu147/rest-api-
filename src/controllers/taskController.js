import * as taskService from '../services/taskService.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, projectId } = req.body;
  const task = await taskService.createTask(req.user.id, {
    title,
    description,
    status,
    priority,
    dueDate,
    projectId
  });
  return sendSuccess(res, 201, 'Task created successfully', { task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, projectId } = req.query;
  const { tasks, pagination } = await taskService.getTasks(req.user.id, {
    page,
    limit,
    status,
    priority,
    projectId
  });
  return sendPaginated(res, 200, 'Tasks retrieved successfully', tasks, pagination);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user.id, req.params.id);
  return sendSuccess(res, 200, 'Task retrieved successfully', { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, projectId } = req.body;
  const updatedTask = await taskService.updateTask(req.user.id, req.params.id, {
    title,
    description,
    status,
    priority,
    dueDate,
    projectId
  });
  return sendSuccess(res, 200, 'Task updated successfully', { task: updatedTask });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.user.id, req.params.id);
  return sendSuccess(res, 200, 'Task deleted successfully', result);
});
