import express from 'express';
import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
  validateOtp,
} from '../controllers/auth.controller.js';
import * as AdminController from '../controllers/admin.controller.js';
import { verifyUserMiddleware } from '../middleware/verifyUser.js';

const authRouter = express.Router();

// Public user routes
authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/validate-otp', validateOtp);
authRouter.post('/edit-profile', verifyUserMiddleware, editProfile);
authRouter.post('/change-password', verifyUserMiddleware, changePassword);
authRouter.post('/logout', verifyUserMiddleware, logout);

// Admin auth routes (prefix: /admin)
authRouter.post('/admin/signin', AdminController.adminSignIn);
authRouter.post('/admin/forgot-password', AdminController.adminForgotPassword);
authRouter.post('/admin/validate-otp', AdminController.adminValidateOtp);
authRouter.post('/admin/reset-password', AdminController.adminResetPassword);
authRouter.post('/admin/change-password', AdminController.adminchangePassword);

export default authRouter;
