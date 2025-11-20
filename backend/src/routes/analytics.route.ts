import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateUser } from '../middleware/authenticateUser';
import {
  getDashboardAnalyticsController,
  getSalesReportController
} from '../controllers/analytics.controller';

const router = Router();

// Admin routes - require both user authentication and admin key
router.get('/dashboard', authenticateUser, adminAuth, getDashboardAnalyticsController);
router.get('/sales', authenticateUser, adminAuth, getSalesReportController);

export default router;

