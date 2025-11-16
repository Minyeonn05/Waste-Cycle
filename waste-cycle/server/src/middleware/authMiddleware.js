import asyncHandler from './asyncHandler.js';
import admin, { db } from '../config/firebaseConfig.js';
// --- FIX: Remove Client SDK imports ---
// import { collection, query, where, getDocs } from 'firebase/firestore';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the token from the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('ไม่ได้รับอนุญาต, ไม่มี token');
  }

  try {
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // --- FIX: Fetch user profile from Firestore ---
    // Replaced the Client SDK query with the Admin SDK equivalent
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // This case handles if auth is valid but user profile isn't in DB
      res.status(401);
      throw new Error('ไม่ได้รับอนุญาต, ไม่พบข้อมูลผู้ใช้');
    }

    // Attach the user data from Firestore to the request object
    req.user = {
      id: userDoc.id, // Add the document ID (which is the uid)
      ...userDoc.data() // Spread the fields from the document (name, email, role, uid, etc.)
    };
    // --- END FIX ---

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401);
    throw new Error('ไม่ได้รับอนุญาต, token ไม่ถูกต้อง');
  }
});

// This middleware just verifies the token and attaches the UID
// Used for creating a profile (protectTokenOnly)
const protectTokenOnly = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('ไม่ได้รับอนุญาต, ไม่มี token');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Attach minimal auth info (uid and email)
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    res.status(401);
    throw new Error('ไม่ได้รับอนุญาต, token ไม่ถูกต้อง');
  }
});


// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('ไม่ได้รับอนุญาต, ต้องการสิทธิ์ผู้ดูแลระบบ');
  }
};

export { protect, protectTokenOnly, adminOnly };