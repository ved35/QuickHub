import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import {
  dashboardBookings,
  manageBooking,
  getBookingDetails,
} from '../controllers/company.controller.js';

const companyRouter = express.Router();

// Company Dashboard - all bookings with filters
companyRouter.get('/dashboard', verifyToken, dashboardBookings);

// Booking management
companyRouter.get('/booking-detail/:bookingId', verifyToken, getBookingDetails);
companyRouter.post('/bookings/:bookingId/manage', verifyToken, manageBooking);

export default companyRouter;
