import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SignIn from '../pages/SignIn';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ChangePassword from '../pages/ChangePassword';
import Dashboard from '../pages/Dashboard';
import DashboardHome from '../pages/DashboardHome';
import Companies from '../pages/Companies';
import Customers from '../pages/Customers';
import Transactions from '../pages/Transactions';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardHome />} />
        <Route path="companies" element={<Companies />} />
        <Route path="customers" element={<Customers />} />
        <Route path="transactions" element={<Transactions />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
