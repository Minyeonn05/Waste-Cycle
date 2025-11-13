// server/src/controllers/adminController.js
import { db } from '../config/firebaseConfig.js';
import admin from 'firebase-admin';

const usersCollection = db.collection('users');
const farmsCollection = db.collection('farms');
const communityPostsCollection = db.collection('community_posts');
const reportsCollection = db.collection('reports'); // สมมติว่ามี collection นี้

/**
 * @desc    (Admin) ดูรายชื่อผู้ใช้ทั้งหมด (API-22)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
};

/**
 * @desc    (Admin) ยืนยันฟาร์ม (API-23)
 * @route   PUT /api/admin/verify-farm/:id
 * @access  Admin
 */
export const verifyFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const farmRef = farmsCollection.doc(id);
    const doc = await farmRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }

    // ตั้งค่า farm.verified = true
    await farmRef.update({
      verified: true,
      updatedAt: new Date().toISOString()
    });
    
    // (Optional) อัปเดต role ของ user เจ้าของฟาร์ม
    const userId = doc.data().userId;
    if (userId) {
      await admin.auth().setCustomUserClaims(userId, { role: 'seller' });
      await usersCollection.doc(userId).update({ 
        role: 'seller',
        verified: true 
      });
    }

    res.json({ success: true, message: 'Farm verified successfully' });
  } catch (error) {
    console.error('Verify Farm Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify farm' });
  }
};

/**
 * @desc    (Admin) ลบโพสต์ที่ไม่เหมาะสม (API-24)
 * @route   DELETE /api/admin/remove-post/:id
 * @access  Admin
 */
export const removePost = async (req, res) => {
  try {
    const { id } = req.params;
    // เราจะลบจาก community_posts ตามที่วิเคราะห์ไว้
    const postRef = communityPostsCollection.doc(id); 
    const doc = await postRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    await postRef.delete();
    res.json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove post' });
  }
};

/**
 * @desc    (Admin) ดูรายงานสรุป (API-25)
 * @route   GET /api/admin/reports
 * @access  Admin
 */
export const getReports = async (req, res) => {
  try {
    // ดึงจาก collection 'reports' ที่เราจำลองไว้ใน AdminPanel.jsx
    const snapshot = await reportsCollection.where('status', '==', 'pending').get();
    const reports = [];
    snapshot.forEach(doc => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get reports' });
  }
};  