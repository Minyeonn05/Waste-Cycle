// server/src/middleware/authMiddleware.js
import { auth, db } from '../config/firebaseConfig.js';

/**
 * ✅ Middleware ที่ถูกต้อง - ไม่ใช้ global variable
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // ✅ CRITICAL: ตรวจสอบ token ทุกครั้ง ไม่ cache
    const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true
    
    // ✅ CRITICAL: ดึง role จาก Firestore แบบ real-time
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    
    // ✅ CRITICAL: เก็บข้อมูลใน req เท่านั้น ไม่ใช้ global
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: userData.displayName || decodedToken.name,
      photoURL: userData.photoURL || decodedToken.picture,
      emailVerified: decodedToken.email_verified,
      role: userData.role || 'user',
      // ✅ เพิ่ม timestamp เพื่อ debug
      tokenIssuedAt: new Date(decodedToken.iat * 1000).toISOString(),
      tokenExpireAt: new Date(decodedToken.exp * 1000).toISOString()
    };
    
    // ✅ Log เพื่อ debug (ลบออกใน production)
    console.log(`✅ Auth Success: ${req.user.email} (${req.user.uid})`);
    
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.code, error.message);
    
    // ✅ CRITICAL: ส่ง error code ที่ชัดเจน
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please refresh your token or login again'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Token revoked',
        code: 'TOKEN_REVOKED',
        message: 'Your session has been revoked. Please login again'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
      message: error.message
    });
  }
};

/**
 * ✅ Middleware เพิ่มเติม: ตรวจสอบว่า userId ตรงกับ resource
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    // Resource ID จาก params
    const resourceId = req.params.id;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID is required'
      });
    }
    
    // เก็บไว้ใน req เพื่อใช้ใน controller
    req.resourceUserIdField = resourceUserIdField;
    req.isOwnershipRequired = true;
    
    next();
  };
};