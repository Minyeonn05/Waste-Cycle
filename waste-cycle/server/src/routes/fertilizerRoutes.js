// server/src/routes/fertilizerRoutes.js
import express from 'express';
import {
  getFertilizerAdvice,
  getSupportedMaterialsList,
  getSupportedCropsList
} from '../controllers/fertilizerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (ไม่ต้อง login ก็ใช้ได้)
router.get('/materials', getSupportedMaterialsList);
router.get('/crops', getSupportedCropsList);

// Protected route
router.post('/fertilizer', verifyToken, getFertilizerAdvice);

export default router;