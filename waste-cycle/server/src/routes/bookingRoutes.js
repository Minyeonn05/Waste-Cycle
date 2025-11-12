// server/src/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getAllBookings
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User routes (ต้อง authentication)
router.post('/', verifyToken, createBooking);
router.get('/user/:userId', verifyToken, getUserBookings);
router.put('/:id/status', verifyToken, updateBookingStatus);

// Admin routes
router.get('/', verifyToken, requireAdmin, getAllBookings);

export default router;