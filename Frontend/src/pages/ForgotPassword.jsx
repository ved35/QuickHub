import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
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
        Forgot Password
      </h1>
      <p className="text-center text-white mb-8 opacity-90">
        Enter your username to reset your password
      </p>
      
      <div className="theme-card p-8 w-full max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="theme-input w-full p-3 rounded-md"
            />
          </div>
          <button
            className="theme-button-primary w-full py-3 rounded-md font-semibold"
            onClick={() => navigate('/reset-password')}
          >
            Submit
          </button>
          <div className="text-center">
            <button 
              className="text-sm font-medium hover:underline transition-all"
              style={{color: 'var(--primary-600)'}}
              onClick={() => navigate('/signin')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
