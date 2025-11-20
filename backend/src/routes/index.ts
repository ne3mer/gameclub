import { Router } from 'express';
import healthRouter from './health.route';
import gameRouter from './game.route';
import authRouter from './auth.route';
import cartRouter from './cart.route';
import orderRouter from './order.routes';
import uploadRouter from './upload.routes';
import marketingRouter from './marketing.route';
import homeRouter from './home.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/games', gameRouter);
router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/upload', uploadRouter);
router.use('/marketing', marketingRouter);
router.use('/home', homeRouter);

export default router;
