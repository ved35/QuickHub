import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminForgotPassword } from '../api';
import logo from '../assets/white-logo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await adminForgotPassword(username.trim());
      // Persist username for next steps
      sessionStorage.setItem('resetUsername', username.trim());
      navigate('/validate-otp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen theme-primary">
      <div className="flex items-center mb-2">
        <img src={logo} alt="Quickhub" className="h-28 w-auto drop-shadow" />
      </div>
      
      <h1 className="text-3xl font-bold text-center text-white mb-2">
        Forgot Password
      </h1>
      <p className="text-center text-white mb-8 opacity-90">
        Enter your username to reset your password
      </p>
      
      <div className="theme-card p-8 w-full max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
              placeholder="Enter your username"
              className={`theme-input w-full p-3 rounded-md ${error ? 'border-red-300' : ''}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'username-error' : undefined}
            />
            {error && (
              <p id="username-error" className="mt-1 text-sm" style={{color: 'var(--error-600)'}}>
                {error}
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

export default ForgotPassword;
