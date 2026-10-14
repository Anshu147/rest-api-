import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator,
  queryTaskValidator
} from '../validators/taskValidator.js';

const router = Router();

// Protect all task routes with JWT authentication
router.use(authenticate);

router.post('/', createTaskValidator, taskController.createTask);
router.get('/', queryTaskValidator, taskController.getTasks);
router.get('/:id', taskIdParamValidator, taskController.getTaskById);
router.put('/:id', updateTaskValidator, taskController.updateTask);
router.delete('/:id', taskIdParamValidator, taskController.deleteTask);

export default router;
