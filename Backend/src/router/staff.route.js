import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import {
  listStaff,
  createStaff,
  updateStaff,
  staffDetailsForCustomer,
} from '../controllers/staff.controller.js';

const router = express.Router();

router.get('/list-staff', verifyToken, listStaff);
 router.get('/customer/list-staff', verifyToken, listStaffCustomer); 

router.post('/create-staff', verifyToken, createStaff);

router.post('/update-staff/:id', verifyToken, updateStaff);

router.get('/customer/staff-details',verifyToken,staffDetailsForCustomer)

// company detail (used by Staff Details UI)
router.get('/customer/company-detail/:id', verifyToken, companyDetails); // GET /staff/company/:id
