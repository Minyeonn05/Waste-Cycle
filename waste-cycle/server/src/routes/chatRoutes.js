import express from 'express';
import {
  getChatRooms,
  createChatRoom,
  getChatRoomById,
  postMessage,
  getMessages,
  deleteChatRoom,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getChatRooms);
router.post('/', protect, createChatRoom);
router.get('/:id', protect, getChatRoomById);
router.post('/:id/messages', protect, postMessage);
router.get('/:id/messages', protect, getMessages);
router.delete('/:id', protect, admin, deleteChatRoom);

export default router;