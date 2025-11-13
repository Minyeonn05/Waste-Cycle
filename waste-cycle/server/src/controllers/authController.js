// server/src/controllers/authController.js
import admin from 'firebase-admin';
import { db } from '../config/firebaseConfig.js';

// 🚨 1. [แก้ไข] Import 2 อย่างนี้
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// 🚨 2. [ลบ] import { auth as clientAuth } ... (บรรทัดนี้ทิ้งไป)

// 🚨 3. [เพิ่ม] สร้าง Client App Config จาก .env
const clientFirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// 🚨 4. [เพิ่ม] สร้าง clientAuth ขึ้นมาเอง
const clientApp = initializeApp(clientFirebaseConfig, "clientAuthApp"); // (ตั้งชื่อ App ไม่ให้ซ้ำ)
const clientAuth = getAuth(clientApp);


const usersCollection = db.collection('users');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * (โค้ด Register ... เหมือนเดิม)
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

    let role = 'user'; 
    if (email === 'admin888@gmail.com') { // 👈 (อีเมลแอดมินของคุณ)
      role = 'admin';
    }

    await admin.auth().setCustomUserClaims(user.uid, { role: role });

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: role, 
      createdAt: new Date().toISOString(),
      photoURL: user.photoURL || null,
      farmName: '',
      location: null,
      verified: false
    };
    
    await usersCollection.doc(user.uid).set(userData);
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
    
    // 🚨 5. [แก้ไข] ตอนนี้ clientAuth (ที่สร้างในบรรทัดที่ 18) 
    // จะทำงานได้ถูกต้องแล้ว
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // (โค้ดที่เหลือเหมือนเดิม)
    const userRecord = await admin.auth().getUser(user.uid);
    const role = userRecord.customClaims?.role || 'user';

    const customToken = await admin.auth().createCustomToken(user.uid, { role: role });

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