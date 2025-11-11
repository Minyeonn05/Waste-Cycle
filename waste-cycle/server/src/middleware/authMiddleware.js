// server/src/middleware/authMiddleware.js
import { auth, db } from '../config/firebaseConfig.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // ตรวจสอบ token กับ Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // ดึงข้อมูล role จาก Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // เพิ่มข้อมูล user เข้าไปใน request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || userData.displayName,
      photoURL: decodedToken.picture || userData.photoURL,
      emailVerified: decodedToken.email_verified,
      role: userData.role || 'buyer' // buyer, seller, admin
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};