import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, updateProfileValidator, authController.updateProfile);

export default router;
