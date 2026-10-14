import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { PROJECT_STATUSES } from '../models/index.js';

export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Project title must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(PROJECT_STATUSES).withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
  validateRequest
];

export const updateProjectValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Project title must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(PROJECT_STATUSES).withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
  body().custom((value, { req }) => {
    const { title, description, status } = req.body;
    if (title === undefined && description === undefined && status === undefined) {
      throw new Error('At least one field (title, description, or status) must be provided to update');
    }
    return true;
  }),
  validateRequest
];

export const projectIdParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  validateRequest
];
