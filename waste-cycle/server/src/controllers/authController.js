// server/src/controllers/authController.js
import { db, auth } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Check if we're using mock mode
const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

// Get users collection helper
const getUsersCollection = () => {
  if (!db) return null;
  return db.collection('users');
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req, res, next) => {
  const { email, password, displayName, role: requestedRole } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ 
      success: false, 
      error: 'กรุณาระบุอีเมล, รหัสผ่าน, และชื่อที่แสดง' 
    });
  }

  // Mock mode - return mock user
  if (USE_MOCK_AUTH || !auth) {
    const mockUser = {
      uid: Date.now().toString(),
      email,
      displayName,
      role: requestedRole || (email.includes('admin') ? 'admin' : 'user'),
      createdAt: new Date().toISOString(),
      photoURL: null,
      farmName: '',
      location: null,
      verified: true,
      customToken: 'mock-token-' + Date.now()
    };

    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนผู้ใช้สำเร็จ (mock mode)',
      data: mockUser
    });
  }

  // Firebase mode
  try {
    const admin = (await import('firebase-admin')).default;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const user = userRecord.toJSON();

    let role = 'user'; 
    if (email === 'admin888@gmail.com' || requestedRole === 'admin') {
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
    
    const usersCollection = getUsersCollection();
    if (usersCollection) {
      await usersCollection.doc(user.uid).set(userData);
    }

    const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนผู้ใช้สำเร็จ',
      data: { ...userData, customToken }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});


/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'กรุณาระบุอีเมลและรหัสผ่าน' 
    });
  }

  // Mock mode - return mock user
  if (USE_MOCK_AUTH || !auth) {
    const mockUser = {
      uid: Date.now().toString(),
      email,
      displayName: email.includes('admin') ? 'ผู้ดูแลระบบ' : 'สมชาย เกษตรกร',
      role: email.includes('admin') ? 'admin' : 'user',
      photoURL: null,
      farmName: email.includes('admin') ? undefined : 'ฟาร์มของฉัน',
      location: null,
      verified: true,
      customToken: 'mock-token-' + Date.now()
    };

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ (mock mode)',
      data: mockUser
    });
  }

  // Firebase mode - use Admin SDK to verify credentials
  try {
    const admin = (await import('firebase-admin')).default;
    
    // Note: Firebase Admin SDK doesn't have signInWithEmailAndPassword
    // This should be handled client-side, but for backend we can verify token
    // For now, return error suggesting client-side login
    res.status(400).json({
      success: false,
      error: 'Login should be handled client-side with Firebase Auth SDK',
      message: 'Please use Firebase client SDK to login, then send the ID token to backend'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
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