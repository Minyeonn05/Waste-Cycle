// client/src/apiServer.ts
import axios from 'axios';
// (Import Types จาก App.tsx)
import type { Post, User } from './App'; 

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

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth API ---
// (อ้างอิง: server/src/routes/authRoutes.js)

export const registerUser = (userData: AuthData) => {
  return api.post('/auth/register', userData);
};

export const loginUser = (credentials: AuthData) => {
  return api.post('/auth/login', credentials);
};

export const logoutUser = () => {
  return api.post('/auth/logout');
};

export const googleAuth = (token: string) => {
  return api.post('/auth/google', { token });
};

// --- User API ---
// (อ้างอิง: server/src/routes/userRoutes.js)

/**
 * (API-17) ดึงโปรไฟล์ของฉัน
 */
export const getMyProfile = () => {
  return api.get<{ success: boolean, data: User }>('/users/profile');
};

/**
 * (API-16) สร้างหรืออัปเดตโปรไฟล์
 */
export const createOrUpdateProfile = (profileData: ProfileFormData) => {
  return api.post<{ success: boolean, data: User }>('/users/profile', profileData);
};

// --- Post (Waste) API ---
// (อ้างอิง: server/src/routes/wasteRoutes.js)

/**
 * (API-01) ดึงโพสต์ทั้งหมด
 */
export const getPosts = () => {
  return api.get<{ success: boolean, data: Post[] }>('/wastes');
};

/**
 * (API-03) สร้างโพสต์ใหม่
 */
export const createPost = (postData: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
  return api.post<{ success: boolean, data: Post }>('/wastes', postData);
};

/**
 * (API-04) อัปเดตโพสต์
 */
export const updatePost = (postId: string, updatedData: Partial<Post>) => {
  return api.put<{ success: boolean, data: Post }>(`/wastes/${postId}`, updatedData);
};

/**
 * (API-05) ลบโพสต์
 */
export const deletePost = (postId: string) => {
  return api.delete<{ success: boolean }>(`/wastes/${postId}`);
};

// --- Product API ---
// (อ้างอิง: server/src/routes/productRoutes.js)

export const getAllProducts = () => {
  return api.get('/products');
};

export const getProductById = (id: string) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (productData: ProductData) => {
  return api.post('/products', productData);
};

export const updateProduct = (id: string, productData: ProductData) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = (id: string) => {
  return api.delete(`/products/${id}`);
};

export const getProductsByFarmId = (farmId: string) => {
  return api.get(`/products/farm/${farmId}`);
};

export const createProductReview = (id: string, reviewData: ProductReviewData) => {
  return api.post(`/products/${id}/review`, reviewData);
};

export const getTopProducts = () => {
  return api.get('/products/top');
};

export const getProductsByCategory = (category: string) => {
  return api.get('/products/category', { params: { category } });
};

// --- Community API ---
// (อ้างอิง: server/src/routes/communityRoutes.js)

export const createCommunityPost = (postData: CommunityPostData) => {
  return api.post('/community/posts', postData);
};

export const getCommunityPosts = () => {
  return api.get('/community/posts');
};

export const addCommunityComment = (postId: string, commentData: CommentData) => {
  return api.post(`/community/posts/${postId}/comment`, commentData);
};

export const likeCommunityPost = (postId: string) => {
  return api.post(`/community/posts/${postId}/like`);
};

// --- Booking API ---
// (อ้างอิง: server/src/routes/bookingRoutes.js)

export const createBooking = (bookingData: BookingData) => {
  return api.post('/bookings', bookingData);
};

export const getUserBookings = (userId: string) => {
  return api.get(`/bookings/user/${userId}`);
};

export const updateBookingStatus = (bookingId: string, status: string) => {
  return api.put(`/bookings/${bookingId}/status`, { status });
};

// --- Fertilizer API ---
// (อ้างอิง: server/src/routes/fertilizerRoutes.js)

export const getSupportedMaterialsList = () => {
  return api.get('/fertilizer/materials');
};

export const getSupportedCropsList = () => {
  return api.get('/fertilizer/crops');
};

export const getFertilizerAdvice = (adviceData: FertilizerAdviceData) => {
  return api.post('/fertilizer/fertilizer', adviceData);
};

// --- Matching API ---
// (อ้างอิง: server/src/routes/matchingRoutes.js)

export const findMatches = (matchData: MatchData) => {
  return api.post('/matching/find-matches', matchData);
};

// --- Farm API ---
// (อ้างอิง: server/src/routes/farmRoutes.js)

export const getAllFarms = () => {
  return api.get('/farms');
};

export const getFarmById = (id: string) => {
  return api.get(`/farms/${id}`);
};

export const registerFarm = (farmData: FarmData) => {
  return api.post('/farms/register', farmData);
};

export const updateFarmProfile = (id: string, farmData: FarmData) => {
  return api.put(`/farms/${id}`, farmData);
};

export const getFarmByUserId = (userId: string) => {
  return api.get(`/farms/user/${userId}`);
};

// --- Chat API ---
// (อ้างอิง: server/src/routes/chatRoutes.js)

export const createChatRoom = (postId: string) => {
  return api.post('/chat', { postId });
};

export const getUserChatRooms = () => {
  return api.get('/chat');
};

export const getChatMessages = (roomId: string) => {
  return api.get(`/chat/${roomId}/messages`);
};

export const sendChatMessage = (roomId: string, messageData: ChatMessageData) => {
  return api.post(`/chat/${roomId}/messages`, messageData);
};

export const markMessageAsRead = (messageId: string) => {
  return api.put(`/chat/messages/${messageId}/read`);
};

// --- Analyze API ---
// (อ้างอิง: server/src/routes/analyzeRoutes.js)

export const analyzeWasteData = (data: AnalyzeWasteData) => {
  return api.post('/analyze/waste', data);
};

export const getUserStats = () => {
  return api.get('/analyze/user-stats');
};

export const getMarketTrends = () => {
  return api.get('/analyze/market-trends');
};

// --- Market API ---
// (อ้างอิง: server/src/routes/marketRoutes.js)

export const getMarketPrices = () => {
  return api.get('/market/price');
};

export const updateMarketPrice = (priceData: MarketPriceData) => {
  return api.post('/market/update', priceData);
};

// --- Visualization API ---
// (อ้างอิง: server/src/routes/visualizationRoutes.js)

export const getMapData = () => {
  return api.get('/visualization/map-data');
};

export const getWasteFlowData = () => {
  return api.get('/visualization/waste-flow');
};

// --- Admin API ---
// (อ้างอิง: server/src/routes/adminRoutes.js)

export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const verifyFarmByUserId = (userId: string) => {
  return api.put(`/admin/verify-farm-by-user/${userId}`);
};

export const removePostAdmin = (postId: string) => {
  return api.delete(`/admin/remove-post/${postId}`);
};

export const getReports = () => {
  return api.get('/admin/reports');
};

// --- Notification API ---
// (อ้างอิง: server/src/routes/notificationRoutes.js)

export const getUserNotifications = () => {
  return api.get('/notifications');
};

export const markNotificationAsRead = (id: string) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.put('/notifications/read-all');
};

export default api;