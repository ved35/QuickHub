import express from 'express';
import {
  listServices,
  listBookings,
  staffBookingDetails,
  staffFeedbacks,
  companyDetails,
} from '../controllers/customer.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

// Services (protected — remove verifyToken if you want public)
router.get('/services', verifyToken, listServices);

// Customer bookings (active/past) with filters & pagination
router.get('/bookings', verifyToken, listBookings);
// router.get('/bookings/:id', verifyToken, listBookings); // if booking detail is handled by listBookings, otherwise adjust

// Provider & company details used by UI (use controller names)
router.get('/providers/:id', verifyToken, staffBookingDetails);
router.get('/providers/:id/feedbacks', verifyToken, staffFeedbacks);
router.get('/companies/:id', verifyToken, companyDetails);

export default router;
