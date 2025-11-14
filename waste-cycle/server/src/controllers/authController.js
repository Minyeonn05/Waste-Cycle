// server/src/controllers/authController.js
import admin from 'firebase-admin';
import { db } from '../config/firebaseConfig.js';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import asyncHandler from '../middleware/asyncHandler.js'; // 👈 [เพิ่ม]

const clientFirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const clientApp = initializeApp(clientFirebaseConfig, "clientAuthApp");
const clientAuth = getAuth(clientApp);

const usersCollection = db.collection('users');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req, res, next) => {
  const { email, password, displayName, role: requestedRole } = req.body;

  if (!email || !password || !displayName) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ 
      success: false, 
      error: 'กรุณาระบุอีเมล, รหัสผ่าน, และชื่อที่แสดง' 
    });
  }

  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName,
  });

  const user = userRecord.toJSON();

  let role = 'user'; 
  if (email === 'admin888@gmail.com') { // (อีเมลแอดมินของคุณ)
    role = 'admin';
  }

  await admin.auth().setCustomUserClaims(user.uid, { role: role });

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role, 
    createdAt: new Date().toISOString(),
    photoURL: user.photoURL || null,
    farmName: '',
    location: null,
    verified: false
  };
  
  await usersCollection.doc(user.uid).set(userData);
  const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

  res.status(201).json({
    success: true,
    message: 'ลงทะเบียนผู้ใช้สำเร็จ', // 🚨 [แก้ไข]
    data: { ...userData, customToken }
  });
});


/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ 
      success: false, 
      error: 'กรุณาระบุอีเมลและรหัสผ่าน' 
    });
  }
  
  const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
  const user = userCredential.user;

  const userRecord = await admin.auth().getUser(user.uid);
  const role = userRecord.customClaims?.role || 'user';

  const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

  const userDoc = await usersCollection.doc(user.uid).get();
  const userData = userDoc.exists ? userDoc.data() : {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role
  };

  res.status(200).json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ', // 🚨 [แก้ไข]
    data: { ...userData, customToken }
  });
});

/**
 * @desc    Get current user data (API-17)
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'ไม่ได้รับอนุญาต' }); // 🚨 [แก้ไข]
  }
  res.status(200).json({
    success: true,
    data: req.user
  });
});