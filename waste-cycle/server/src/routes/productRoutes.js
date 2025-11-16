import express from 'express';
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { seller } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllProducts) // Public route
  .post(protect, seller, createProduct);

router.route('/:id')
  .get(getProductById) // Public route
  .put(protect, seller, updateProduct)
  .delete(protect, seller, deleteProduct);

export default router;