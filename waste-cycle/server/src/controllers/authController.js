// server/src/controllers/authController.js
import { auth, db } from '../config/firebaseConfig.js';
import { validateEmail } from '../utils/validation.js';

// สมัครสมาชิก
export const register = async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    if (role && !['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be buyer or seller'
      });
    }
    
    // สร้าง user ใน Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });
    
    // สร้างโปรไฟล์ใน Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: null,
      role: role || 'buyer', // default เป็น buyer
      phone: '',
      location: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    
    // สร้าง custom token สำหรับ login
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userProfile.role,
        customToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// เข้าสู่ระบบ (สร้าง custom token)
export const login = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // ค้นหา user จาก email
    const userRecord = await auth.getUserByEmail(email);
    
    // ดึงข้อมูลโปรไฟล์จาก Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }
    
    const userData = userDoc.data();
    
    // สร้าง custom token
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userData.displayName,
        role: userData.role,
        customToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// ดึงข้อมูลผู้ใช้ปัจจุบัน
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // ดึงข้อมูลจาก Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
};