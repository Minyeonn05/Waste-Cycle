// server/src/middleware/authMiddleware.js
import { auth, db } from '../config/firebaseConfig.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token, true);

    // 2. ดึงข้อมูล "พื้นฐาน" จาก Token
    const baseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role: decodedToken.role || 'user'
    };

    // 3. "พยายาม" ดึงโปรไฟล์จาก Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      // 4A. ถ้ามีโปรไฟล์: ใช้ข้อมูลจากโปรไฟล์
      const firestoreData = userDoc.data();
      req.user = {
        ...baseUser,
        ...firestoreData,
        role: firestoreData.role || baseUser.role
      };
    } else {
      // 4B. 🚨 ถ้าไม่มีโปรไฟล์ (เช่น ตอนกำลังจะสร้าง):
      // ส่งข้อมูลพื้นฐานจาก Token ไปให้ Controller
      req.user = baseUser;
    }
    
    console.log(`✅ Auth Success: ${req.user.email} (${req.user.uid}) [Role: ${req.user.role}]`);
    next();

  } catch (error) {
    console.error('❌ Token verification error:', error.code, error.message);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
      message: error.message
    });
  }
};

export const requireOwnership = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Resource ID is required' });
    }
    req.resourceUserIdField = resourceUserIdField;
    req.isOwnershipRequired = true;
    next();
  };
};