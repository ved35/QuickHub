import React from 'react';
import { NavLink } from 'react-router-dom';
import useGlobalStore from '../context/globalStore';
import logo from '../assets/white-logo.png';

const menu = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Companies', path: '/dashboard/companies' },
  { name: 'Customers', path: '/dashboard/customers' },
  { name: 'Transactions', path: '/dashboard/transactions' },
];

const Sidebar = () => {
  const isSidebarOpen = useGlobalStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useGlobalStore((state) => state.setSidebarOpen);

  return (
  <>
    {/* Overlay for small screens */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-20 sm:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}
    <aside
      className={`h-screen w-64 theme-primary flex flex-col shadow-xl fixed sm:relative z-30 transition-transform duration-300 sm:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} [&_a]:text-white [&_a:hover]:text-white [&_a:visited]:text-white`}
    >
    <div className="p-6 flex items-center border-b" style={{borderColor: 'var(--primary-800)'}}>
      <img src={logo} alt="Quickhub" className="h-18 ml-10 w-auto" />
    </div>
    <nav className="py-4">
      {menu.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `block px-8 py-3 my-2 rounded-lg transition-colors duration-200 !text-white visited:!text-white hover:!text-white active:!text-white focus:!text-white ${isActive ? 'font-semibold shadow' : ''}`}
          style={({ isActive }) => ({
            backgroundColor: isActive ? 'var(--primary-700)' : 'transparent',
            color: 'var(--text-white)'
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('bg-opacity-100')) {
              e.currentTarget.style.backgroundColor = 'var(--primary-700)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('bg-opacity-100')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          end
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
   
    <div className="p-4 text-xs text-white text-center fixed bottom-0">
      copyright 2025. All rights reserved.
    </div>
    </aside>
  </>
  );
};

export default Sidebar;
