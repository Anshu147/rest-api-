import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Project & Task Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
