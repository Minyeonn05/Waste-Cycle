import asyncHandler from './asyncHandler.js';
import { auth, db } from '../config/firebaseConfig.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = {
        id: userDoc.id,
        uid: userDoc.id,
        ...userDoc.data(),
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// ใหม่: Middleware นี้ตรวจสอบแค่ Token แต่ไม่ตรวจสอบ Firestore
const protectTokenOnly = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      // 1. ตรวจสอบ Token
      const decodedToken = await auth.verifyIdToken(token);
      
      // 2. แนบข้อมูลจาก Token (uid, email) ไปกับ req
      req.user = decodedToken;
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


export { protect, protectTokenOnly };