import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../models/index.js';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES).withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  validateRequest
];

export const updateTaskValidator = [
  param('id')
    .isMongoId().withMessage('Invalid task ID format. Must be a 24-character hexadecimal string'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES).withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('projectId')
    .optional()
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  body().custom((value, { req }) => {
    const { title, description, status, priority, dueDate, projectId } = req.body;
    if (
      title === undefined &&
      description === undefined &&
      status === undefined &&
      priority === undefined &&
      dueDate === undefined &&
      projectId === undefined
    ) {
      throw new Error('At least one field must be provided to update the task');
    }
    return true;
  }),
  validateRequest
];

export const taskIdParamValidator = [
  param('id')
    .isMongoId().withMessage('Invalid task ID format. Must be a 24-character hexadecimal string'),
  validateRequest
];

export const queryTaskValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional()
    .trim()
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  query('priority')
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES).withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  query('projectId')
    .optional()
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  validateRequest
];
