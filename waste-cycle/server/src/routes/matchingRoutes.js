// server/src/routes/matchingRoutes.js
import express from 'express';
import {
  createMatching,
  getRecommendations
} from '../controllers/matchingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/', verifyToken, createMatching);
router.get('/recommend/:userId', verifyToken, getRecommendations);

export default router;