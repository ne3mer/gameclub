import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';
import { testBotController, sendTestMessageController } from '../controllers/telegram.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticateUser);
router.use(adminAuth);

router.get('/test', testBotController);
router.post('/test', sendTestMessageController);

export default router;

