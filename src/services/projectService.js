import { Project, Task } from '../models/index.js';
import { notFound, forbidden } from '../utils/apiError.js';

export const createProject = async (userId, { title, description, status }) => {
  const project = await Project.create({
    title: title.trim(),
    description: description ? description.trim() : null,
    status: status || 'active',
    userId
  });

  return project;
};

export const getUserProjects = async (userId) => {
  const projects = await Project.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });

  return projects;
};

export const getProjectById = async (userId, projectId) => {
  const project = await Project.findByPk(projectId);

  if (!project) {
    throw notFound(`Project with ID ${projectId} was not found.`);
  }

  if (project.userId !== userId) {
    throw forbidden('You do not have permission to access this project.');
  }

  return project;
};

export const updateProject = async (userId, projectId, updateData) => {
  const project = await getProjectById(userId, projectId);

  if (updateData.title !== undefined) {
    project.title = updateData.title.trim();
  }

  if (updateData.description !== undefined) {
    project.description = updateData.description ? updateData.description.trim() : null;
  }

  if (updateData.status !== undefined) {
    project.status = updateData.status;
  }

  await project.save();

  return project;
};

export const deleteProject = async (userId, projectId) => {
  const project = await getProjectById(userId, projectId);

  // Cascade delete associated tasks in MongoDB
  await Task.deleteMany({ projectId: project.id, ownerId: userId });

  // Delete project from MySQL
  await project.destroy();

  return { id: projectId, deleted: true };
};
