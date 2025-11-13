// server/src/routes/visualizationRoutes.js
import express from 'express';
import { getCycleData } from '../controllers/visualizationController.js';

const router = express.Router();

// API-21
router.get('/cycle', getCycleData);

export default router;