// routes/paymentRoutes.ts
import { Router } from 'express';
import { initiatePayment, paymentSuccess, paymentFailure } from '../controllers/paymentController';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/success', paymentSuccess);
router.post('/failure', paymentFailure);

export default router;