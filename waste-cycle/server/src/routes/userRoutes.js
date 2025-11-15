// server/src/routes/userRoutes.js
import express from 'express';
import { 
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User profile routes (current user)
router.route('/profile')
  .get(verifyToken, getUserProfile)
  .post(verifyToken, createUserProfile)
  .put(verifyToken, updateUserProfile);

// Admin routes
router.get('/', verifyToken, requireAdmin, getAllUsers);

// User by ID route
router.get('/:id', verifyToken, getUserById);

// Admin only routes
router.put('/:id/role', verifyToken, requireAdmin, updateUserRole);
router.delete('/:id', verifyToken, requireAdmin, deleteUser);

export default router;