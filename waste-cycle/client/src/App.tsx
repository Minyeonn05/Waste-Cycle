// client/src/App.tsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { CreatePost } from './components/CreatePost';
import { PostDetail } from './components/PostDetail';
import { BookingPage } from './components/BookingPage';
import { FertilizerAdvisor } from './components/FertilizerAdvisor';
import { CircularEconomy } from './components/CircularEconomy';
import { AdminPanel } from './components/AdminPanel';
import { ChatPage } from './components/ChatPage';
import { ProfilePage } from './components/ProfilePage';
import { ChatDialog } from './components/ChatDialog';
import { RegisterPage } from './components/RegisterPage';

// 🚨 1. Import สิ่งที่จำเป็น
import apiService, { setAuthToken, getMyProfile, getPosts, createProfile } from './apiServer'; // <-- 🚨🚨 ใช้ apiServer.ts
import { auth } from './firebaseConfig'; // <-- Import Auth จาก Firebase Client
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'; // <-- Import listener
import { Recycle } from 'lucide-react';

// Interfaces (ยังคงเดิม)
export type UserRole = 'user' | 'admin';

export interface User {
  id: string; 
  email: string;
  name: string;
  role: UserRole;
  farmName?: string;
  verified?: boolean;
  avatar?: string;
  uid?: string; 
  displayName?: string;
}
export interface Post {
  id: string;
  userId: string;
  title: string;
  animalType: string;
  wasteType: string;
  quantity: number;
  price: number;
  unit: string;
  location: string;
  distance: number;
  verified: boolean;
  npk: { n: number; p: number; k: number };
  feedType: string;
  description: string;
  images: string[];
  farmName: string;
  contactPhone: string;
  rating: number;
  reviewCount: number;
  createdDate: string;
  sold?: boolean;
}
export interface ChatRoom {
  id: string;
  postId: string;
  sellerId: string;
  buyerId: string;
  sellerName: string;
  buyerName: string;
  farmName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}
// ... (Interfaces Post, ChatRoom) ...


export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatPostId, setChatPostId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [confirmedChatRooms, setConfirmedChatRooms] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Record<string, { id: string; senderId: string; text: string; timestamp: string; }[]>>({});
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // 🚨 2. ใช้ useEffect (onAuthStateChanged) เป็นตัวจัดการ Auth
  useEffect(() => {
    // ตั้งค่า listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        // --- ผู้ใช้ Login ---
        try {
          // 1. ดึง ID Token (ของจริง)
          const token = await firebaseUser.getIdToken();
          setAuthToken(token); // <-- ตั้งค่า Token ให้ apiService

          // 2. ดึงข้อมูลโปรไฟล์จาก Backend
          const response = await getMyProfile();
          setUser(response.data.user);
          setCurrentPage('dashboard');

        } catch (err: any) {
          // 3. จัดการ Error (เช่น user สมัครแล้ว แต่ยังไม่มีโปรไฟล์)
          if (err.response && err.response.status === 404) {
            // ไม่พบโปรไฟล์! (นี่คือการสมัครใหม่)
            // เราจะค้างอยู่ที่หน้า 'register' (หรือหน้าที่เหมาะสม)
            // เราจะจัดการเรื่องนี้ใน RegisterPage.tsx
            console.warn("User authenticated but no profile found.");
            // เราจะปล่อยให้ RegisterPage.tsx จัดการสร้างโปรไฟล์
            setUser(null); // ยังไม่ตั้งค่า user จนกว่าจะมีโปรไฟล์
            setCurrentPage('register'); // <-- 🚨 บังคับให้กรอกโปรไฟล์ที่หน้า Register
          } else {
            console.error("Auth Error:", err);
            setAuthToken(null);
            setUser(null);
          }
        }
      } else {
        // --- ผู้ใช้ Logout ---
        setAuthToken(null);
        setUser(null);
        setCurrentPage('landing');
      }

      // 4. โหลด Posts (สำหรับทุกคน)
      try {
        const postsResponse = await getPosts();
        setPosts(postsResponse.data.data); // 🚨 Backend คืน { data: [...] }
      } catch (postError) {
        console.error("Failed to fetch posts:", postError);
      }
      
      setIsLoading(false);
    });

    // คืนค่าฟังก์ชัน unsubscribe เมื่อ component ถูก unmount
    return () => unsubscribe();
  }, []); // [] = รันครั้งเดียวตอนเปิดแอป

  
  // 🚨 3. ลบ handleLogin (ย้ายไปที่ LoginPage)
  // ... (handleLogin removed) ...

  // 🚨 4. แก้ไข handleLogout ให้เรียก Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth); // <-- เรียก Firebase Client SDK
      // onAuthStateChanged ใน App.tsx จะตรวจจับได้เอง
      // และจะพาไปหน้า Dashboard 
    } catch (err: any) {
      console.error("Firebase Login failed:", err.code);
      setError(getFirebaseErrorMessage(err.code));
      setIsLoading(false);
    }
    // ไม่ต้อง setIsLoading(false) ใน "try" เพราะ component จะ unmount
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Recycle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle>เข้าสู่ระบบ Waste-Cycle</CardTitle>
            <CardDescription>เข้าสู่ระบบเพื่อซื้อและขายของเสีย</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  ลงทะเบียน
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ฟังก์ชันช่วยแปล Error Code
const getFirebaseErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/user-not-found':
      return 'ไม่พบผู้ใช้นี้';
    case 'auth/wrong-password':
      return 'รหัสผ่านไม่ถูกต้อง';
    default:
      return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
  }
};