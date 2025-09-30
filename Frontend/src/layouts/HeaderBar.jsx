import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalStore from '../context/globalStore';
import { showSuccess } from '../utils/toast';

const HeaderBar = () => {
  const user = useGlobalStore((state) => state.user) || { name: 'Superadmin' };
  const setUser = useGlobalStore((state) => state.setUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    setIsDropdownOpen(false);
    navigate('/change-password');
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear user from global store
    setUser(null);
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Show success message
    showSuccess('Logged out successfully!');
    
    // Navigate to signin page
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-10 theme-primary shadow-lg flex items-center justify-between px-4 sm:px-8 py-7 w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center">
          
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="theme-button-primary px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            {user.name}
            <span>▼</span>
          </button>
          {isDropdownOpen && (
            <div className="theme-card absolute right-0 mt-2 w-44 z-20">
              <button
                onClick={handleChangePassword}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
                style={{color: 'var(--text-primary)'}}
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
                style={{color: 'var(--text-primary)'}}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
