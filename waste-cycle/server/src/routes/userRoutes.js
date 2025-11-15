import express from 'express';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .post(protect, createUserProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .get(protect, admin, getAllUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserRole)
  .delete(protect, admin, deleteUser);

export default router;