import express from 'express';
import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
  validateOtp,
} from '../controllers/auth.controller.js';
import * as AdminController from '../controllers/admin.controller.js';

const authRouter = express.Router();

// Public user routes
authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/validate-otp', validateOtp);

// Admin auth routes (prefix: /admin)
authRouter.post('/admin/signin', AdminController.adminSignIn);
authRouter.post('/admin/forgot-password', AdminController.adminForgotPassword);
authRouter.post('/admin/validate-otp', AdminController.adminValidateOtp);
authRouter.post('/admin/reset-password', AdminController.adminResetPassword);

export default authRouter;
