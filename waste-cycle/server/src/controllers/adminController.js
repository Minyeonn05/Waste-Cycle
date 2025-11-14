// server/src/controllers/adminController.js
import { db } from '../config/firebaseConfig.js';
import admin from 'firebase-admin';
import asyncHandler from '../middleware/asyncHandler.js'; 
import { createNotification } from '../utils/notificationService.js';

const usersCollection = db.collection('users');
const farmsCollection = db.collection('farms');
const communityPostsCollection = db.collection('community_posts');
const reportsCollection = db.collection('reports');

/**
 * @desc    (Admin) ดูรายชื่อผู้ใช้ทั้งหมด (API-22)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
  const users = [];
  snapshot.forEach(doc => {
    // 👈 [แก้ไข] ส่ง uid ไปด้วย
    users.push({ id: doc.id, uid: doc.id, ...doc.data() }); 
  });
  res.json({ success: true, count: users.length, data: users });
});

/**
 * @desc    (Admin) ยืนยันฟาร์ม (โดยใช้ User ID) (API-23)
 * @route   PUT /api/admin/verify-farm-by-user/:userId
 * @access  Admin
 */
export const verifyFarmByUserId = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // 1. ค้นหาฟาร์มโดยใช้ userId
  const farmQuery = farmsCollection.where('userId', '==', userId).limit(1);
  const farmSnapshot = await farmQuery.get();

  if (farmSnapshot.empty) {
    const error = new Error('Farm not found for this user');
    error.status = 404;
    return next(error);
  }

  const farmDoc = farmSnapshot.docs[0];
  const farmId = farmDoc.id;
  const farmName = farmDoc.data().name;

  // 2. อัปเดตฟาร์ม
  await farmsCollection.doc(farmId).update({
    verified: true,
    updatedAt: new Date().toISOString()
  });
  
  // 3. อัปเดต Role ผู้ใช้
  await admin.auth().setCustomUserClaims(userId, { role: 'seller', verified: true, farmName: farmName }); // 👈 [แก้ไข] เพิ่ม verified, farmName
  await usersCollection.doc(userId).update({ 
    role: 'seller',
    verified: true, // (อัปเดตสถานะ verified ที่ User ด้วย)
    farmName: farmName // (อัปเดตชื่อฟาร์มที่ User ด้วย)
  });

  // 4. 👈 [ยิงแจ้งเตือน]
  await createNotification(
    userId,
    'ฟาร์มของคุณผ่านการยืนยันแล้ว',
    `ยินดีด้วย! ฟาร์ม "${farmName}" ของคุณได้รับการอนุมัติแล้ว ตอนนี้คุณสามารถลงขายสินค้าได้`,
    '/dashboard', // (ลิงก์ใน client ที่จะพาไปหน้า Dashboard)
    'admin'
  );

  res.json({ success: true, message: 'ยืนยันฟาร์มและอัปเดต Role ผู้ใช้สำเร็จ' });
});

/**
 * @desc    (Admin) ลบโพสต์ที่ไม่เหมาะสม (API-24)
 * @route   DELETE /api/admin/remove-post/:id
 * @access  Admin
 */
export const removePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // 🚨 [แก้ไข] เราควรลบจาก collection 'products' ไม่ใช่ 'community_posts'
  const postRef = productsCollection.doc(id); 
  const doc = await postRef.get();

  if (!doc.exists) {
    const error = new Error('Post not found in products');
    error.status = 404;
    return next(error);
  }

  await postRef.delete();
  res.json({ success: true, message: 'ลบโพสต์สำเร็จ' });
});

/**
 * @desc    (Admin) ดูรายงานสรุป (API-25)
 * @route   GET /api/admin/reports
 * @access  Admin
 */
export const getReports = asyncHandler(async (req, res, next) => {
  // (โค้ดนี้เป็นการจำลอง ถ้าคุณยังไม่มี collection 'reports' จริง)
  const snapshot = await reportsCollection.where('status', '==', 'pending').get();
  
  if (snapshot.empty) {
    // (ส่ง Mock data กลับไป ถ้ายังไม่มี collection)
     return res.json({ success: true, count: 2, data: [
        { id: 'r1', type: 'post', refId: 'p123_mock', reason: 'ข้อมูลไม่ตรงกับสินค้าจริง', reporter: 'ผู้ใช้ A', date: '2024-11-10', status: 'pending', targetId: 'p123_mock' },
        { id: 'r2', type: 'user', refId: 'u12_mock', reason: 'พฤติกรรมไม่เหมาะสม', reporter: 'ผู้ใช้ B', date: '2024-11-09', status: 'pending', targetId: 'u12_mock' },
     ]});
  }
  
  const reports = [];
  snapshot.forEach(doc => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  res.json({ success: true, count: reports.length, data: reports });
});