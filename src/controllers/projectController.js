import * as projectService from '../services/projectService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;
  const project = await projectService.createProject(req.user.id, { title, description, status });
  return sendSuccess(res, 201, 'Project created successfully', { project });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getUserProjects(req.user.id);
  return sendSuccess(res, 200, 'Projects retrieved successfully', {
    total: projects.length,
    projects
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.user.id, parseInt(req.params.id, 10));
  return sendSuccess(res, 200, 'Project retrieved successfully', { project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;
  const updatedProject = await projectService.updateProject(
    req.user.id,
    parseInt(req.params.id, 10),
    { title, description, status }
  );
  return sendSuccess(res, 200, 'Project updated successfully', { project: updatedProject });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.user.id, parseInt(req.params.id, 10));
  return sendSuccess(res, 200, 'Project and associated tasks deleted successfully', result);
});
