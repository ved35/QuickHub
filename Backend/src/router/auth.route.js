import express from 'express';
import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
  validateOtp,
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/validate-otp', validateOtp);

export default authRouter;
