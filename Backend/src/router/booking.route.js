import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import * as bookingController from '../controllers/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post('/create-book-service',verifyToken,bookingController.createBooking);

bookingRouter.get('/book-services-list',verifyToken,bookingController.listCustomerBookings);

bookingRouter.post('/:bookingId/cancel',verifyToken,bookingController.cancelBooking);

export default bookingRouter;
