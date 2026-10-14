import { sequelize } from '../config/mysql.js';
import { User, sanitizeUser, comparePassword } from './User.js';
import { Project, PROJECT_STATUSES } from './Project.js';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from './Task.js';

// Setup Sequelize associations
User.hasMany(Project, { foreignKey: 'userId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: !force, force });
    console.log('[MySQL] Database tables synchronized successfully');
  } catch (error) {
    console.error('[MySQL] Table synchronization failed:', error.message);
    throw error;
  }
};

export {
  User,
  Project,
  Task,
  PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  sanitizeUser,
  comparePassword
};
