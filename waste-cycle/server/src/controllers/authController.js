// server/src/controllers/authController.js
import admin from 'firebase-admin';
import { db } from '../config/firebaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth as clientAuth } from '../config/firebaseClientConfig.js'; 

const usersCollection = db.collection('users');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, displayName, role: requestedRole } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email, password, and displayName' 
      });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const user = userRecord.toJSON();

    // 🚨 1. [แก้ไข] Hack Role ตรงนี้ 🚨
    // ---------------------------------
    let role = 'user'; // ปกติเป็น 'user'
    
    // 🚨 2. ใส่อีเมล "แอดมิน" ของคุณตรงนี้ 🚨
    if (email === 'admin888@gmail.com') { // 👈 (ตัวอย่าง) ใส่อีเมลของคุณ
      role = 'admin';
    }
    // ---------------------------------

    // 3. ตั้งค่า Role (Custom Claim)
    await admin.auth().setCustomUserClaims(user.uid, { role: role });

    // 4. สร้างข้อมูล User ใน Firestore Database
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: role, // 👈 5. [แก้ไข] ใช้ Role ที่เราเพิ่งตั้ง
      createdAt: new Date().toISOString(),
      photoURL: user.photoURL || null,
      farmName: '',
      location: null,
      verified: false
    };
    
    await usersCollection.doc(user.uid).set(userData);

    // 6. สร้าง Custom Token สำหรับให้ Client ล็อกอินทันที
    const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { ...userData, customToken }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    let errorMessage = 'Failed to register user';
    let errorCode = 500;

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email is already in use';
      errorCode = 409;
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'Password must be at least 6 characters long';
      errorCode = 400;
    }
    
    res.status(errorCode).json({ 
      success: false, 
      error: errorMessage,
      code: error.code
    });
  }
};


/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }
    
    // 🚨 [หมายเหตุ] โค้ดส่วนนี้ (signInWithEmailAndPassword)
    // 🚨 ไม่ควรใช้ใน Server แต่โค้ดคุณเป็นแบบนี้ ผมจะแก้ให้ทำงานได้ก่อน
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // 2. ดึงข้อมูล Role จาก Custom Claims
    const userRecord = await admin.auth().getUser(user.uid);
    const role = userRecord.customClaims?.role || 'user';

    // 3. สร้าง Custom Token (เพื่อให้ Client ใช้ signInWithCustomToken)
    const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

    // 4. ดึงข้อมูลจาก Firestore
    const userDoc = await usersCollection.doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: role
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { ...userData, customToken }
    });

  } catch (error) {
    console.error('Login Error:', error);
    let errorMessage = 'Login failed';
    let errorCode = 500;

    if (error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password';
      errorCode = 401;
    }
    
    res.status(errorCode).json({ 
      success: false, 
      error: errorMessage,
      code: error.code 
    });
  }
};