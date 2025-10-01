import axiosInstance from './axiosInstance';
import { showSuccess } from '../utils/toast';

// Admin Authentication & Password Reset APIs

export const adminSignIn = async ({ username, password }) => {
  const response = await axiosInstance.post('/auth/admin/signin', { username, password });
  const { token, data, message } = response.data || {};

  if (token) {
    localStorage.setItem('authToken', token);
  }
  if (message) {
    showSuccess(message);
  }
  return { user: data, token };
};

export const adminForgotPassword = async (username) => {
  const response = await axiosInstance.post('/auth/admin/forgot-password', { username });
  const { data, message } = response.data || {};
  if (message) {
    showSuccess(message);
  }
  return data;
};

export const adminValidateOtp = async ({ username, otp }) => {
  const response = await axiosInstance.post('/auth/admin/validate-otp', { username, otp });
  const { message } = response.data || {};
  if (message) {
    showSuccess(message);
  }
  return true;
};

export const adminResetPassword = async ({ username, newPassword }) => {
  const response = await axiosInstance.post('/auth/admin/reset-password', { username, newPassword });
  const { message } = response.data || {};
  if (message) {
    showSuccess(message);
  }
  return true;
};

export default {
  adminSignIn,
  adminForgotPassword,
  adminValidateOtp,
  adminResetPassword,
};


