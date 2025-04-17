import express from 'express';
import { loginWithMobile,verifyOtp,resendOtp } from '../controllers/authController';

const router = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Define the login route
router.post('/login', asyncHandler(loginWithMobile));
router.post('/verifyOtp', asyncHandler(verifyOtp));

router.post('/resendOtp', asyncHandler(resendOtp));



export default router;




