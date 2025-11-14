// server/src/routes/authRoutes.js
import express from 'express';

// 🚨 1. [แก้ไข] ลบ ', getCurrentUser' ออกจากบรรทัดนี้ 🚨
import { register, login } from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (ตัวอย่าง ถ้าคุณจะเพิ่ม)
// 🚨 2. [อธิบาย]
// ถ้าคุณอยากได้ "Current User" ใน API
// คุณแค่ต้องใช้ middleware 'verifyToken'
// แล้ว Server จะรู้เองว่า "req.user" คือใคร (ดูตัวอย่างใน chatRoutes.js)
//
// router.get('/me', verifyToken, (req, res) => {
//   res.json(req.user); 
// });

export default router;