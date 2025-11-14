// server/src/controllers/userController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; // 👈 [เพิ่ม]

const usersCollection = db.collection('users');

// ดึงข้อมูลผู้ใช้ตาม ID
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const doc = await usersCollection.doc(id).get();
  
  if (!doc.exists) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);
  }
  
  const userData = doc.data();
  
  res.json({
    success: true,
    data: {
      id: doc.id,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      location: userData.location,
      bio: userData.bio
    }
  });
});