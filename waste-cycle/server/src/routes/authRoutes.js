// server/src/routes/authRoutes.js
import express from 'express';
const router = express.Router();

// 🚨 เราจงใจลบ routes /register, /login, /status ออกทั้งหมด
// routes เหล่านี้ถูกแทนที่ด้วย:
// 1. Firebase Client SDK (สำหรับ Login/Register)
// 2. /api/users/profile (สำหรับสร้างและดึงข้อมูล User)

export default router;