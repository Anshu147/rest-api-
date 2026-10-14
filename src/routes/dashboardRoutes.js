import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protect dashboard route with JWT authentication
router.use(authenticate);

router.get('/', dashboardController.getDashboard);

export default router;
