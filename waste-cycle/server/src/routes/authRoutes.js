// server/src/routes/authRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  refreshToken,
  updateProfile,
  updateUserRole,
  getAllUsers
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// =====================================
// Public routes (ไม่ต้อง authentication)
// =====================================

// สมัครสมาชิกด้วย Email/Password
// Body: { email, password, name, location, phone, photoURL }
router.post('/register', register);

// เข้าสู่ระบบ
// Body: { email } สำหรับ Email/Password
// Body: { idToken } สำหรับ Google Sign-In
router.post('/login', login);

// Refresh token
// Body: { idToken }
router.post('/refresh', refreshToken);

// =====================================
// Protected routes (ต้องมี Bearer token)
// =====================================

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', verifyToken, getCurrentUser);

// อัปเดตโปรไฟล์ของตัวเอง
// Body: { displayName, photoURL, location, phone }
router.put('/profile', verifyToken, updateProfile);

// =====================================
// Admin only routes
// =====================================

// ดึงรายชื่อผู้ใช้ทั้งหมด
// Query: ?limit=50&role=user&search=john
router.get('/users', verifyToken, requireAdmin, getAllUsers);

// อัปเดต role ของผู้ใช้
// Body: { role: 'user' | 'admin' }
router.put('/users/:userId/role', verifyToken, requireAdmin, updateUserRole);

export default router;