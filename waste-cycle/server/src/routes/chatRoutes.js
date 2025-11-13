// server/src/routes/chatRoutes.js
import express from 'express';
import {
  createOrGetChatRoom,
  getUserChats,
  getChatRoom,
  sendMessage,
  getChatMessages,
  markAsRead,
  deleteChat,
  getAllChats
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User routes (ต้อง login)
router.post('/', verifyToken, createOrGetChatRoom);
router.get('/', verifyToken, getUserChats);
router.get('/:chatId', verifyToken, getChatRoom);
router.post('/:chatId/messages', verifyToken, sendMessage);
router.get('/:chatId/messages', verifyToken, getChatMessages);
router.put('/:chatId/read', verifyToken, markAsRead);
router.delete('/:chatId', verifyToken, deleteChat);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, getAllChats);

export default router;