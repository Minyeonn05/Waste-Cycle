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

// 1. Import สิ่งที่จำเป็น
import apiServer, { setAuthToken, getMyProfile, getPosts, createProfile } from './apiServer'; // ใช้ apiServer.ts
import { auth } from './firebaseConfig'; // Import Auth จาก Firebase Client
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'; // Import listener
import { Recycle } from 'lucide-react';

// 2. Interfaces ที่ถูกต้อง
export type UserRole = 'user' | 'admin';

export interface User {
  id: string; // Firebase จะใช้ uid
  uid: string; // เพิ่ม uid ให้ชัดเจน
  email: string;
  name: string;
  role: UserRole;
  farmName?: string;
  verified?: boolean;
  avatar?: string;
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
  distance: number; // (นี่คือข้อมูล Mock เดิม)
  verified: boolean;
  npk: { n: number; p: number; k: number };
  feedType: string;
  description: string;
  images: string[];
  farmName: string;
  contactPhone: string;
  rating: number; // (นี่คือข้อมูล Mock เดิม)
  reviewCount: number; // (นี่คือข้อมูล Mock เดิม)
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
  
  // 3. 🚨 ลบ Mock data ของ posts ออก
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 4. 🚨 ใช้ useEffect (onAuthStateChanged) เป็นตัวจัดการ Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        // --- ผู้ใช้ Login ---
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token); // ตั้งค่า Token ให้ apiServer

          const response = await getMyProfile(); // เรียก API /api/users/profile
          setUser(response.data.user);
          setCurrentPage('dashboard');

        } catch (err: any) {
          // 5. 🚨 จัดการ Error (เช่น user สมัครแล้ว แต่ยังไม่มีโปรไฟล์)
          if (err.response && err.response.status === 404) {
            console.warn("User authenticated but no profile found (404).");
            setUser(null); 
            setCurrentPage('register'); // บังคับให้ไปหน้า Register เพื่อกรอกโปรไฟล์
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

      // 6. 🚨 โหลด Posts (สำหรับทุกคน)
      try {
        const postsResponse = await getPosts(); // (มาจาก apiServer.ts)
        setPosts(postsResponse.data.data); // Backend คืน { data: [...] }
      } catch (postError) {
        console.error("Failed to fetch posts:", postError);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe(); // คืนค่าฟังก์ชัน unsubscribe
  }, []); // [] = รันครั้งเดียวตอนเปิดแอป

  
  // 7. 🚨 แก้ไข handleLogout ให้เรียก Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth); // เรียก Firebase Client SDK
      // onAuthStateChanged จะจัดการส่วนที่เหลือเอง
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  
  // 8. 🚨 สร้างฟังก์ชันสำหรับรับข้อมูลจาก RegisterPage
  const handleProfileCreation = async (profileData: { name: string; farmName?: string; role: 'user' | 'admin' }) => {
    setIsLoading(true);
    try {
      // (ณ จุดนี้ user login กับ Firebase และมี Token แล้ว)
      const response = await createProfile(profileData); // เรียก API /api/users/profile
      setUser(response.data.user); // ตั้งค่า user หลังสร้างโปรไฟล์สำเร็จ
      setCurrentPage('dashboard');
    } catch (err: any) {
      console.error("Profile creation failed:", err);
      alert(`สร้างโปรไฟล์ไม่สำเร็จ: ${err.response?.data?.error}`);
    }
    setIsLoading(false);
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

  // ... (ฟังก์ชัน handleCreatePost, handleUpdatePost ฯลฯ ยังเป็น Mock) ...
  // (คุณต้องแก้ฟังก์ชันเหล่านี้ให้เรียก API ทีหลัง)
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
      userId: user!.uid, // ใช้ uid
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
      buyerId: user.uid, // ใช้ uid
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

  // 9. 🚨 หน้า Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Recycle className="w-16 h-16 text-green-600 animate-spin" />
      </div>
    );
  }

  // 10. 🚨 แก้ไขการ Render หน้า (ใช้ Props ที่ถูกต้อง)
  
  if (!user && currentPage === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }

  if (!user && currentPage === 'login') {
    return (
      <LoginPage 
        // LoginPage ไม่ต้องการ onLogin แล้ว
        onBack={() => setCurrentPage('landing')} 
        onRegisterClick={() => setCurrentPage('register')}
      />
    );
  }

  if (!user && currentPage === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={handleProfileCreation} // ส่งฟังก์ชันสร้างโปรไฟล์ไปแทน
        onBack={() => setCurrentPage('landing')} 
        onLoginClick={() => setCurrentPage('login')}
      />
    );
  }
  
  if (!user) {
    // ถ้าหลุดมาถึงตรงนี้โดยไม่มี user ให้กลับไปหน้าแรก
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }

  // --- ส่วนที่ต้อง Login แล้ว ---
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
            posts={posts.filter(p => p.userId === user.uid)} // ใช้ uid
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
            isMyPost={currentPost.userId === user.uid} // ใช้ uid
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

        {/* 🚨🚨🚨 บั๊ก: CircularEconomy ไม่มี component นี้ ผมจะใช้ CircularView แทน */}
        {currentPage === 'circular-view' && user.role !== 'admin' && (
          <CircularEconomy/> // 🚨🚨 แก้ไขชื่อ Component 
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