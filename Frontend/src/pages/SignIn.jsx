import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSignIn } from '../api';

const SignIn = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = { username: '', password: '' };

    if (!credentials.username.trim()) {
      nextErrors.username = 'Username is required';
    } else if (credentials.username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters';
    }

    if (!credentials.password) {
      nextErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return !nextErrors.username && !nextErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await adminSignIn({ username: credentials.username.trim(), password: credentials.password });
      navigate('/dashboard');
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
      
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Welcome to Quickhub
      </h1>
      
      <div className="theme-card p-8 w-full max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              className={`theme-input w-full p-3 rounded-md ${errors.username ? 'border-red-300' : ''}`}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-sm" style={{color: 'var(--error-600)'}}>
                {errors.username}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="theme-button-primary w-full py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
          <div className="text-right">
            <button
              type="button"
              className="text-sm font-medium hover:underline transition-all"
              style={{color: 'var(--primary-600)'}}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
