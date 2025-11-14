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

// ====================================
// User Routes (ต้อง login)
// ====================================

// สร้างหรือดึง chat room
// POST /api/chats
// Body: { productId, sellerId }
router.post('/', verifyToken, createOrGetChatRoom);

// ดึงรายการ chats ทั้งหมดของผู้ใช้
// GET /api/chats
router.get('/', verifyToken, getUserChats);

// ดึงข้อมูล chat room เดี่ยว
// GET /api/chats/:chatId
router.get('/:chatId', verifyToken, getChatRoom);

// ส่งข้อความ
// POST /api/chats/:chatId/messages
// Body: { text, imageUrl?, type? }
router.post('/:chatId/messages', verifyToken, sendMessage);

// ดึงข้อความในแชท
// GET /api/chats/:chatId/messages?limit=50
router.get('/:chatId/messages', verifyToken, getChatMessages);

// ทำเครื่องหมายว่าอ่านแล้ว
// PUT /api/chats/:chatId/read
router.put('/:chatId/read', verifyToken, markAsRead);

// ลบแชท
// DELETE /api/chats/:chatId
router.delete('/:chatId', verifyToken, deleteChat);

// ====================================
// Admin Routes
// ====================================

// ดึงแชททั้งหมดในระบบ (Admin only)
// GET /api/chats/admin/all?limit=100
router.get('/admin/all', verifyToken, requireAdmin, getAllChats);

export default router;