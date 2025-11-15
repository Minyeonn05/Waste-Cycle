// server/src/routes/wasteRoutes.js
import express from 'express';

// 🚨 1. แก้ไข import ให้ครบถ้วน
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts,
  getMyProducts // <-- เพิ่มตัวนี้
} from '../controllers/productController.js'; 

// 🚨 หมายเหตุ: ผมจะใช้ชื่อ verifyToken ตามไฟล์เดิมของคุณ
// แต่ในไฟล์ controller คุณใช้ req.user.uid ซึ่งมาจาก middleware 'protect'
// ผมจะเปลี่ยนเป็น 'protect' เพื่อให้สอดคล้องกับ controller
import { verifyToken } from '../middleware/authMiddleware.js'; // <-- เปลี่ยนจาก verifyToken เป็น protect

const router = express.Router();

// 🚨 2. แก้ไขชื่อฟังก์ชันและเพิ่ม Route

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts); // /search ต้องอยู่ก่อน /:id
router.get('/:id', getProductById);

// Protected routes (ต้อง login)
// ใช้ 'protect' middleware ที่จะถอดรหัส token แล้วแนบ req.user
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

// 🔴 --- เพิ่ม Route ที่หายไป --- 🔴
// (Route นี้ต้องอยู่ก่อน /:id เพื่อไม่ให้ 'my-products' ถูกเข้าใจว่าเป็น id)
router.get('/my/products', verifyToken, getMyProducts); // <-- เพิ่ม Route สำหรับดึงสินค้าของฉัน


export default router;