// server/src/routes/communityRoutes.js

import express from 'express';
// FIX: นำเข้า createPost, getPosts และ updatePost
import { createPost, getPosts, updatePost } from '../controllers/communityController.js'; 
import { protect } from '../middleware/authMiddleware.js'; 
// import { admin } from '../middleware/roleMiddleware.js'; // (ถ้ามี)

const router = express.Router();

// Route สำหรับสร้างโพสต์ (POST) และดูโพสต์ทั้งหมด (GET)
router.route('/posts')
    .post(protect, createPost) // สร้างโพสต์ใหม่
    .get(protect, getPosts);   // ดึงโพสต์ทั้งหมด

// Route สำหรับแก้ไขโพสต์
router.route('/posts/:id')
     .put(protect, updatePost); // อัปเดตโพสต์ด้วย ID

export default router;