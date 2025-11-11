// server/src/controllers/userController.js
import { db } from '../config/firebaseConfig.js';

const usersCollection = db.collection('users');
const wastesCollection = db.collection('wastes');
const postsCollection = db.collection('community_posts');

// ดึงข้อมูลโปรไฟล์
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const doc = await usersCollection.doc(userId).get();
    
    if (!doc.exists) {
      // สร้างโปรไฟล์ใหม่ถ้ายังไม่มี
      const newProfile = {
        uid: userId,
        email: req.user.email,
        displayName: req.user.displayName || 'User',
        photoURL: req.user.photoURL || null,
        userType: 'farmer', // farmer หรือ buyer
        location: '',
        phone: '',
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await usersCollection.doc(userId).set(newProfile);
      
      return res.json({
        success: true,
        data: newProfile
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
};

// อัพเดตโปรไฟล์
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // ลบฟิลด์ที่ไม่ควรแก้ไข
    delete updateData.uid;
    delete updateData.email;
    delete updateData.createdAt;
    
    await usersCollection.doc(userId).set(updateData, { merge: true });
    
    const updatedDoc = await usersCollection.doc(userId).get();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// ดึงรายการมูลสัตว์ของผู้ใช้
export const getUserWastes = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await wastesCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const wastes = [];
    snapshot.forEach(doc => {
      wastes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: wastes.length,
      data: wastes
    });
  } catch (error) {
    console.error('Get user wastes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user wastes'
    });
  }
};

// ดึงโพสต์ของผู้ใช้
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await postsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const posts = [];
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user posts'
    });
  }
};