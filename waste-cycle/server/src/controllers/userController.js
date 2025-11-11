// server/src/controllers/userController.js
import { db } from '../config/firebaseConfig.js';

const usersCollection = db.collection('users');

// ดึงข้อมูลผู้ใช้ตาม ID (สำหรับดูโปรไฟล์คนอื่น)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await usersCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = doc.data();
    
    // ส่งข้อมูลที่เป็น public เท่านั้น
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
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};