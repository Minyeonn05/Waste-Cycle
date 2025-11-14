// server/src/controllers/adminController.js
import { db } from '../config/firebaseConfig.js';
import admin from 'firebase-admin';
import asyncHandler from '../middleware/asyncHandler.js'; 

const usersCollection = db.collection('users');
const farmsCollection = db.collection('farms');
const communityPostsCollection = db.collection('community_posts');
const reportsCollection = db.collection('reports');

// API-22
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
  const users = [];
  snapshot.forEach(doc => {
    users.push({ id: doc.id, ...doc.data() });
  });
  res.json({ success: true, count: users.length, data: users });
});

// API-23
export const verifyFarm = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const farmRef = farmsCollection.doc(id);
  const doc = await farmRef.get();

  if (!doc.exists) {
    const error = new Error('Farm not found');
    error.status = 404;
    return next(error);
  }

  await farmRef.update({
    verified: true,
    updatedAt: new Date().toISOString()
  });
  
  const userId = doc.data().userId;
  if (userId) {
    await admin.auth().setCustomUserClaims(userId, { role: 'seller' });
    await usersCollection.doc(userId).update({ 
      role: 'seller',
      verified: true 
    });
  }

  res.json({ success: true, message: 'ยืนยันฟาร์มสำเร็จ' }); // 🚨 [แก้ไข]
});

// API-24
export const removePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const postRef = communityPostsCollection.doc(id); 
  const doc = await postRef.get();

  if (!doc.exists) {
    const error = new Error('Post not found');
    error.status = 404;
    return next(error);
  }

  await postRef.delete();
  res.json({ success: true, message: 'ลบโพสต์สำเร็จ' }); // 🚨 [แก้ไข]
});

// API-25
export const getReports = asyncHandler(async (req, res, next) => {
  const snapshot = await reportsCollection.where('status', '==', 'pending').get();
  const reports = [];
  snapshot.forEach(doc => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  res.json({ success: true, count: reports.length, data: reports });
});