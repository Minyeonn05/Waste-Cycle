// server/src/middleware/authMiddleware.js
import { auth, db } from '../config/firebaseConfig.js';

/**
 * Middleware สำหรับตรวจสอบ Firebase ID Token
 * รองรับทั้ง Email/Password และ Google Sign-In
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // ตรวจสอบ Firebase ID Token
    const decodedToken = await auth.verifyIdToken(token);
    
    // ดึงข้อมูลผู้ใช้จาก Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      // ถ้ายังไม่มีข้อมูลใน Firestore ให้สร้างใหม่
      const userData = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || '',
        photoURL: decodedToken.picture || null,
        provider: decodedToken.firebase.sign_in_provider, // password, google.com, etc.
        emailVerified: decodedToken.email_verified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('users').doc(decodedToken.uid).set(userData);
      
      req.user = userData;
    } else {
      // ใช้ข้อมูลจาก Firestore
      req.user = {
        uid: decodedToken.uid,
        ...userDoc.data()
      };
    }
    
    // เพิ่มข้อมูลจาก token
    req.user.emailVerified = decodedToken.email_verified;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please refresh your token'
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
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN',
        message: 'Token must be a valid Firebase ID token'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Optional middleware: ตรวจสอบว่า email verified หรือยัง
 */
export const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email not verified',
      message: 'Please verify your email address first'
    });
  }

  next();
};