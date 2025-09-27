import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import HeaderBar from '../layouts/HeaderBar';

const Dashboard = () => {
  return (
    <div className="flex h-screen min-h-screen w-full" style={{backgroundColor: 'var(--bg-secondary)'}}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 w-full">
        <HeaderBar />
        <main className="flex-1 p-2 sm:p-8 overflow-y-auto no-scrollbar w-full" style={{backgroundColor: 'var(--bg-secondary)'}}>
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
