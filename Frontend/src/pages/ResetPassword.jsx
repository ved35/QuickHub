import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminResetPassword } from '../api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next = { password: '', confirmPassword: '' };
    if (!form.password) {
      next.password = 'New password is required';
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return !next.password && !next.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const username = sessionStorage.getItem('resetUsername');
      await adminResetPassword({ username, newPassword: form.password });
      sessionStorage.removeItem('resetUsername');
      navigate('/signin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen theme-primary">
      <div className="flex items-center mb-8">
        <div className="flex -space-x-1 mr-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-3xl text-white">Quickhub</span>
          <span className="text-sm" style={{color: 'var(--primary-200)'}}>Quickhub</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-center text-white mb-2">
        Reset Password
      </h1>
      <p className="text-center text-white mb-8 opacity-90">
        Enter your new password below
      </p>
      
      <div className="theme-card p-8 w-full max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`theme-input w-full p-3 rounded-md ${errors.password ? 'border-red-300' : ''}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm" style={{color: 'var(--error-600)'}}>
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className={`theme-input w-full p-3 rounded-md ${errors.confirmPassword ? 'border-red-300' : ''}`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="mt-1 text-sm" style={{color: 'var(--error-600)'}}>
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="theme-button-primary w-full py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
          <div className="text-center">
            <button 
              type="button"
              className="text-sm font-medium hover:underline transition-all"
              style={{color: 'var(--primary-600)'}}
              onClick={() => navigate('/signin')}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
