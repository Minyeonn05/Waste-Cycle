// server/src/routes/chatRoutes.js
import express from 'express';
import { initiateChat } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// [POST] /api/chat/initiate
// ใช้ verifyToken เพื่อให้รู้ว่า req.user คือใคร
router.post('/initiate', verifyToken, initiateChat);

export default router;