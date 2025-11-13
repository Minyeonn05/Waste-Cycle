// server/src/routes/marketRoutes.js
import express from 'express';
import { getMarketPrices, updateMarketPrice } from '../controllers/marketController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// API-19
router.get('/price', getMarketPrices);

// API-20
router.post('/update', verifyToken, requireAdmin, updateMarketPrice);

export default router;