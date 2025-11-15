// server/src/config/firebaseConfig.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
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
    
    try {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8')
      );
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      console.log('✅ Firebase initialized with service account file');
    } catch (fileError) {
      console.warn(`⚠️  Could not read service account file: ${fileError.message}`);
      throw fileError;
    }
  } 
  // Option 2: Try to find service account file in common locations
  else {
    const possibleDirs = [
      join(__dirname, '..', '..'),
      join(__dirname, '..', '..', '..', 'client', 'src'),
    ];
    
    let serviceAccountPath = null;
    for (const dir of possibleDirs) {
      try {
        const files = readdirSync(dir);
        const serviceAccountFile = files.find(file => 
          file.includes('firebase-adminsdk') && file.endsWith('.json')
        );
        if (serviceAccountFile) {
          serviceAccountPath = join(dir, serviceAccountFile);
          break;
        }
      } catch (e) {
        // Directory doesn't exist, try next directory
      }
    }
    
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8')
      );
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`
      });
      
      console.log('✅ Firebase initialized with service account file (auto-detected)');
    }
    // Option 3: Use environment variables (for development/deployment)
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
      console.error('\n❌ Firebase Admin SDK Configuration Required\n');
      console.error('To run the backend server, you need Firebase Admin SDK credentials.\n');
      console.error('📋 Option 1: Download Service Account JSON (Recommended)');
      console.error('   1. Go to: https://console.firebase.google.com/project/waste-cycle-a6c6e/settings/serviceaccounts/adminsdk');
      console.error('   2. Click "Generate new private key"');
      console.error('   3. Download the JSON file');
      console.error('   4. Place it in: ' + join(__dirname, '..', '..'));
      console.error('   5. The file should be named: waste-cycle-a6c6e-firebase-adminsdk-*.json\n');
      console.error('📋 Option 2: Use Environment Variables');
      console.error('   Create a .env file in the server directory with:');
      console.error('   FIREBASE_PROJECT_ID=waste-cycle-a6c6e');
      console.error('   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@waste-cycle-a6c6e.iam.gserviceaccount.com');
      console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
      console.error('   FIREBASE_STORAGE_BUCKET=waste-cycle-a6c6e.firebasestorage.app\n');
      throw new Error('Firebase configuration not found. See instructions above.');
    }
  }

  console.log('🔥 Firebase Admin SDK initialized successfully');
  console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID || 'from service account'}`);
} catch (error) {
  // Only exit if not using mock auth mode
  if (process.env.USE_MOCK_AUTH !== 'true') {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
  } else {
    console.warn('⚠️  Firebase initialization failed, but continuing in MOCK_AUTH mode');
    console.warn('⚠️  Some features requiring Firebase may not work');
  }
}

// Export Firebase services
// In mock mode, these may be null/undefined but won't crash
let db, auth, storage, bucket;
if (!firebaseApp && process.env.USE_MOCK_AUTH === 'true') {
  // Mock mode - Firebase not initialized
  console.warn('⚠️  Firebase not initialized - using MOCK_AUTH mode');
  db = null;
  auth = null;
  storage = null;
  bucket = null;
} else if (firebaseApp) {
  try {
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    bucket = storage.bucket();
  } catch (error) {
    if (process.env.USE_MOCK_AUTH === 'true') {
      console.warn('⚠️  Firebase services not available in MOCK_AUTH mode');
      db = null;
      auth = null;
      storage = null;
      bucket = null;
    } else {
      throw error;
    }
  }
} else {
  // Firebase not initialized and not in mock mode
  db = null;
  auth = null;
  storage = null;
  bucket = null;
}

export { db, auth, storage, bucket };
export default admin;