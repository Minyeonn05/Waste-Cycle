// server/src/routes/userRoutes.js
import express from 'express';
import { getUserById } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route
router.get('/:id', verifyToken, getUserById);

export default router;