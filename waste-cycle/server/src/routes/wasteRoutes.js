// server/src/routes/wasteRoutes.js
import express from 'express';
import { 
  getAllWastes, 
  getWasteById, 
  createWaste, 
  updateWaste, 
  deleteWaste,
  searchWastes
} from '../controllers/wasteController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllWastes);
router.get('/search', searchWastes);
router.get('/:id', getWasteById);

// Protected routes (ต้อง login)
router.post('/', verifyToken, createWaste);
router.put('/:id', verifyToken, updateWaste);
router.delete('/:id', verifyToken, deleteWaste);

export default router;