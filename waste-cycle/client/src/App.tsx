import { useState, useEffect, useCallback } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
// --- FIX: Remove file extensions from imports ---
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
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
import api, {
  setAuthToken,
  onAuthChange,
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  createProfile,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getChatRooms,
  createChatRoom,
} from './apiServer'; // --- FIX: Remove file extension ---
// --- END FIX ---
import { Recycle } from 'lucide-react';

export type UserRole = 'user' | 'admin' | 'seller';

// แก้ไข: เพิ่ม 'export'
export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  farmName?: string;
  location?: { lat: number; lng: number };
  verified?: boolean;
  avatar?: string;
}

// แก้ไข: เพิ่ม 'export' และเปลี่ยน 'location'
export interface Post {
  id: string;
  userId: string;
  title: string;
  animalType: string;
  wasteType: string;
  quantity: number;
  price: number;
  unit: string;
  location: { lat: number; lng: number }; // <-- แก้ไข
  address: string; // <-- เพิ่ม
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

// แก้ไข: เพิ่ม 'export'
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

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [confirmedChatRooms, setConfirmedChatRooms] = useState<Set<string>>(new Set());
  
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatPostId, setChatPostId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [productsResponse, chatRoomsResponse] = await Promise.all([
        getProducts(),
        getChatRooms(),
      ]);
      setPosts(productsResponse.data.data || []);
      setChatRooms(chatRoomsResponse.data.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("ไม่สามารถดึงข้อมูลได้");
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
          const response = await getMyProfile();
          setUser(response.data.user);
          setCurrentPage('dashboard');
        } catch (err: any) {
          // --- BEGIN EDIT ---
          // นี่คือส่วนที่แก้ไข "การวิ่งแข่ง" ครับ
          const isNotFoundError = err.response && 
                                 err.response.data && 
                                 err.response.data.message === 'Not authorized, user not found';
          
          if (isNotFoundError) {
            // ถ้าใช่: ไม่ต้องทำอะไร (เพราะนี่คือการลงทะเบียนใหม่)
            console.log("onAuthStateChanged: User not found in DB, assuming new registration. Waiting for createProfile...");
          } else {
            // ถ้าเป็น Error อื่น: (เช่น server ล่ม) ให้ Logout
            console.error("Auth error:", err);
            setUser(null);
            setAuthToken(null);
          }
          // --- END EDIT ---
        }
      } else {
        setUser(null);
        setCurrentPage('landing');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleLogin = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const handleRegister = async (
    email: string,
    password: string,
    profileData: { name: string; farmName?: string; role: 'user' | 'admin' }
  ) => {
    // 1. สร้าง User ใน Auth
    const userCredential = await registerUser(email, password);
    const token = await userCredential.user.getIdToken();
    setAuthToken(token);
    // 2. สร้างโปรไฟล์ใน DB (POST /api/users/profile)
    const response = await createProfile(profileData);
    // 3. ตั้งค่า User ใน React
    setUser(response.data.user);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setPosts([]);
    setChatRooms([]);
    setChatMessages({});
    setAuthToken(null);
    setCurrentPage('landing');
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

  const handleViewPostDetail = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage('post-detail');
  };

  const handleEditPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsEditingPost(true);
    setCurrentPage('create-post');
  };

  const handleCreatePost = async (newPost: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
    try {
      await createProduct(newPost);
      await fetchAllData();
      navigateTo('marketplace');
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("ไม่สามารถสร้างโพสต์ได้");
    }
  };

  const handleUpdatePost = async (postId: string, updatedData: Partial<Post>) => {
    try {
      await updateProduct(postId, updatedData);
      await fetchAllData();
      setSelectedPostId(null);
      setIsEditingPost(false);
      navigateTo('marketplace');
    } catch (err) {
      console.error("Failed to update post:", err);
      setError("ไม่สามารถอัปเดตโพสต์ได้");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteProduct(postId);
      await fetchAllData();
      navigateTo('marketplace');
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("ไม่สามารถลบโพสต์ได้");
    }
  };

  const handleOpenChat = async (postId: string) => {
    try {
      const response = await createChatRoom(postId);
      const room = response.data.data;
      if (!chatRooms.find(r => r.id === room.id)) {
        setChatRooms(prev => [...prev, room]);
      }
      setSelectedRoomId(room.id);
      navigateTo('chat');
    } catch (err) {
      console.error("Failed to open chat:", err);
      setError("ไม่สามารถเริ่มแชทได้");
    }
  };
  
  const handleOpenChatDialog = (postId: string) => {
    setChatPostId(postId);
  };

  const handleCloseChat = () => {
    setChatPostId(null);
  };
  
  const handleConfirmSale = (postId: string, roomId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, sold: true } : p));
    setConfirmedChatRooms(prev => new Set([...prev, roomId]));
  };

  const handleCancelChat = (roomId: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Recycle className="w-16 h-16 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'login') {
      return <LoginPage onLogin={handleLogin} onBack={() => navigateTo('landing')} onRegisterClick={() => navigateTo('register')} />;
    }
    if (currentPage === 'register') {
      return <RegisterPage onRegister={handleRegister} onBack={() => navigateTo('landing')} onLoginClick={() => navigateTo('login')} />;
    }
    return <LandingPage onGetStarted={() => navigateTo('login')} />;
  }

  const currentPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const chatPost = chatPostId ? posts.find(p => p.id === chatPostId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} onNavigate={navigateTo} currentPage={currentPage} />
      
      <main className="pt-16">
        {error && (
          <div className="container mx-auto px-4 py-2">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">เกิดข้อผิดพลาด: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard 
            user={user} 
            onNavigate={navigateTo} 
            posts={posts.filter(p => p.userId === user.id)}
            allPosts={posts}
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChatDialog}
          />
        )}
        {currentPage === 'marketplace' && user.role !== 'admin' && (
          <Marketplace 
            user={user} 
            posts={posts}
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChatDialog}
            chattingPostIds={new Set(chatRooms.map(room => room.postId))}
          />
        )}
        {currentPage === 'create-post' && user.role !== 'admin' && (
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
            isMyPost={currentPost.userId === user.id}
            onChat={() => handleOpenChat(currentPost.id)}
          />
        )}
        {currentPage === 'bookings' && user.role !== 'admin' && <BookingPage user={user} />}
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
        {currentPage === 'admin' && user.role === 'admin' && <AdminPanel />}
        {currentPage === 'chat' && user.role !== 'admin' && (
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
        {currentPage === 'profile' && user.role !== 'admin' && <ProfilePage user={user} />}
        
        {chatPost && (
          <ChatDialog 
            post={chatPost}
            currentUser={user}
            onClose={handleCloseChat}
            onConfirm={() => handleOpenChat(chatPost.id)}
          />
        )}
      </main>
    </div>
  );
}