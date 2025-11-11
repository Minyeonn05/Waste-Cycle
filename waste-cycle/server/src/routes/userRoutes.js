// server/src/routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserWastes,
  getUserPosts
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - ต้อง login ทั้งหมด
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.get('/my-wastes', verifyToken, getUserWastes);
router.get('/my-posts', verifyToken, getUserPosts);

export default router;