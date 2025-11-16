import axios from 'axios';
import {
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import app from './firebaseConfig';

// 🚨 ประเภทข้อมูล (Type) ที่ยังไม่ได้กำหนด (ใช้ 'any' เป็นการชั่วคราว)
// Front-end จะต้องสร้าง Type เหล่านี้เพื่อให้ทำงานได้สมบูรณ์
type ProfileFormData = any;
type AuthData = any;
type BookingData = any;
type FertilizerAdviceData = any;
type MarketPriceData = any;
type ProductData = any;
type ProductReviewData = any;
type CommunityPostData = any;
type CommentData = any;
type MatchData = any;
type FarmData = any;
type ChatMessageData = any;
type AnalyzeWasteData = any;

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const auth = getAuth(app);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getMyProfile = () => {
  return api.get('/users/profile');
};

export const createProfile = (profileData: {
  name: string;
  farmName?: string;
  role: 'user' | 'admin';
}) => {
  return api.post('/users/profile', profileData);
};

export const getProducts = () => {
  return api.get('/products');
};

export const getProductById = (id: string) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (productData: any) => {
  return api.post('/products', productData);
};

export const updateProduct = (id: string, productData: any) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = (id: string) => {
  return api.delete(`/products/${id}`);
};

export const getChatRooms = () => {
  return api.get('/chat');
};

export const getChatMessages = (chatId: string) => {
  return api.get(`/chat/${chatId}/messages`);
};

export const sendChatMessage = (chatId: string, text: string) => {
  return api.post(`/chat/${chatId}/messages`, { text });
};

export const createChatRoom = (productId: string) => {
  return api.post('/chat', { productId });
};

export const getUserBookings = (userId: string) => {
  return api.get(`/bookings/user/${userId}`);
};

// --- NEW FUNCTION FOR USER STATS ---
export const getUserStats = () => {
  // Assuming a new endpoint exists for fetching regular user's dashboard stats (purchases, revenue, rating)
  return api.get('/users/stats'); 
};
// ------------------------------------

export const createBooking = (bookingData: any) => {
  return api.post('/bookings', bookingData);
};

export const updateBookingStatus = (id: string, status: string) => {
  return api.put(`/bookings/${id}/status`, { status });
};

export const getNotifications = () => {
  return api.get('/notifications');
};

export const markNotificationAsRead = (id: string) => {
  return api.put(`/notifications/${id}/read`);
};

const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export default api;