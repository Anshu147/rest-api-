import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator
} from '../validators/projectValidator.js';

const router = Router();

// Protect all project routes with JWT authentication
router.use(authenticate);

router.post('/', createProjectValidator, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectIdParamValidator, projectController.getProjectById);
router.put('/:id', updateProjectValidator, projectController.updateProject);
router.delete('/:id', projectIdParamValidator, projectController.deleteProject);

export default router;
