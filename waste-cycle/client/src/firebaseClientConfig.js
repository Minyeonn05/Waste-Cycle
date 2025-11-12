// client/src/firebaseClientConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🚨🚨🚨 แทนที่ด้วย Firebase Config ของคุณ 🚨🚨🚨
// (ไปที่ Firebase Console -> Project Settings -> General -> Your apps -> Web)
const firebaseConfig = {
  apiKey: "AIzaSyDQwZJTHaAS4JLEo2CExBp_3lbGJMHqYCo",
  authDomain: "waste-cy.firebaseapp.com",
  projectId: "waste-cy",
  storageBucket: "waste-cy.firebasestorage.app",
  messagingSenderId: "27038277363",
  appId: "1:27038277363:web:33ec29157710e443cae186"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;