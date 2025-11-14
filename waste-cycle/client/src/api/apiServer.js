// client/src/api/apiService.js
import { auth } from '../firebaseClientConfig';

// 1. กำหนด URL หลักของ Server ที่เดียว
const BASE_URL = 'http://localhost:8000/api';

// 2. ฟังก์ชันช่วยดึง Token (ถ้ามี)
const getAuthToken = async () => {
  if (auth.currentUser) {
    try {
      // (true) = บังคับให้รีเฟรช Token ถ้ามันใกล้หมดอายุ
      return await auth.currentUser.getIdToken(true); 
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  return null;
};

// 3. ฟังก์ชันกลางสำหรับยิง API (จัดการ Header, Error, Token อัตโนมัติ)
const apiFetch = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // ส่งต่อ Error ภาษาไทยที่ Server (Express) ส่งมา
    throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API');
  }

  return data; // คืนค่า data ที่สำเร็จแล้ว (ปกติคือ { success: true, data: ... })
};

// 4. สร้าง Service API แยกเป็นฟังก์ชันให้เรียกใช้ง่ายๆ
export const apiService = {

  // --- Auth (API-17) ---
  login: (email, password) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: (email, password, displayName) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  getMe: () => {
    return apiFetch('/auth/me'); // (API-17)
  },

  // --- Wastes / Products (API เดิม) ---
  fetchPosts: () => {
    return apiFetch('/wastes'); 
  },
  
  getPostById: (postId) => {
    return apiFetch(`/wastes/${postId}`);
  },

  // --- Chat (API เดิม) ---
  initiateChat: (postId) => {
    return apiFetch('/chat/initiate', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  },

  // --- Bookings (API เดิม) ---
  getBookings: (userId) => {
    return apiFetch(`/bookings/user/${userId}`);
  },
  
  updateBookingStatus: (bookingId, status) => {
    return apiFetch(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  // --- Admin (API 22-25) ---
  adminGetAllUsers: () => {
    return apiFetch('/admin/users'); // (API-22)
  },
  
  adminVerifyFarm: (farmId) => {
    return apiFetch(`/admin/verify-farm/${farmId}`, { // (API-23)
      method: 'PUT',
    });
  },

  adminRemovePost: (postId) => {
    return apiFetch(`/admin/remove-post/${postId}`, { // (API-24)
      method: 'DELETE',
    });
  },
  
  adminGetReports: () => {
    return apiFetch('/admin/reports'); // (API-25)
  },

  // --- NPK (API-18) ---
  analyzeNPK: (animalType, wasteType, feedType, quantity) => {
    return apiFetch('/analyze/npk', { // (API-18)
      method: 'POST',
      body: JSON.stringify({ animalType, wasteType, feedType, quantity }),
    });
  },

  // --- Market (API 19-20) ---
  getMarketPrices: () => {
    return apiFetch('/market/price'); // (API-19)
  },

  // --- Visualization (API-21) ---
  getCycleData: () => {
    return apiFetch('/visualization/cycle'); // (API-21)
  },
  
  // --- Notifications (API ใหม่) ---
  getNotifications: () => {
    return apiFetch('/notifications');
  },
  
  markNotificationAsRead: (notificationId) => {
    return apiFetch(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
};