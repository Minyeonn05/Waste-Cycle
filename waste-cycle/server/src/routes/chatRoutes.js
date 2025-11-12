// server/src/routes/chatRoutes.js
import express from 'express';
import { initiateChat } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// เราจะใช้ verifyToken เพื่อให้รู้ว่าใครคือ "ผู้ซื้อ" ที่กดแชต
router.post('/initiate', verifyToken, initiateChat);

export default router;