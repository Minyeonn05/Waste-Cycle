// server/src/routes/analyzeRoutes.js
import express from 'express';
import { analyzeNPK } from '../controllers/analyzeController.js';

const router = express.Router();

// API-18
router.post('/npk', analyzeNPK);

export default router;