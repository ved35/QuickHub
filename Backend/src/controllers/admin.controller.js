import userModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/utils.js';
import Mailer from '../utils/mailer.js';

dotenv.config();

// Admin Sign In
export const adminSignIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || username === '' || password === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const adminUser = await userModel.findOne({ username });

    if (!adminUser)
      return next(errorHandler(404, 'Invalid username or password'));

    // Ensure this user is an admin (company owner/admin)
    if (!adminUser.isAdmin && adminUser.userType !== 'company') {
      return next(errorHandler(403, 'Unauthorized'));
    }

    const validPassword = bcryptjs.compareSync(password, adminUser.password);
    if (!validPassword)
      return next(errorHandler(400, 'Invalid username or password'));

    const token = generateToken(adminUser._id, adminUser.isAdmin, res);

    // Store token in user table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    await userModel.findByIdAndUpdate(adminUser._id, {
      token,
      tokenExpiresAt: expiresAt,
    });

    const { password: pass, ...rest } = adminUser._doc;

    return res.status(200).json({
      status: 'success',
      message: 'Admin login successful',
      data: rest,
      token,
    });
  } catch (error) {
    console.log('Admin signIn error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// Admin Forgot Password -> send OTP
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username || username === '')
      return next(errorHandler(400, 'Username is required'));

    const adminUser = await userModel.findOne({ username });
    if (!adminUser) return next(errorHandler(404, 'User not found'));

    if (!adminUser.isAdmin && adminUser.userType !== 'company') {
      return next(errorHandler(403, 'Unauthorized'));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    adminUser.otp = otp;
    adminUser.otpExpiry = expiry;
    await adminUser.save();

    try {
      let info = await Mailer({
        name: adminUser.name,
        otp,
        email: adminUser.email,
      });
      console.log('Email sent successfully :-', info?.messageId);
      return res.status(200).json({
        status: 'success',
        message: 'OTP sent to admin email',
        data: { username: adminUser.username, email: adminUser.email },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      adminUser.otp = null;
      adminUser.otpExpiry = null;
      await adminUser.save();
      return next(
        errorHandler(500, `Failed to send OTP email: ${emailError.message}`)
      );
    }
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

    if (adminUser.otp !== otp || adminUser.otpExpiry < new Date()) {
      return next(errorHandler(400, 'Invalid or expired OTP'));
    }

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

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    adminUser.password = hashedPassword;
    await adminUser.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'Password reset successful' });
  } catch (error) {
    console.log('Admin reset password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export const adminchangePassword = async (req, res, next) => {
  try {
    const username = req.user?.id;
    console.log('Authenticated username :-', req.user, req.body);
    if (!username) return next(errorHandler(401, 'Unauthorized'));

    const { oldPassword, newPassword } = req.body;
    if (
      !oldPassword ||
      !newPassword ||
      oldPassword === '' ||
      newPassword === ''
    ) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const user = await userModel.findOne({ _id: username });
    if (!user) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(oldPassword, user.password);
    if (!validPassword)
      return next(errorHandler(400, 'Current password is incorrect'));

    const sameAsOld = bcryptjs.compareSync(newPassword, user.password);
    if (sameAsOld)
      return next(
        errorHandler(
          400,
          'New password must be different from current password'
        )
      );

    user.password = await bcryptjs.hash(newPassword, 10);
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log('Change password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export default {
  adminSignIn,
  adminForgotPassword,
  adminValidateOtp,
  adminResetPassword,
  adminchangePassword,
};
