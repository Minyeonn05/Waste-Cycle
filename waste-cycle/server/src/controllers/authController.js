// server/src/controllers/authController.js
import { auth, db } from '../config/firebaseConfig.js';
import { validateEmail } from '../utils/validation.js';

/**
 * สมัครสมาชิกด้วย Email/Password
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, location, phone, photoURL, role } = req.body;
    
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

    // ตรวจสอบ role (ถ้ามีส่งมา)
    // Default = user, ห้ามสมัครเป็น admin ผ่าน API นี้
    let userRole = 'user';
    if (role && role !== 'user') {
      return res.status(400).json({
        success: false,
        error: 'Cannot register as admin through this endpoint',
        code: 'INVALID_ROLE'
      });
    }
    
    // สร้าง user ใน Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || email.split('@')[0],
      photoURL: photoURL || null,
      emailVerified: false
    });
    
    // สร้างโปรไฟล์ใน Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      location: location || '',
      phone: phone || '',
      role: userRole, // default = 'user'
      provider: 'password',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    
    // สร้าง custom token สำหรับ client
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: userRole
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRole,
        customToken,
        requiresEmailVerification: true
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'Password is too weak',
        code: 'WEAK_PASSWORD'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
};

/**
 * เข้าสู่ระบบ (สร้าง custom token)
 * POST /api/auth/login
 * รองรับทั้ง Email/Password และ Google Sign-In
 */
export const login = async (req, res) => {
  try {
    const { email, idToken } = req.body;
    
    let userRecord;
    let isGoogleSignIn = false;
    
    // กรณีที่ 1: Login ด้วย Google (ส่ง idToken มา)
    if (idToken) {
      try {
        // ตรวจสอบ Google ID Token
        const decodedToken = await auth.verifyIdToken(idToken);
        userRecord = await auth.getUser(decodedToken.uid);
        isGoogleSignIn = true;
      } catch (tokenError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Google ID token',
          code: 'INVALID_TOKEN'
        });
      }
    } 
    // กรณีที่ 2: Login ด้วย Email (Backend สร้าง custom token)
    else if (email) {
      userRecord = await auth.getUserByEmail(email);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Email or ID token is required'
      });
    }
    
    // ดึงหรือสร้างข้อมูลผู้ใช้ใน Firestore
    let userDoc = await db.collection('users').doc(userRecord.uid).get();
    let userData;
    
    if (!userDoc.exists) {
      // สร้างข้อมูลใหม่สำหรับผู้ใช้ (กรณี Google Sign-In ครั้งแรก)
      userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || email?.split('@')[0] || 'User',
        photoURL: userRecord.photoURL || null,
        location: '',
        phone: '',
        role: 'user', // default = user
        provider: isGoogleSignIn ? 'google.com' : 'password',
        emailVerified: userRecord.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('users').doc(userRecord.uid).set(userData);
    } else {
      // อัปเดตข้อมูลที่มีอยู่
      userData = userDoc.data();
      
      // อัปเดต timestamp และข้อมูลจาก Firebase Auth
      await db.collection('users').doc(userRecord.uid).update({
        displayName: userRecord.displayName || userData.displayName,
        photoURL: userRecord.photoURL || userData.photoURL,
        emailVerified: userRecord.emailVerified,
        updatedAt: new Date().toISOString()
      });
      
      userData.updatedAt = new Date().toISOString();
    }
    
    // สร้าง custom token พร้อม role claim
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: userData.role
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        emailVerified: userRecord.emailVerified,
        customToken,
        provider: isGoogleSignIn ? 'google.com' : 'password'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        message: 'No user found with this email'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // ดึงข้อมูลล่าสุดจาก Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }
    
    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        location: userData.location,
        phone: userData.phone,
        role: userData.role,
        provider: userData.provider,
        emailVerified: req.user.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
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

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }
    
    // ตรวจสอบ token ปัจจุบัน
    const decodedToken = await auth.verifyIdToken(idToken, true);
    
    // ดึง role จาก Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data().role : 'user';
    
    // สร้าง custom token ใหม่พร้อม role
    const newCustomToken = await auth.createCustomToken(decodedToken.uid, {
      role: userRole
    });
    
    // อัปเดต timestamp ใน Firestore
    await db.collection('users').doc(decodedToken.uid).update({
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        uid: decodedToken.uid,
        role: userRole,
        customToken: newCustomToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please login again'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Token revoked',
        code: 'TOKEN_REVOKED',
        message: 'Please login again'
      });
    }
    
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      message: error.message
    });
  }
};

/**
 * อัปเดตโปรไฟล์ผู้ใช้
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { displayName, photoURL, location, phone } = req.body;
    
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    // อัปเดตเฉพาะฟิลด์ที่ส่งมา
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    
    // อัปเดตใน Firestore
    await db.collection('users').doc(userId).update(updateData);
    
    // อัปเดตใน Firebase Auth (บางฟิลด์)
    if (displayName || photoURL) {
      const authUpdateData = {};
      if (displayName) authUpdateData.displayName = displayName;
      if (photoURL) authUpdateData.photoURL = photoURL;
      
      await auth.updateUser(userId, authUpdateData);
    }
    
    // ดึงข้อมูลล่าสุด
    const userDoc = await db.collection('users').doc(userId).get();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userDoc.data()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * ⭐ อัปเดต role ของผู้ใช้ (Admin เท่านั้น)
 * PUT /api/auth/users/:userId/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // ตรวจสอบว่า role ที่ส่งมาถูกต้องหรือไม่
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "user" or "admin"'
      });
    }
    
    // ตรวจสอบว่า user มีอยู่จริงหรือไม่
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // ห้ามลด role ของตัวเอง
    if (userId === req.user.uid && role === 'user') {
      return res.status(400).json({
        success: false,
        error: 'Cannot demote yourself',
        message: 'You cannot change your own admin role to user'
      });
    }
    
    // อัปเดต role ใน Firestore
    await db.collection('users').doc(userId).update({
      role: role,
      updatedAt: new Date().toISOString()
    });
    
    // ดึงข้อมูลล่าสุด
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUserDoc.data()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

/**
 * ⭐ ดึงรายชื่อผู้ใช้ทั้งหมด (Admin เท่านั้น)
 * GET /api/auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, role, search } = req.query;
    
    let query = db.collection('users').orderBy('createdAt', 'desc');
    
    // Filter by role
    if (role && ['user', 'admin'].includes(role)) {
      query = query.where('role', '==', role);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    let users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      
      // Search filter (email or displayName)
      if (search) {
        const searchLower = search.toLowerCase();
        if (!userData.email?.toLowerCase().includes(searchLower) &&
            !userData.displayName?.toLowerCase().includes(searchLower)) {
          return;
        }
      }
      
      // ไม่ส่ง sensitive data
      users.push({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt
      });
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};