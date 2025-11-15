// client/src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 🚨🚨🚨
// 🚨 (สำคัญมาก!) แทนที่ออบเจ็กต์นี้ด้วย Firebase Config ของคุณ
// 🚨 (นี่เป็น Key ฝั่ง Client ปลอดภัยที่จะไว้ที่นี่)
// 🚨🚨🚨
const firebaseConfig = {
  apiKey: "AIzaSyDQwZJTHaAS4JLEo2CExBp_3lbGJMHqYCo",
  authDomain: "waste-cy.firebaseapp.com",
  projectId: "waste-cy",
  storageBucket: "waste-cy.appspot.com",
  messagingSenderId: "27038277363",
  appId: "1:27038277363:web:33ec29157710e443cae186"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service ที่เราจะใช้
export const auth = getAuth(app);

export default app;