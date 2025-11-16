import asyncHandler from '../middleware/asyncHandler.js';
import { db, auth } from '../config/firebaseConfig.js';

const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user; 
  if (user) {
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        farmName: user.farmName || '',
        location: user.location || null,
        verified: user.verified || false,
        avatar: user.avatar || '',
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const createUserProfile = asyncHandler(async (req, res) => {
  const { name, farmName, role } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

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

  res.status(201).json({
    success: true,
    user: {
      id: user.uid,
      ...newUserProfile,
    },
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, farmName, location } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    res.status(44);
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

  res.status(200).json({
    success: true,
    user: newDoc.data(),
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const usersSnapshot = await db.collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, count: users.length, users });
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const userDoc = await db.collection('users').doc(userId).get();

  if (userDoc.exists) {
    res.status(200).json({ success: true, user: { id: userDoc.id, ...userDoc.data() } });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserRole = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  const userRef = db.collection('users').doc(userId);
  await userRef.update({ role });

  await auth.setCustomUserClaims(userId, { role });

  res.status(200).json({ success: true, message: 'User role updated' });
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  await db.collection('users').doc(userId).delete();
  await auth.deleteUser(userId);

  res.status(200).json({ success: true, message: 'User deleted' });
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
