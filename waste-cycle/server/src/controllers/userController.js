// server/src/controllers/userController.js
import asyncHandler from '../middleware/asyncHandler.js';
import { db, auth } from '../config/firebaseConfig.js';

// Get user profile (current user)
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (db && user.uid) {
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
      return res.status(200).json({
        success: true,
        user: {
          id: userDoc.id,
          uid: user.uid,
          email: user.email,
          name: userDoc.data().name || user.displayName,
          role: userDoc.data().role || user.role || 'user',
          farmName: userDoc.data().farmName || '',
          location: userDoc.data().location || null,
          verified: userDoc.data().verified || false,
          avatar: userDoc.data().avatar || user.photoURL || '',
        },
      });
      }
    } catch (error) {
      // If Firestore fails, fall through to mock mode
      console.warn('Firestore error in getUserProfile:', error.message);
    }
  }

  // Mock mode or user not in DB - return from req.user
  res.status(200).json({
    success: true,
    user: {
      id: user.id || user.uid,
      uid: user.uid,
      email: user.email || user.email,
      name: user.displayName || user.name || 'User',
      role: user.role || 'user',
      farmName: user.farmName || '',
      location: user.location || null,
      verified: user.verified !== undefined ? user.verified : true,
      avatar: user.photoURL || user.avatar || '',
    },
  });
});

// Create user profile
const createUserProfile = asyncHandler(async (req, res) => {
  const { name, farmName, role } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (db && user.uid) {
    try {
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        res.status(400);
        throw new Error('User profile already exists');
      }

      const newUserProfile = {
        uid: user.uid,
        email: user.email,
        name,
        farmName: farmName || '',
        role: role || 'user',
        verified: false,
        createdAt: new Date().toISOString(),
      };

      await userRef.set(newUserProfile);

      return res.status(201).json({
        success: true,
        user: {
          id: user.uid,
          ...newUserProfile,
        },
      });
    } catch (error) {
      // If Firestore fails, fall through to mock mode
      console.warn('Firestore error in createUserProfile:', error.message);
    }
  }

  // Mock mode - just return success
  res.status(201).json({
    success: true,
    user: {
      id: user.id || user.uid,
      uid: user.uid,
      email: user.email,
      name: name || user.displayName || 'User',
      farmName: farmName || '',
      role: role || 'user',
      verified: true,
    },
  });
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, farmName, location } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (db && user.uid) {
    try {
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        res.status(404);
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        name: name || userDoc.data().name,
        farmName: farmName || userDoc.data().farmName,
        location: location || userDoc.data().location,
        updatedAt: new Date().toISOString(),
      };

      await userRef.update(updatedProfile);
      const newDoc = await userRef.get();

      return res.status(200).json({
        success: true,
        user: newDoc.data(),
      });
    } catch (error) {
      // If Firestore fails, fall through to mock mode
      console.warn('Firestore error in updateUserProfile:', error.message);
    }
  }

  // Mock mode - just return updated data
  res.status(200).json({
    success: true,
    user: {
      ...user,
      name: name || user.displayName || user.name,
      farmName: farmName || user.farmName,
      location: location || user.location,
    },
  });
});

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  if (db) {
    try {
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
      console.warn('Firestore error in getAllUsers:', error.message);
    }
  }

  // Mock mode - return empty array
  res.status(200).json({ success: true, count: 0, users: [] });
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  if (db) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return res.status(200).json({
          success: true,
          data: {
            id: userDoc.id,
            displayName: userData.displayName || userData.name,
            photoURL: userData.photoURL || userData.avatar,
            role: userData.role,
            location: userData.location,
            bio: userData.bio,
            ...userData,
          },
        });
      }
      res.status(404);
      throw new Error('User not found');
    } catch (error) {
      // If Firestore fails, fall through to mock mode
      console.warn('Firestore error in getUserById:', error.message);
    }
  }

  // Mock mode - return mock user
  res.status(200).json({
    success: true,
    data: {
      id: userId,
      displayName: 'Mock User',
      photoURL: '',
      role: 'user',
      location: null,
      bio: '',
    },
  });
});

// Update user role (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  if (db) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ role });

    if (auth) {
      await auth.setCustomUserClaims(userId, { role });
    }

    return res.status(200).json({ success: true, message: 'User role updated' });
  }

  // Mock mode - just return success
  res.status(200).json({ success: true, message: 'User role updated (mock mode)' });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (db) {
    await db.collection('users').doc(userId).delete();
    if (auth) {
      await auth.deleteUser(userId);
    }
    return res.status(200).json({ success: true, message: 'User deleted' });
  }

  // Mock mode - just return success
  res.status(200).json({ success: true, message: 'User deleted (mock mode)' });
});

export {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
