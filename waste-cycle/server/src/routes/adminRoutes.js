import express from 'express';
import {
  getAdminDashboard,
  manageUsers,
  manageContent,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getAdminDashboard);
router.get('/users', manageUsers);
router.post('/content', manageContent);

export default router;