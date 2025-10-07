import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminValidateOtp } from '../api';
import logo from '../assets/white-logo.png';

const ValidateOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onlyDigits = (value) => value.replace(/\D/g, '');

  const handleChange = (e) => {
    const digits = onlyDigits(e.target.value).slice(0, 6);
    setOtp(digits);
    if (error) setError('');
  };

  const validate = () => {
    if (!otp) {
      setError('OTP is required');
      return false;
    }
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
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
      const username = sessionStorage.getItem('resetUsername');
      await adminValidateOtp({ username, otp });
      navigate('/reset-password');
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
        Validate OTP
      </h1>
      <p className="text-center text-white mb-8 opacity-90">
        Enter the 6-digit code sent to your account
      </p>

      <div className="theme-card p-8 w-full max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              name="otp"
              value={otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              className={`theme-input w-full p-3 rounded-md tracking-widest text-center text-lg ${error ? 'border-red-300' : ''}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'otp-error' : undefined}
            />
            {error && (
              <p id="otp-error" className="mt-1 text-sm" style={{color: 'var(--error-600)'}}>
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="theme-button-primary w-full py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Validating…' : 'Validate'}
          </button>
          <div className="text-center">
            <button 
              type="button"
              className="text-sm font-medium hover:underline transition-all"
              style={{color: 'var(--primary-600)'}}
              onClick={() => navigate('/forgot-password')}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidateOtp;


