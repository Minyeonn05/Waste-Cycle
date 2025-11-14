// server/src/controllers/farmController.js
import { db } from '../config/firebaseConfig.js';
import { validateFarm } from '../utils/validation.js';
import asyncHandler from '../middleware/asyncHandler.js'; 

const farmsCollection = db.collection('farms');

// --- [เพิ่ม] Helper Function (ลดโค้ดซ้ำ) ---
const getFarmAndCheckOwnership = async (farmId, userId) => {
  const doc = await farmsCollection.doc(farmId).get();

  if (!doc.exists) {
    const error = new Error('Farm not found');
    error.status = 404;
    throw error;
  }

  if (doc.data().userId !== userId) {
    const error = new Error('Unauthorized to modify this farm');
    error.status = 403;
    throw error;
  }

  return doc;
};

// สร้างฟาร์มใหม่
export const createFarm = asyncHandler(async (req, res, next) => {
  const { name, type, location, coordinates, area, description, images } = req.body;
  
  const validationErrors = validateFarm({ name, type, location, area });
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, errors: validationErrors });
  }
  
  const userId = req.user.uid;
  
  const farmData = {
    name,
    type, 
    location,
    coordinates: coordinates || null,
    area: area || 0,
    areaUnit: 'rai',
    description: description || '',
    images: images || [],
    userId,
    owner: {
      uid: userId,
      email: req.user.email,
      displayName: req.user.displayName
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await farmsCollection.add(farmData);
  
  res.status(201).json({
    success: true,
    message: 'สร้างฟาร์มสำเร็จ', // 🚨 [แก้ไข]
    data: { id: docRef.id, ...farmData }
  });
});

// ดึงฟาร์มทั้งหมดของผู้ใช้
export const getUserFarms = asyncHandler(async (req, res, next) => {
  const userId = req.user.uid;
  
  const snapshot = await farmsCollection
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  const farms = [];
  snapshot.forEach(doc => {
    farms.push({ id: doc.id, ...doc.data() });
  });
  
  res.json({
    success: true,
    count: farms.length,
    data: farms
  });
});

// ดึงฟาร์มตาม ID
export const getFarmById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const doc = await farmsCollection.doc(id).get();
  
  if (!doc.exists) {
    const error = new Error('Farm not found');
    error.status = 404;
    return next(error);
  }
  
  res.json({
    success: true,
    data: { id: doc.id, ...doc.data() }
  });
});

// อัพเดตฟาร์ม
export const updateFarm = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  await getFarmAndCheckOwnership(id, req.user.uid);
  
  const updateData = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  delete updateData.userId;
  delete updateData.owner;
  delete updateData.createdAt;
  
  await farmsCollection.doc(id).update(updateData);
  const updatedDoc = await farmsCollection.doc(id).get();
  
  res.json({
    success: true,
    message: 'อัปเดตฟาร์มสำเร็จ', // 🚨 [แก้ไข]
    data: { id: updatedDoc.id, ...updatedDoc.data() }
  });
});

// ลบฟาร์ม
export const deleteFarm = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await getFarmAndCheckOwnership(id, req.user.uid);
  
  await farmsCollection.doc(id).delete();
  
  res.json({
    success: true,
    message: 'ลบฟาร์มสำเร็จ' // 🚨 [แก้ไข]
  });
});