// server/src/controllers/adminController.js
import { db } from '../config/firebaseConfig.js';
import admin from 'firebase-admin';
import asyncHandler from '../middleware/asyncHandler.js'; 
// 1. 👈 [เพิ่ม] Import service แจ้งเตือน
import { createNotification } from '../utils/notificationService.js';

const usersCollection = db.collection('users');
const farmsCollection = db.collection('farms');
const communityPostsCollection = db.collection('community_posts');
const reportsCollection = db.collection('reports'); // (สมมติว่ามี collection นี้)

/**
 * @desc    (Admin) ดูรายชื่อผู้ใช้ทั้งหมด (API-22)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
  const users = [];
  snapshot.forEach(doc => {
    users.push({ id: doc.id, ...doc.data() });
  });
  res.json({ success: true, count: users.length, data: users });
});

/**
 * @desc    (Admin) ยืนยันฟาร์ม (API-23)
 * @route   PUT /api/admin/verify-farm/:id
 * @access  Admin
 */
export const verifyFarm = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const farmRef = farmsCollection.doc(id);
  const doc = await farmRef.get();

  if (!doc.exists) {
    const error = new Error('Farm not found'); // 👈 errorMiddleware จะแปลเป็นไทย
    error.status = 404;
    return next(error);
  }

  // อัปเดตฟาร์ม
  await farmRef.update({
    verified: true,
    updatedAt: new Date().toISOString()
  });
  
  const userId = doc.data().userId;
  const farmName = doc.data().name; // 👈 [เพิ่ม] ดึงชื่อฟาร์ม

  if (userId) {
    // อัปเดต Role ผู้ใช้
    await admin.auth().setCustomUserClaims(userId, { role: 'seller' });
    await usersCollection.doc(userId).update({ 
      role: 'seller',
      verified: true 
    });

    // --- 2. 👈 [เพิ่ม] ยิงแจ้งเตือนหา "เจ้าของฟาร์ม" ---
    await createNotification(
      userId,
      'ฟาร์มของคุณผ่านการยืนยันแล้ว',
      `ยินดีด้วย! ฟาร์ม "${farmName}" ของคุณได้รับการอนุมัติแล้ว ตอนนี้คุณสามารถลงขายสินค้าได้`,
      '/dashboard', // (ลิงก์ใน client ที่จะพาไปหน้า Dashboard)
      'admin'
    );
    // ------------------------------------------------
  }

  res.json({ success: true, message: 'ยืนยันฟาร์มสำเร็จ' }); // 🚨 [แก้ไข]
});

/**
 * @desc    (Admin) ลบโพสต์ที่ไม่เหมาะสม (API-24)
 * @route   DELETE /api/admin/remove-post/:id
 * @access  Admin
 */
export const removePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const postRef = communityPostsCollection.doc(id); 
  const doc = await postRef.get();

  if (!doc.exists) {
    const error = new Error('Post not found'); // 👈 errorMiddleware จะแปลเป็นไทย
    error.status = 404;
    return next(error);
  }

  await postRef.delete();
  res.json({ success: true, message: 'ลบโพสต์สำเร็จ' }); // 🚨 [แก้ไข]
});

/**
 * @desc    (Admin) ดูรายงานสรุป (API-25)
 * @route   GET /api/admin/reports
 * @access  Admin
 */
export const getReports = asyncHandler(async (req, res, next) => {
  const snapshot = await reportsCollection.where('status', '==', 'pending').get();
  const reports = [];
  snapshot.forEach(doc => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  res.json({ success: true, count: reports.length, data: reports });
});