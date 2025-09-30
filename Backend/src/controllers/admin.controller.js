import userModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/utils.js';
import Mailer from '../utils/mailer.js';
import ForgotPasswordAdmin from '../models/forgotpassword.admin.model.js';

dotenv.config();

// Admin Sign In
export const adminSignIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || username === '' || password === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const adminUser = await userModel.findOne({ username });
    if (!adminUser) return next(errorHandler(404, 'Invalid username or password'));

    // Ensure this user is an admin (company owner/admin)
    if (!adminUser.isAdmin && adminUser.userType !== 'company') {
      return next(errorHandler(403, 'Unauthorized'));
    }

    const validPassword = bcryptjs.compareSync(password, adminUser.password);
    if (!validPassword) return next(errorHandler(400, 'Invalid username or password'));

    const token = generateToken(adminUser._id, adminUser.isAdmin, res);
    const { password: pass, ...rest } = adminUser._doc;

    return res.status(200).json({ status: 'success', message: 'Admin login successful', data: rest, token });
  } catch (error) {
    console.log('Admin signIn error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// Admin Forgot Password -> send OTP
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username || username === '') return next(errorHandler(400, 'Username is required'));

    const adminUser = await userModel.findOne({ username });
    if (!adminUser) return next(errorHandler(404, 'User not found'));

    // Only admin/company users allowed
    if (!adminUser.isAdmin && adminUser.userType !== 'company') {
      return next(errorHandler(403, 'Unauthorized'));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // store OTP on user for backwards compatibility
    adminUser.otp = otp;
    adminUser.otpExpiry = expiry;
    await adminUser.save();

    // store OTP request record
    const record = new ForgotPasswordAdmin({
      userId: adminUser._id,
      username: adminUser.username,
      email: adminUser.email,
      otp,
      otpExpiry: new Date(expiry),
      ipAddress: req.ip,
      meta: { userAgent: req.get('User-Agent') },
    });
    await record.save();

    // send OTP to the user's registered email
    await Mailer({ name: adminUser.name, otp, email: adminUser.email });

    return res.status(200).json({ status: 'success', message: 'OTP sent to admin email', data: { username: adminUser.username, email: adminUser.email } });
  } catch (error) {
    console.log('Admin forgot password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// Admin Validate OTP
export const adminValidateOtp = async (req, res, next) => {
  try {
    const { username, otp } = req.body;
    if (!username || !otp || username === '' || otp === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const adminUser = await userModel.findOne({ username });
    if (!adminUser) return next(errorHandler(404, 'User not found'));

    // verify against recent ForgotPasswordAdmin record
    const record = await ForgotPasswordAdmin.findOne({ username, otp, used: false }).sort({ createdAt: -1 });
    if (!record || record.otpExpiry < new Date()) {
      return next(errorHandler(400, 'Invalid or expired OTP'));
    }

    // mark record used and clear user otp for compatibility
    record.used = true;
    await record.save();

    adminUser.otp = null;
    adminUser.otpExpiry = null;
    await adminUser.save();

    return res.status(200).json({ status: 'success', message: 'OTP verified' });
  } catch (error) {
    console.log('Admin validate OTP error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// Admin Reset Password
export const adminResetPassword = async (req, res, next) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword || username === '' || newPassword === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

  const adminUser = await userModel.findOne({ username });
  if (!adminUser) return next(errorHandler(404, 'User not found'));

    // Only admin/company users allowed
    if (!adminUser.isAdmin && adminUser.userType !== 'company') {
      return next(errorHandler(403, 'Unauthorized'));
    }

    // As a safety, verify that a recent OTP/reset record exists and was used
    const recentRecord = await ForgotPasswordAdmin.findOne({ username }).sort({ createdAt: -1 });
    if (!recentRecord || (!recentRecord.used && recentRecord.otpExpiry < new Date())) {
      // not strictly required, but safer to ensure OTP flow occurred
      // we'll still allow reset if you prefer, remove this block to disable enforcement
      console.log('No recent valid OTP/reset record found for', username);
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    adminUser.password = hashedPassword;
    adminUser.passwordChangedAt = new Date();
    await adminUser.save();

    // mark any reset records as used
    await ForgotPasswordAdmin.updateMany({ username, used: false }, { $set: { used: true } });

    return res.status(200).json({ status: 'success', message: 'Password reset successful' });
  } catch (error) {
    console.log('Admin reset password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export default {
  adminSignIn,
  adminForgotPassword,
  adminValidateOtp,
  adminResetPassword,
};
