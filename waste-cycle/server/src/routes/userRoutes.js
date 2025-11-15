// server/src/routes/userRoutes.js
import express from 'express';
import {
  createProfile, // 👈 🚨 [แก้ไข] 🚨
  getMe,
  getAllUsers,
} from '../controllers/userController.js'; // 👈 (ไฟล์นี้ export 'createProfile')
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ---------------------------------
// 🚀 (API-16) สร้างโปรไฟล์
// 🚀 (API-17) ดึงโปรไฟล์
// ---------------------------------
router.route('/profile')
  .post(verifyToken, createProfile) // 👈 🚨 [แก้ไข] 🚨
  .get(verifyToken, getMe);

// ---------------------------------
// 🚀 (API-15) ดึงผู้ใช้ทั้งหมด (สำหรับ Admin)
// ---------------------------------
router.route('/')
  .get(verifyToken, requireRole('admin'), getAllUsers);

export default router;