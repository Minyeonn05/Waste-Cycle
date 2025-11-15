// server/src/middleware/authMiddleware.js
import { auth, db } from '../config/firebaseConfig.js';

/**
 * ✅ Middleware ที่แก้ไขปัญหา "Chicken-and-Egg" แล้ว
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
    
    // 1. ตรวจสอบ Token (เหมือนเดิม)
    const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true
    
    // --- 🚨 START: ส่วนที่แก้ไข ---

    // 2. ดึงข้อมูล "พื้นฐาน" จาก Token (มีแน่นอน)
    const baseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role: decodedToken.role || 'user' // เอา Role จาก Token มาเป็นค่าเริ่มต้น
    };

    // 3. "พยายาม" ดึงโปรไฟล์จาก Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      // 4A. ถ้ามีโปรไฟล์: ให้ใช้ข้อมูลจากโปรไฟล์ (ดีกว่าและอัปเดตกว่า)
      const firestoreData = userDoc.data();
      req.user = {
        ...baseUser,
        ...firestoreData, // ทับข้อมูลด้วย data จาก Firestore (เช่น name, farmName)
        role: firestoreData.role || baseUser.role // (สำคัญ) ยึด Role จาก Firestore เป็นหลัก
      };
    } else {
      // 4B. 🚨 ถ้าไม่มีโปรไฟล์ (เช่น ตอนกำลังจะสร้าง):
      // นี่ไม่ใช่ Error! แค่ส่งข้อมูลพื้นฐานจาก Token ไปให้ Controller
      req.user = baseUser;
    }
    
    // --- 🚨 END: ส่วนที่แก้ไข ---

    // (Optional) เพิ่มข้อมูล Debug
    req.user.tokenIssuedAt = new Date(decodedToken.iat * 1000).toISOString();
    req.user.tokenExpireAt = new Date(decodedToken.exp * 1000).toISOString();
    
    console.log(`✅ Auth Success: ${req.user.email} (${req.user.uid}) [Role: ${req.user.role}]`);
    
    next();

  } catch (error) {
    console.error('❌ Token verification error:', error.code, error.message);
    
    // (ส่วนจัดการ Error อื่นๆ เหมือนเดิม)
    
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
 * (อันนี้เหมือนเดิม ไม่ต้องแก้)
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