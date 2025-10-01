import React from 'react';
import { NavLink } from 'react-router-dom';
import useGlobalStore from '../context/globalStore';

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
      <div className="flex items-center">
        <div className="flex -space-x-1 mr-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--primary-600)'}}></div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-2xl tracking-wide text-white">Quickhub</span>
        </div>
      </div>
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
    {/* Close button for small devices */}
    <button
      className="sm:hidden absolute top-4 right-4 text-white/80 hover:text-white"
      onClick={() => setSidebarOpen(false)}
      aria-label="Close sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div className="p-4 text-xs text-white text-center">
      copyright 2025. All rights reserved.
    </div>
    </aside>
  </>
  );
};

export default Sidebar;
