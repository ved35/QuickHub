import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalStore from '../context/globalStore';
import { showSuccess, showError } from '../utils/toast';
import { adminLogout } from '../api/index';
import { FiMenu } from 'react-icons/fi';
import { TiThMenu } from "react-icons/ti";
import logo from '../assets/logo.png';


const HeaderBar = () => {
  const user = useGlobalStore((state) => state.user) || { name: 'Superadmin' };
  const setUser = useGlobalStore((state) => state.setUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isSidebarOpen = useGlobalStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useGlobalStore((state) => state.setSidebarOpen);

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

  const handleLogout = async () => {
    try {
      await adminLogout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/signin');
    } catch (error) {
      showError(error.response?.data?.message || 'Logout failed. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-30 theme-primary shadow-lg flex items-center justify-between px-4 sm:px-8 py-5 w-full">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle sidebar"
          className='sm:hidden !bg-transparent shadow-none'
          // className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 !bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <TiThMenu className='h-6 w-6' />
        </button>
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
