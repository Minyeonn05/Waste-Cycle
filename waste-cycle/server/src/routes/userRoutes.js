// server/src/routes/userRoutes.js
import express from 'express';
import { 
  createUserProfile, 
  getMyProfile,
  // (เพิ่มฟังก์ชันอื่นๆ ที่คุณมี เช่น getUserById)
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🚨 1. เพิ่ม: Endpoint สำหรับสร้างโปรไฟล์ (หลังสมัคร)
// (ใช้ verifyToken เพื่อให้แน่ใจว่า user สมัครกับ Firebase มาแล้ว)
router.post('/profile', verifyToken, createUserProfile);

// 🚨 2. เพิ่ม: Endpoint สำหรับดึงข้อมูลโปรไฟล์ตัวเอง
// (นี่คือ /api/users/profile ที่ apiService เรียก)
router.get('/profile', verifyToken, getMyProfile);

// ... (Routes เดิมของคุณ เช่น /:id) ...

export default router;