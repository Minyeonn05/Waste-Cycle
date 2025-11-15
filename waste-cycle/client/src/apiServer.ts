// client/src/apiService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// ฟังก์ชันสำหรับตั้งค่า Token ใน Header
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// 🚨 1. เปลี่ยนชื่อฟังก์ชันให้สอดคล้องกัน (getAuthStatus -> getMyProfile)
// (เราจะเปลี่ยนชื่อที่ Backend ด้วย)
export const getMyProfile = () => {
  return api.get('/users/profile'); // <-- เปลี่ยน URL
};

// 🚨 2. เพิ่มฟังก์ชันสำหรับ "สร้างโปรไฟล์" หลังจากสมัคร
export const createProfile = (profileData: { name: string; farmName?: string; role: 'user' | 'admin' }) => {
  return api.post('/users/profile', profileData); // <-- Endpoint ใหม่
};

// --- Product Routes ---
export const getPosts = () => {
  return api.get('/products');
};

// ... (ฟังก์ชัน API อื่นๆ) ...

// ตรวจสอบ Token ตอนโหลดแอป
const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export default api;