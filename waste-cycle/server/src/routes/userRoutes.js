// server/src/routes/userRoutes.js
import express from 'express';
import { 
  createUserProfile, 
  getMyProfile,
  getUserById,       // 👈 1. Import ฟังก์ชันใหม่
  updateUserProfile  // 👈 1. Import ฟังก์ชันใหม่
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🚨 Endpoint สำหรับสร้างโปรไฟล์ (หลังสมัคร)
router.post('/profile', verifyToken, createUserProfile);

// 🚨 Endpoint สำหรับดึงข้อมูลโปรไฟล์ตัวเอง
router.get('/profile', verifyToken, getMyProfile);

//
// 🚀 --- Route ที่เพิ่มเข้ามา --- 🚀
//

// 🚨 Endpoint ดึงโปรไฟล์คนอื่น (Public)
router.get('/:id', getUserById);

// 🚨 Endpoint อัปเดตโปรไฟล์ (Private - ต้องเป็นเจ้าของ หรือ Admin)
router.put('/:id', verifyToken, updateUserProfile);


export default router;