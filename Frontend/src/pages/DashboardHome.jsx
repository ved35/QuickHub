import React from 'react';

const DashboardHome = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-6 sm:mt-12 w-full">
    <div className="theme-card p-6 sm:p-8 text-center transition-transform hover:scale-105 hover:shadow-2xl w-full">
      <div className="text-4xl sm:text-5xl font-extrabold mb-2" style={{color: 'var(--primary-600)'}}>
        65
      </div>
      <div className="text-base sm:text-lg font-medium" style={{color: 'var(--text-primary)'}}>
        Companies
      </div>
    </div>
    <div className="theme-card p-6 sm:p-8 text-center transition-transform hover:scale-105 hover:shadow-2xl w-full">
      <div className="text-4xl sm:text-5xl font-extrabold mb-2" style={{color: 'var(--success-600)'}}>
        2080
      </div>
      <div className="text-base sm:text-lg font-medium" style={{color: 'var(--text-primary)'}}>
        Customers
      </div>
    </div>
    <div className="theme-card p-6 sm:p-8 text-center transition-transform hover:scale-105 hover:shadow-2xl w-full">
      <div className="text-4xl sm:text-5xl font-extrabold mb-2" style={{color: 'var(--secondary-600)'}}>
        ₹20000
      </div>
      <div className="text-base sm:text-lg font-medium" style={{color: 'var(--text-primary)'}}>
        Total Sales
      </div>
    </div>
    <div className="theme-card p-6 sm:p-8 text-center transition-transform hover:scale-105 hover:shadow-2xl w-full">
      <div className="text-4xl sm:text-5xl font-extrabold mb-2" style={{color: 'var(--error-600)'}}>
        ₹2000
      </div>
      <div className="text-base sm:text-lg font-medium" style={{color: 'var(--text-primary)'}}>
        Pending Dues
      </div>
    </div>
  </div>
);

export default DashboardHome;
