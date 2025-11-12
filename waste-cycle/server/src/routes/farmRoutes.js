// server/src/routes/farmRoutes.js
import express from 'express';
import {
  createFarm,
  getUserFarms,
  getFarmById,
  updateFarm,
  deleteFarm
} from '../controllers/farmController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/', verifyToken, createFarm);
router.get('/my-farms', verifyToken, getUserFarms);
router.get('/:id', verifyToken, getFarmById);
router.put('/:id', verifyToken, updateFarm);
router.delete('/:id', verifyToken, deleteFarm);

export default router;