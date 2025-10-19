import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import * as bookingController from '../controllers/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post(
  '/customwe/book-service',
  verifyToken,
  bookingController.createBooking
);

bookingRouter.get(
  '/customer/book-services-list',
  verifyToken,
  bookingController.listCustomerBookings
);

export default bookingRouter;
