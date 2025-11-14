// server/src/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getUserBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/', verifyToken, createBooking);
router.get('/user/:userId', verifyToken, getUserBookings);
router.put('/:id/status', verifyToken, updateBookingStatus);

export default router;