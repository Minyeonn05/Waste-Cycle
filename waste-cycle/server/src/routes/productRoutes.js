// server/src/routes/productRoutes.js
import express from 'express';
import { 
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireSeller } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes (seller only for create)
router.post('/', verifyToken, requireSeller, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;