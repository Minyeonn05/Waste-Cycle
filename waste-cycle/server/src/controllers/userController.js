// server/src/controllers/userController.js
import { db, admin } from '../config/firebaseConfig.js';

// 🚨 1. สร้าง: ฟังก์ชันสร้างโปรไฟล์ใน Firestore
export const createUserProfile = async (req, res) => {
  try {
    // 1. ดึงข้อมูลจาก Body และ Token
    const { name, farmName, role } = req.body;
    const { uid, email } = req.user; // <-- มาจาก verifyToken

    // 2. สร้างออบเจ็กต์โปรไฟล์
    const userProfile = {
      uid: uid,
      email: email,
      name: name,
      farmName: farmName || null,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      verified: false, // หรือ true ถ้าคุณเชื่อถือการสมัครผ่าน Firebase
    };

    // 3. บันทึกลง Firestore
    await db.collection('users').doc(uid).set(userProfile);

    // 4. (สำคัญ) ตั้ง Role ใน Firebase Auth
    // เพื่อให้ verifyToken รู้จัก role ในอนาคต
    await admin.auth().setCustomUserClaims(uid, { role: userProfile.role });

    console.log(`✅ Profile created for: ${email} (UID: ${uid})`);
    res.status(201).json({ success: true, user: userProfile });

  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to create profile' });
  }
};

// 🚨 2. สร้าง: ฟังก์ชันดึงข้อมูลโปรไฟล์ตัวเอง
// (นี่คือ 'getAuthStatus' ที่ย้ายมา)
export const getMyProfile = async (req, res) => {
  try {
    const { uid } = req.user; // <-- มาจาก verifyToken
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    res.status(200).json({ success: true, user: userDoc.data() });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// ... (ฟังก์ชันเดิมของคุณ เช่น getUserById, updateUser ฯลฯ) ...