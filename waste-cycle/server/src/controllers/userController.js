// server/src/controllers/userController.js
import admin, { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js';

// 🚨 1. สร้าง: ฟังก์ชันสร้างโปรไฟล์ใน Firestore
export const createUserProfile = asyncHandler(async (req, res) => {
  console.log('--- 1. Inside createUserProfile ---');
  
  const { name, farmName, role } = req.body;
  console.log('Body data:', { name, farmName, role });

  // ตรวจสอบว่า middleware ทำงานถูกต้อง
  if (!req.user || !req.user.uid) {
     console.error('❌ CRITICAL: req.user or req.user.uid is missing!');
     // ส่ง Error ที่ชัดเจนกลับไป
     return res.status(500).json({ 
       success: false, 
       error: 'User data not found after authentication' 
     });
  }
  
  const { uid, email } = req.user;
  console.log(`User data from middleware: ${email} (${uid})`);

  const userProfile = {
    uid: uid,
    email: email,
    name: name,
    farmName: farmName || null,
    role: role || 'user',
    createdAt: new Date().toISOString(),
    verified: false,
  };
  
  console.log('--- 2. Saving profile to Firestore ---');
  await db.collection('users').doc(uid).set(userProfile);
  console.log('--- 3. Profile saved to Firestore ---');

  // 🚨🚨🚨
  // 🚨 ยืนยันว่าส่วนนี้ "ปิด" อยู่ (มี // ข้างหน้า)
  // 🚨 นี่คือจุดที่ทำให้ Server พัง
  // 
  // try {
  //   console.log('--- 4. (SKIPPED) Setting Custom Claims ---');
  //   await admin.auth().setCustomUserClaims(uid, { role: userProfile.role });
  //   console.log('--- 5. (SKIPPED) Custom Claims set ---');
  // } catch (claimsError) {
  //   console.error('❌ FAILED to set custom claims:', claimsError);
  // }
  // 🚨🚨🚨

  console.log(`✅ Profile created for: ${email} (UID: ${uid})`);
  // ส่งข้อมูลโปรไฟล์ที่สร้างเสร็จกลับไป
  res.status(201).json({ success: true, user: userProfile });
});


// 🚨 2. ดึงข้อมูลโปรไฟล์ตัวเอง
export const getMyProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user; 
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }

  res.status(200).json({ success: true, user: userDoc.data() });
});


/**
 * 🌎 ดึงโปรไฟล์ผู้ใช้ตาม ID (Public)
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const userDoc = await db.collection('users').doc(id).get();
  
  if (!userDoc.exists) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }
  
  const userData = userDoc.data();
  res.status(200).json({ success: true, user: userData });
});


/**
 * ✅ อัปเดตโปรไฟล์ผู้ใช้ (Private)
 * PUT /api/users/:id
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const { uid: authUserId, role: authUserRole } = req.user; 
  
  if (id !== authUserId && authUserRole !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized to update this profile' });
  }
  
  const { name, farmName, description, photoURL } = req.body;
  const userRef = db.collection('users').doc(id);
  const doc = await userRef.get();
  
  if (!doc.exists) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }
  
  const updateData = {
    name,
    farmName: farmName || null,
    description: description || '',
    photoURL: photoURL || null,
    updatedAt: new Date().toISOString(),
  };

  await userRef.update(updateData);
  const updatedDoc = await userRef.get();
  
  console.log(`✅ Profile updated for: ${updatedDoc.data().email} (UID: ${id})`);
  res.status(200).json({ success: true, user: updatedDoc.data() });
});