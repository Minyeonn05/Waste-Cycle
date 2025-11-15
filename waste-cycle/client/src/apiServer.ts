// client/src/apiServer.ts
import axios from 'axios';
import type { Post, User, ProfileFormData } from './App'; // (Import Types จาก App.tsx)

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth & User API ---

/**
 * (API-17) ดึงโปรไฟล์ของฉัน
 * 🚨 [แก้ไข] 👈 แก้ไข Type ให้ตรงกับ userController.js
 */
export const getMyProfile = () => {
  return api.get<{ success: boolean, data: User }>('/users/profile');
};

/**
 * (API-16) สร้างโปรไฟล์
 * 🚨 [แก้ไข] 👈 แก้ไข Type ให้ตรงกับ userController.js
 */
export const createProfile = (profileData: ProfileFormData) => {
  return api.post<{ success: boolean, data: User }>('/users/profile', profileData);
};


// --- Post (Waste) API ---

/**
 * (API-01) ดึงโพสต์ทั้งหมด
 * 🚨 [แก้ไข] 👈 แก้ไข Type (อ้างอิงจาก communityController.js)
 */
export const getPosts = () => {
  return api.get<{ success: boolean, data: Post[] }>('/wastes');
};

/**
 * (API-03) สร้างโพสต์ใหม่
 * 🚨 [แก้ไข] 👈 แก้ไข Type
 */
export const createPost = (postData: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
  return api.post<{ success: boolean, data: Post }>('/wastes', postData);
};

/**
 * (API-04) อัปเดตโพสต์
 * 🚨 [แก้ไข] 👈 แก้ไข Type
 */
export const updatePost = (postId: string, updatedData: Partial<Post>) => {
  return api.put<{ success: boolean, data: Post }>(`/wastes/${postId}`, updatedData);
};

/**
 * (API-05) ลบโพสต์
 * 🚨 [แก้ไข] 👈 แก้ไข Type
 */
export const deletePost = (postId: string) => {
  return api.delete<{ success: boolean }>(`/wastes/${postId}`);
};

export default api;