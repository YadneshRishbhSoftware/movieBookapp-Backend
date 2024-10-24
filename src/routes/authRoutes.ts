// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, verifyUserusingtheotp, resendOTP } from '../controllers/authController';
import { validateRegisterFields, validateLoginFields, validateforgotpassoword } from '../middleware/validationMiddleware';

const router = Router();

router.post('/register', validateRegisterFields, register);
router.post('/verify-otp',  verifyUserusingtheotp);
router.post('/resendOTP',  resendOTP);
router.post('/login', validateLoginFields, login);
router.put('/forgotPassword', validateforgotpassoword,forgotPassword)
router.patch('/resetPassword/:token', resetPassword);

export default router;
