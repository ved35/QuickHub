import userModel from '../models/user.model.js';
import changePasswordModel from '../models/changepassword.model.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/utils.js';
import Mailer from '../utils/mailer.js';

dotenv.config();

export const signUp = async (req, res, next) => {
  const { name, email, phone, username, password, gender, userType, dob } =
    req.body;

  try {
    if (
      !name ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !gender ||
      !userType ||
      !dob ||
      name === '' ||
      email === '' ||
      phone === '' ||
      username === '' ||
      password === '' ||
      gender === '' ||
      userType === '' ||
      dob === ''
    ) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const userName = await userModel.findOne({ username });

    if (userName) {
      return next(errorHandler(400, 'Username already exists'));
    }

    const userEmail = await userModel.findOne({ email });

    if (userEmail) {
      return next(errorHandler(400, 'Email already exists'));
    }

    const hasPassword = await bcryptjs.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      phone,
      username,
      password: hasPassword,
      gender,
      userType,
      dob,
    });

    await newUser.save();

    const { password: pass, ...rest } = newUser._doc;
    const token = generateToken(newUser._id, newUser.isAdmin, res);

    res.status(201).json({
      status: 'success',
      message: 'Sign up successful',
      data: rest,
      token
    });
  } catch (error) {
    console.log('Error in signup controller', error.message);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await userModel.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, 'Invalid email or password'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, 'Invalid email or password'));
    }

    const token = generateToken(validUser._id, validUser.isAdmin, res);

    const { password: pass, ...rest } = validUser._doc;

    res.status(200).json({
      status: 'success',
      message: 'Login Successfull',
      data: rest,
      token
    });
  } catch (error) {
    console.log('Sign in error :-', error);
    return next(errorHandler(500, 'Internal server error'));
  }
};

// ----------------- FORGOT PASSWORD -----------------
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || email === '') {
      return next(errorHandler(400, 'Email is required'));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins validity

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Send OTP mail
    try {
      let info = await Mailer({ name: user.name, otp, email: user.email });
      console.log('Email sent successfully :-', info?.messageId);
      return res.status(200).json({
        status: 'success',
        message: 'OTP sent to email',
        data: { email: user.email },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Rollback OTP if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return next(errorHandler(500, `Failed to send OTP email: ${emailError.message}`));
    }
  } catch (error) {
    console.log('Forgot password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};


export const validateOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp || email === '' || otp === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return next(errorHandler(400, 'Invalid or expired OTP'));
    }

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'OTP verified',
    });
  } catch (error) {
    console.log('Validate OTP error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || email === '' || newPassword === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    console.log('Reset password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// ----------------- EDIT PROFILE -----------------
export const editProfile = async (req, res, next) => {
  try {
    const { name, gender, phone, email } = req.body;

    if (
      (name === undefined || name === null) &&
      (gender === undefined || gender === null) &&
      (phone === undefined || phone === null) &&
      (email === undefined || email === null)
    ) {
      return next(errorHandler(400, 'At least one field is required to update'));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // If email changed, ensure uniqueness
    if (email && email !== user.email) {
      const exists = await userModel.findOne({ email });
      if (exists) {
        return next(errorHandler(400, 'Email already exists'));
      }
      user.email = email;
    }

    if (name !== undefined && name !== null) user.name = name;
    if (gender !== undefined && gender !== null) user.gender = gender;
    if (phone !== undefined && phone !== null) user.phone = phone;

    await user.save();

    const { password: pass, ...rest } = user._doc;

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: rest,
    });
  } catch (error) {
    console.log('Edit profile error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// ----------------- CHANGE PASSWORD -----------------
export const changePassword = async (req, res, next) => {
  try {
    // use authenticated user's email (set by auth middleware)
    const email = req.user?.email;
    if (!email) return next(errorHandler(401, 'Unauthorized'));

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || currentPassword === '' || newPassword === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const user = await userModel.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(currentPassword, user.password);
    if (!validPassword) return next(errorHandler(400, 'Current password is incorrect'));

    const sameAsOld = bcryptjs.compareSync(newPassword, user.password);
    if (sameAsOld) return next(errorHandler(400, 'New password must be different from current password'));

    user.password = await bcryptjs.hash(newPassword, 10);
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.log('Change password error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

// ----------------- LOGOUT -----------------

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(400, 'Authorization token missing'));
    }

    const token = authHeader.split(' ')[1].trim();
    if (!token) return next(errorHandler(400, 'Authorization token missing'));

    // Try to decode token to get expiry and user id info
    const decoded = jwt.decode(token) || {};
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const userId = req.user?.id || req.user?._id || decoded.sub || decoded.id || decoded.userId;

    // Save token into blacklist (ignore duplicate key errors)
    try {
      await TokenBlacklist.create({ token, userId, expiresAt, meta: { ip: req.ip } });
    } catch (err) {
      // duplicate or other write errors can be ignored for logout (token already blacklisted)
      if (err.code && err.code !== 11000) {
        console.error('Token blacklist save error', err);
      }
    }

    return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error :-', error);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};