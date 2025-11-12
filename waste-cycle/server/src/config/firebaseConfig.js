// server/src/config/firebaseConfig.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp;

try {
  // Initialize Firebase Admin SDK
  // Option 1: Use Service Account Key file (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Handle both absolute and relative paths
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.startsWith('.')
      ? join(__dirname, '..', '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8')
    );
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('✅ Firebase initialized with service account file');
  } 
  // Option 2: Use environment variables (for development/deployment)
  else if (process.env.FIREBASE_PROJECT_ID) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('✅ Firebase initialized with environment variables');
  } else {
    throw new Error('Firebase configuration not found in environment variables');
  }

  console.log('🔥 Firebase Admin SDK initialized successfully');
  console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID || 'from service account'}`);
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}

// Export Firebase services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const bucket = storage.bucket();

export default admin;