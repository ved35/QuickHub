import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import * as staffController from '../controllers/staff.controller.js';

const staffRouter = express.Router();

staffRouter.get('/list-staff',verifyToken,staffController.listStaff);
staffRouter.get('/customer/list-staff', verifyToken,staffController.listStaffCustomer); 

staffRouter.post('/create-staff', verifyToken,staffController.createStaff);

staffRouter.post('/update-staff/:id', verifyToken,staffController.updateStaff);

staffRouter.get('/customer/staff-details',verifyToken,staffController.staffDetailsForCustomer)

// company detail (used by Staff Details UI)
staffRouter.get('/customer/company-detail/:id', verifyToken,staffController.companyDetails); // GET /staff/company/:id

export default staffRouter;