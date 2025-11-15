// client/src/apiServer.ts
import axios from 'axios';
import type { Post, User, ProfileFormData } from './App'; // (เราจะย้าย Types มาไว้ที่ App.tsx)

// 🚨 ตั้งค่า URL ของ Backend Server
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * * ตั้งค่า Token ใน Header สำหรับทุกการเชื่อมต่อ
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth & User API ---

/**
 * (API-17) ดึงโปรไฟล์ของฉัน (หลังจาก Login)
 */
export const getMyProfile = () => {
  // 🚨 Endpoint นี้ต้องตรงกับ server/src/routes/userRoutes.js
  return api.get<{ data: { user: User } }>('/users/profile');
};

/**
 * (API-16) สร้างโปรไฟล์ (หลังจาก Register)
 */
export const createProfile = (profileData: ProfileFormData) => {
  // 🚨 Endpoint นี้ต้องตรงกับ server/src/routes/userRoutes.js
  return api.post<{ data: { user: User } }>('/users/profile', profileData);
};


// --- Post (Waste) API ---
// (Endpoint อ้างอิงจาก server/src/routes/wasteRoutes.js)

/**
 * (API-01) ดึงโพสต์ทั้งหมด
 */
export const getPosts = () => {
  return api.get<{ data: Post[] }>('/wastes');
};

/**
 * (API-03) สร้างโพสต์ใหม่
 */
export const createPost = (postData: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
  return api.post<{ data: Post }>('/wastes', postData);
};

/**
 * (API-04) อัปเดตโพสต์
 */
export const updatePost = (postId: string, updatedData: Partial<Post>) => {
  return api.put<{ data: Post }>(`/wastes/${postId}`, updatedData);
};

/**
 * (API-05) ลบโพสต์
 */
export const deletePost = (postId: string) => {
  return api.delete<{ success: boolean }>(`/wastes/${postId}`);
};

// (เพิ่ม API อื่นๆ ที่นี่ เช่น getPostById, getBookings ฯลฯ)

export default api;