// client/src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 🚨🚨🚨
// 🚨 (สำคัญมาก!) แทนที่ออบเจ็กต์นี้ด้วย Firebase Config ของคุณ
// 🚨 (นี่เป็น Key ฝั่ง Client ปลอดภัยที่จะไว้ที่นี่)
// 🚨🚨🚨
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service ที่เราจะใช้
export const auth = getAuth(app);

export default app;