// client/src/apiService.ts
import axios from 'axios';

// URL ของ Backend (ที่รันบน Port 8000)
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// ฟังก์ชันสำหรับตั้งค่า Token ใน Header
export const setAuthToken = (token: string | null) => {
  if (token) {
    // บันทึก Token ลงใน localStorage
    localStorage.setItem('authToken', token);
    // ตั้งค่า Header ให้ axios อัตโนมัติ
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // ลบ Token ออก
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth Routes ---
export const register = (formData: any) => {
  // เราจะยิงไปที่ /api/auth/register ตามที่ authController.js กำหนด
  return api.post('/auth/register', formData);
};

export const login = (credentials: any) => {
  // เราจะยิงไปที่ /api/auth/login
  return api.post('/auth/login', credentials);
};

export const logout = () => {
  // ส่ง Token ไปให้ backend (ถ้ามี) เพื่อ logout
  return api.post('/auth/logout');
};

export const getMe = () => {
  // ดึงข้อมูลผู้ใช้ที่ login อยู่ โดยใช้ Token ที่บันทึกไว้
  return api.get('/auth/me');
};

// --- Product Routes (ตัวอย่าง) ---
export const getPosts = () => {
  return api.get('/products'); // (สมมติว่า /products คือ route จาก wasteRoutes.js)
};

// ... (เพิ่มฟังก์ชัน API อื่นๆ ที่นี่) ...

// ตรวจสอบ Token ตอนโหลดแอป
const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export default api;