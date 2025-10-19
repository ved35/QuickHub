import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { createBooking, listCustomerBookings } from '../controllers/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post('/customer/bookings', verifyToken, createBooking);
bookingRouter.get('/customer/bookings', verifyToken, listCustomerBookings);

export default bookingRouter;