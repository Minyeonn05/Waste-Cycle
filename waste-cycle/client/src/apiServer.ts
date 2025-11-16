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

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

const auth = getAuth(app);

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
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

// Helper function to mock image upload and return URLs (to prevent large Base64 data upload)
const mockImageUpload = (images: string[]): string[] => {
  if (!images || images.length === 0) return [];
  
  // NOTE: ในแอปจริง, ส่วนนี้คือที่ที่คุณจะเรียกใช้ Firebase Storage หรือบริการอื่น ๆ
  // เพื่ออัปโหลดรูปภาพและส่งคืน URL
  // สำหรับตอนนี้ เรา mock เป็น URL เพื่อจำลองการทำงานที่สำเร็จ
  return images.map((_, index) => 
    `https://mockstorage.com/images/${Date.now()}-${index}.jpg`
  );
};

export const createProduct = (productData: any) => {
  // 1. Mock image upload to get URLs
  const imageUrls = mockImageUpload(productData.images);
  
  // 2. Prepare data to send to the server (replace large Base64 data with mock URLs)
  const dataToSend = {
    ...productData,
    images: imageUrls, 
  };
  
  return api.post('/products', dataToSend);
};

export const updateProduct = (id: string, productData: any) => {
  // 1. Mock image upload to get URLs 
  const imageUrls = mockImageUpload(productData.images);

  // 2. Prepare data to send to the server
  const dataToSend = {
    ...productData,
    images: imageUrls, 
  };
  
  return api.put(`/products/${id}`, dataToSend);
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