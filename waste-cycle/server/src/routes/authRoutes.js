// server/src/routes/authRoutes.js
import express from 'express';

// 🚨 เราจะลบ /login และ /register ออกจากที่นี่
// เราจะย้าย /status ไปที่ userRoutes.js
const router = express.Router();

// (ไฟล์นี้จะไม่ถูกใช้อีก แต่เราจะเก็บไว้ก่อน)
// เราจะย้าย getAuthStatus ไปที่ userController.js
// router.get('/status', verifyToken, getAuthStatus); 

export default router;