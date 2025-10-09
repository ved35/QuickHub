import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import {
  listStaff,
  createStaff,
  updateStaff,
} from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/list-staff', verifyToken, listStaff);

router.post('/create-staff', verifyToken, createStaff);

router.post('/update-staff/:id', verifyToken, updateStaff);

// Services (protected — remove verifyToken if you want public)
router.get('/services', verifyToken, listServices);

// Customer bookings (active/past) with filters & pagination
router.get('/bookings', verifyToken, listBookings);
// router.get('/bookings/:id', verifyToken, listBookings); // if booking detail is handled by listBookings, otherwise adjust

// Provider & company details used by UI (use controller names)
router.get('/providers/:id', verifyToken, staffBookingDetails);
router.get('/providers/:id/feedbacks', verifyToken, staffFeedbacks);
router.get('/companies/:id', verifyToken, companyDetails);
