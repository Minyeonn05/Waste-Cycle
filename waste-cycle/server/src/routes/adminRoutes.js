// server/src/routes/adminRoutes.js
import express from 'express';
import { 
  getAllUsers, 
  verifyFarmByUserId, // 👈 [แก้ไข] เปลี่ยนชื่อฟังก์ชัน
  removePost, 
  getReports 
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ล็อกทุก Route ในไฟล์นี้ให้ Admin เท่านั้น
router.use(verifyToken, requireAdmin);

// API-22
// GET /api/admin/users
router.get('/users', getAllUsers);

// 🚨 [แก้ไข] เปลี่ยน Route
// (API-23)
// PUT /api/admin/verify-farm-by-user/:userId
router.put('/verify-farm-by-user/:userId', verifyFarmByUserId);

// API-24
// DELETE /api/admin/remove-post/:id
router.delete('/remove-post/:id', removePost);

// API-25
// GET /api/admin/reports
router.get('/reports', getReports);

export default router;