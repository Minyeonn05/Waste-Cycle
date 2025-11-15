import { useState, useEffect } from 'react'; // <-- เพิ่ม useEffect
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
import { Recycle } from 'lucide-react';

// 🚨 1. Import apiService และ setAuthToken
import apiService, { setAuthToken, getMe } from '../src/apiServer'; 

// Interfaces (ยังคงเดิม)
export type UserRole = 'user' | 'admin';

export interface User {
  id: string; // Firebase จะใช้ uid
  email: string;
  name: string;
  role: UserRole;
  farmName?: string;
  verified?: boolean;
  avatar?: string;
  // เพิ่ม field อื่นๆ ที่ Backend ส่งมา
  uid?: string; 
  displayName?: string;
}

// ... (Interfaces Post, ChatRoom ยังคงเดิม) ...
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


export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatPostId, setChatPostId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [confirmedChatRooms, setConfirmedChatRooms] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Record<string, { id: string; senderId: string; text: string; timestamp: string; }[]>>({});
  
  // 🚨 ลบ Mock data ของ posts ออก
  const [posts, setPosts] = useState<Post[]>([]);

  // 🚨 2. เพิ่ม State สำหรับ Loading และ Error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // 🚨 3. ใช้ useEffect เพื่อตรวจสอบการ Login ค้าง (เมื่อ Refresh)
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // ถ้ามี Token, ให้ตั้งค่าใน axios ทันที
          setAuthToken(token); 
          // ดึงข้อมูล /api/auth/me จาก backend
          const response = await getMe(); 
          setUser(response.data.user); // (อ้างอิงจาก authController.js)
          setCurrentPage('dashboard');
        } catch (err) {
          // ถ้า Token หมดอายุ หรือไม่ถูกต้อง
          setAuthToken(null); // ล้าง Token ทิ้ง
          setUser(null);
        }
      }
      // โหลดข้อมูล Posts (สำหรับทุกคน)
      try {
        const postsResponse = await apiService.get('/products');
        setPosts(postsResponse.data.data); // (อ้างอิงจาก productController.js)
      } catch (postError) {
        console.error("Failed to fetch posts:", postError);
      }
      
      setIsLoading(false);
    };

    checkLoggedInStatus();
  }, []); // [] = รันครั้งเดียวตอนเปิดแอป

  
  // 🚨 4. แก้ไข handleLogin ให้เรียก API
  const handleLogin = async (credentials: { email: string, password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // credentials คือ { email, password } ที่ส่งมาจาก LoginPage
      const response = await apiService.post('/auth/login', credentials);
      
      const { user, token } = response.data;

      setUser(user);
      setAuthToken(token); // บันทึก Token
      setCurrentPage('dashboard');

    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ';
      setError(errorMessage);
      alert(`เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`); // ใช้วิธีง่ายๆ ก่อน
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 5. แก้ไข handleRegister ให้เรียก API
  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // formData คือ { name, email, password, ... } ที่ส่งมาจาก RegisterPage
      const response = await apiService.post('/auth/register', formData);

      const { user, token } = response.data;

      setUser(user);
      setAuthToken(token); // บันทึก Token
      setCurrentPage('dashboard'); // สมัครเสร็จ เข้าสู่ระบบเลย

    } catch (err: any) {
      console.error("Register failed:", err);
      const errorMessage = err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ';
      setError(errorMessage);
      alert(`สมัครสมาชิกไม่สำเร็จ: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 6. แก้ไข handleLogout ให้เรียก API
  const handleLogout = async () => {
    try {
      await apiService.post('/auth/logout'); // เรียก API (ถ้ามี)
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      // ล้างข้อมูลฝั่ง Client เสมอ
      setUser(null);
      setAuthToken(null); // ล้าง Token
      setCurrentPage('landing');
      // setPosts(posts.filter(p => p.userId !== user?.id)); // (Logic นี้อาจจะไม่จำเป็นแล้ว)
    }
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    if (page !== 'create-post') {
      setSelectedPostId(null);
    }
    if (page !== 'create-post') {
      setIsEditingPost(false);
    }
  };

  // ... (ฟังก์ชัน handleCreatePost, handleUpdatePost ฯลฯ ก็ต้องแก้ให้เรียก API เหมือนกัน) ...
  // (ผมจะข้ามไปก่อน โฟกัสที่ Login/Register)

  const handleViewPostDetail = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage('post-detail');
  };

  const handleEditPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsEditingPost(true);
    setCurrentPage('create-post');
  };

  const handleCreatePost = (newPost: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      userId: user!.id,
      farmName: user!.farmName || user!.name,
      rating: 0,
      reviewCount: 0,
      createdDate: new Date().toISOString(),
    };
    setPosts([...posts, post]);
    navigateTo('marketplace');
  };

  const handleUpdatePost = (postId: string, updatedData: Partial<Post>) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updatedData } : p));
    setSelectedPostId(null);
    setIsEditingPost(false);
    navigateTo('marketplace');
  };

  const handleDeletePost = (postId: string) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    setPosts(posts.filter(p => p.id !== postId));
    navigateTo('marketplace');
  };

  const handleOpenChat = (postId: string) => {
    setChatPostId(postId);
  };

  const handleCloseChat = () => {
    setChatPostId(null);
  };

  const handleConfirmChat = (postId: string) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    const post = posts.find(p => p.id === postId);
    if (!post || !user) return;
    
    setChatRooms(prev => [...prev, {
      id: Date.now().toString(),
      postId: postId,
      sellerId: post.userId,
      buyerId: user.id,
      sellerName: post.farmName,
      buyerName: user.name,
      farmName: post.farmName,
      lastMessage: 'เริ่มการสนทนา',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
    }]);
    setChatPostId(null);
    navigateTo('chat');
  };

  const handleConfirmSale = (postId: string, roomId: string) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    setPosts(posts.map(p => p.id === postId ? { ...p, sold: true } : p));
    setConfirmedChatRooms(prev => new Set([...prev, roomId]));
  };

  const handleCancelChat = (roomId: string) => {
    // 🚨 TODO: ต้องแก้ให้เรียก API
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
    setChatMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[roomId];
      return newMessages;
    });
    setConfirmedChatRooms(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
  };

  // 🚨 7. เพิ่มหน้า Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Recycle className="w-16 h-16 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user && currentPage === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }

  if (!user && currentPage === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin} // <-- ส่งฟังก์ชันที่เรียก API ไป
        onBack={() => setCurrentPage('landing')} 
        onRegisterClick={() => setCurrentPage('register')}
      />
    );
  }

  if (!user && currentPage === 'register') {
    return (
      <RegisterPage 
        onRegister={handleRegister} // <-- ส่งฟังก์ชันที่เรียก API ไป
        onBack={() => setCurrentPage('landing')} 
        onLoginClick={() => setCurrentPage('login')}
      />
    );
  }
  
  // 🚨 ถ้า login แล้ว แต่ user หายไป (บั๊ก)
  if (!user) {
    // อาจจะแสดงหน้า Error หรือกลับไปหน้า Login
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }


  const currentPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const chatPost = chatPostId ? posts.find(p => p.id === chatPostId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} onNavigate={navigateTo} currentPage={currentPage} />
      
      <main className="pt-16">
        {currentPage === 'dashboard' && (
          <Dashboard 
            user={user} 
            onNavigate={navigateTo} 
            posts={posts.filter(p => p.userId === user.uid)} // 🚨 เปลี่ยนเป็น uid
            allPosts={posts}
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChat}
          />
        )}
        {currentPage === 'marketplace' && user?.role !== 'admin' && (
          <Marketplace 
            user={user} 
            posts={posts}
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChat}
            chattingPostIds={new Set(chatRooms.map(room => room.postId))}
          />
        )}
        {currentPage === 'create-post' && user?.role !== 'admin' && (
          <CreatePost 
            user={user} 
            onBack={() => navigateTo('marketplace')}
            onCreate={handleCreatePost}
            onUpdate={handleUpdatePost}
            editingPost={isEditingPost && currentPost ? currentPost : undefined}
          />
        )}
        {currentPage === 'post-detail' && currentPost && (
          <PostDetail
            post={currentPost}
            onBack={() => navigateTo('marketplace')}
            onEdit={() => handleEditPost(currentPost.id)}
            onDelete={() => handleDeletePost(currentPost.id)}
            isMyPost={currentPost.userId === user.uid} // 🚨 เปลี่ยนเป็น uid
            onChat={() => handleOpenChat(currentPost.id)}
          />
        )}
        {currentPage === 'bookings' && user?.role !== 'admin' && <BookingPage user={user} />}
        {currentPage === 'fertilizer-advisor' && user.role !== 'admin' && (
          <FertilizerAdvisor 
            defaultTab="recommendation" 
            onTabChange={(tab) => {
              if (tab === 'calculator') {
                setCurrentPage('npk-calculator');
              } else {
                setCurrentPage('fertilizer-advisor');
              }
            }}
          />
        )}

        {currentPage === 'npk-calculator' && user.role !== 'admin' && (
          <FertilizerAdvisor 
            defaultTab="calculator" 
            onTabChange={(tab) => {
              if (tab === 'recommendation') {
                setCurrentPage('fertilizer-advisor');
              } else {
                setCurrentPage('npk-calculator');
              }
            }}
          />
        )}

        {currentPage === 'circular-view' && user.role !== 'admin' && (
          <CircularEconomy />
        )}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminPanel />}
        {currentPage === 'chat' && user?.role !== 'admin' && (
          <ChatPage 
            user={user} 
            chatRooms={chatRooms}
            posts={posts}
            confirmedRoomIds={confirmedChatRooms}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            onBack={() => navigateTo('dashboard')} 
            onConfirmSale={handleConfirmSale}
            onCancelChat={handleCancelChat}
          />
        )}
        {currentPage === 'profile' && user?.role !== 'admin' && <ProfilePage user={user} />}
        
        {/* Chat Dialog */}
        {chatPost && (
          <ChatDialog 
            post={chatPost}
            currentUser={user}
            onClose={handleCloseChat}
            onConfirm={() => handleConfirmChat(chatPost.id)}
          />
        )}
      </main>
    </div>
  );
}