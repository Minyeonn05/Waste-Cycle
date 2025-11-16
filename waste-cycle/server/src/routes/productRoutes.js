// waste-cycle/server/src/routes/productRoutes.js

import express from 'express';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { searchMarket, getProductDetails } from '../controllers/marketController.js';

const router = express.Router();

// Route สำหรับดู/ค้นหาโพสต์ทั้งหมด (Public)
router.route('/').get(searchMarket); 
router.route('/search').get(searchMarket); // Endpoint ที่มีอยู่แล้ว

// Route สำหรับสร้างโพสต์สินค้าใหม่ (ต้องมีการยืนยันตัวตน)
router.route('/').post(protect, createProduct); 

// Route สำหรับจัดการโพสต์สินค้าเฉพาะ
// GET: ดูรายละเอียดสินค้า (Public)
// PUT: สำหรับแก้ไข (ต้องมีการยืนยันตัวตนและเป็นเจ้าของ)
// DELETE: สำหรับลบ (ต้องมีการยืนยันตัวตนและเป็นเจ้าของ)
router.route('/:id')
  .get(getProductDetails) // ใช้ฟังก์ชันจาก marketController สำหรับดูรายละเอียด
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;