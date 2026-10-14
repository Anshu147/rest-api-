import { Project, Task } from '../models/index.js';

export const getDashboardStats = async (userId) => {
  // Query MySQL for project statistics and MongoDB for task statistics concurrently
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    pendingTasks,
    completedTasks,
    highPriorityTasks
  ] = await Promise.all([
    // MySQL queries
    Project.count({ where: { userId } }),
    Project.count({ where: { userId, status: 'active' } }),
    Project.count({ where: { userId, status: 'completed' } }),

    // MongoDB queries
    Task.countDocuments({ ownerId: userId }),
    Task.countDocuments({ ownerId: userId, status: { $in: ['todo', 'in_progress'] } }),
    Task.countDocuments({ ownerId: userId, status: 'completed' }),
    Task.countDocuments({ ownerId: userId, priority: 'high' })
  ]);

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    pendingTasks,
    completedTasks,
    highPriorityTasks,
    breakdown: {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        archived: totalProjects - (activeProjects + completedProjects)
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
        highPriority: highPriorityTasks
      }
    }
  };
};
