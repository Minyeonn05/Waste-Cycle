/// <reference types="./vite-env" />
import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyATXTP9-OAAtF-h-m33SJ0g75mMm9JG5Ps",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "waste-cycle-a6c6e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "waste-cycle-a6c6e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "waste-cycle-a6c6e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "86889193718",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:86889193718:web:aff9aab8c04429de488cd7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZQ134KXS66",
};

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;