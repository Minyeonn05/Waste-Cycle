// server/src/routes/notificationRoutes.js
import express from 'express';
import { 
  getUserNotifications, 
  markAsRead 
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// การแจ้งเตือนทั้งหมดต้อง Login ก่อน
router.use(verifyToken);

// GET /api/notifications/
router.get('/', getUserNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead);

export default router;