// server/src/routes/adminRoutes.js
import express from 'express';
import { 
  getAllUsers, 
  verifyFarm, 
  removePost, 
  getReports 
} from '../controllers/adminController.js'; // 👈 ดึงมาจาก adminController

import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js'; // 👈 [สำคัญ] ต้องเป็น Admin เท่านั้น

const router = express.Router();

// ----------------------------------------------------------------
// 🔐 [Middleware] ล็อกทุก Route ในไฟล์นี้
// ----------------------------------------------------------------
// หมายความว่า ทุก API ในไฟล์นี้ ต้อง "Login" (verifyToken)
// และ ต้อง "เป็น Admin" (requireAdmin) ถึงจะเรียกใช้ได้
router.use(verifyToken, requireAdmin);

// ----------------------------------------------------------------
// 🚀 API Routes
// ----------------------------------------------------------------

// (API-22) ดูรายชื่อผู้ใช้ทั้งหมด
// GET /api/admin/users
router.get('/users', getAllUsers);

// (API-23) ยืนยันฟาร์ม
// PUT /api/admin/verify-farm/:id
router.put('/verify-farm/:id', verifyFarm);

// (API-24) ลบโพสต์ที่ไม่เหมาะสม
// DELETE /api/admin/remove-post/:id
router.delete('/remove-post/:id', removePost);

// (API-25) ดูรายงานสรุป
// GET /api/admin/reports
router.get('/reports', getReports);

export default router;