import axios from 'axios';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get Firebase ID token and set it in Authorization header
const setAuthToken = async (firebaseUser: FirebaseUser | null) => {
  if (firebaseUser) {
    try {
      const token = await firebaseUser.getIdToken();
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error getting ID token:', error);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Listen to auth state changes and update token
onAuthStateChanged(auth, async (firebaseUser) => {
  await setAuthToken(firebaseUser);
});

// Request interceptor to refresh token if needed
api.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, try to refresh
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true); // Force refresh
          error.config.headers.Authorization = `Bearer ${token}`;
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          await signOut(auth);
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  await setAuthToken(userCredential.user);
  return userCredential;
};

export const registerUser = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  await setAuthToken(userCredential.user);
  return userCredential;
};

export const logoutUser = async () => {
  await signOut(auth);
  await setAuthToken(null);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { setAuthToken };

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

// Initialize token from stored value if available
// The onAuthStateChanged listener will update it when Firebase auth initializes
const storedToken = localStorage.getItem('authToken');
if (storedToken && auth.currentUser) {
  setAuthToken(auth.currentUser);
}

export default api;