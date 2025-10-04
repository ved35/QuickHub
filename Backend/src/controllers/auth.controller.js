import userModel from '../models/user.model.js';
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
