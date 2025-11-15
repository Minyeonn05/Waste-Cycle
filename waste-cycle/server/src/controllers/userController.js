// server/src/controllers/userController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js';

const usersCollection = db.collection('users');

/**
 * @desc    Create or Update user profile (API-16)
 * @route   POST /api/users/profile
 * @access  Private
 */
export const createProfile = asyncHandler(async (req, res, next) => {
  const { name, farmName, role } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อ' });
  }

  // ข้อมูลโปรไฟล์ (อ้างอิงจาก App.tsx)
  const newProfile = {
    uid: req.user.uid,
    email: req.user.email,
    name: name,
    role: role || 'user',
    farmName: farmName || '',
    verified: false,
    photoURL: req.user.photoURL || null,
    createdAt: new Date().toISOString(),
  };

  // ใช้ .set() แทน .add() เพื่อให้แน่ใจว่าเป็นการสร้าง/ทับที่ UID เดิม
  await usersCollection.doc(req.user.uid).set(newProfile);
  
  res.status(201).json({
    success: true,
    data: newProfile
  });
});

/**
 * @desc    Get current user profile (API-17)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const userDocRef = usersCollection.doc(req.user.uid);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    // 🚨 [แก้ไข] 👈 นี่คือจุดที่แก้ปัญหา 🚨
    // ถ้า User มี Auth (req.user) แต่ไม่มี Profile ใน DB... ให้สร้างเลย
    console.warn(`[getMe] User ${req.user.uid} not found in Firestore. Creating new profile...`);
    
    // ดึงข้อมูลพื้นฐานจาก Token (ที่ middleware ส่งมา)
    const newProfile = {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.displayName || req.user.email.split('@')[0] || 'New User',
      role: req.user.role || 'user',
      farmName: '',
      verified: false,
      photoURL: req.user.photoURL || null,
      createdAt: new Date().toISOString(),
    };

    // สร้างโปรไฟล์ใหม่ใน Firestore
    await userDocRef.set(newProfile);

    // ส่งโปรไฟล์ใหม่นี้กลับไปให้ Client
    res.status(200).json({
      success: true,
      data: newProfile
    });

  } else {
    // 🚨 (ของเดิม) ถ้า User มี Profile อยู่แล้ว ก็ส่งกลับไปปกติ
    res.status(200).json({
      success: true,
      data: userDoc.data()
    });
  }
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const snapshot = await usersCollection.get();
  const users = [];
  snapshot.forEach(doc => {
    users.push({ id: doc.id, ...doc.data() });
  });
  res.status(200).json({ success: true, count: users.length, data: users });
});