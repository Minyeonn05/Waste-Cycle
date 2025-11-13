// server/src/routes/wasteRoutes.js
import express from 'express';

// 🚨 1. แก้ไขชื่อ import ให้ตรงกับ productController.js
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts
} from '../controllers/productController.js'; 

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🚨 2. แก้ไขชื่อฟังก์ชันที่เรียกใช้ให้ตรงกัน
// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes (ต้อง login)
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;