import { useState } from 'react';
import { Header } from './components/common/Header';
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

// Type definitions are removed as they are not needed in .jsx
// export type UserRole = 'user' | 'admin';
// export interface User { ... }
// export interface Post { ... }
// export interface ChatRoom { ... }

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatPostId, setChatPostId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [confirmedChatRooms, setConfirmedChatRooms] = useState(new Set());
  const [chatMessages, setChatMessages] = useState({});
  
  // Posts state - includes all posts from all users
  const [posts, setPosts] = useState([
    {
      id: '1',
      userId: '1',
      title: 'มูลไก่อินทรีย์',
      animalType: 'ไก่ไข่',
      wasteType: 'มูลแห้ง',
      quantity: 500,
      price: 320,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มไก่ไข่, ภูเก็ต',
      distance: 4.2,
      verified: true,
      npk: { n: 3.5, p: 3.0, k: 1.8 },
      feedType: 'อาหารข้น (สูตรสำเร็จรูป)',
      description: 'มูลไก่คุณภาพดี เก็บจากฟาร์มที่มีการจัดการที่ดี ปราศจากเชื้อโรค',
      images: ['https://images.unsplash.com/photo-1691526756635-0ac8703f5fa8?w=800'],
      farmName: 'ฟาร์มของฉัน',
      contactPhone: '081-234-5678',
      rating: 4.8,
      reviewCount: 24,
      createdDate: '2024-11-10',
    },
    {
      id: '2',
      userId: '2',
      title: 'มูลโคนมพร้อมใช้',
      animalType: 'โคนม',
      wasteType: 'มูลหมัก',
      quantity: 2000,
      price: 250,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มโคนม, สุรินทร์',
      distance: 8.3,
      verified: true,
      npk: { n: 2.5, p: 1.8, k: 2.1 },
      feedType: 'หญ้า/ฟาง',
      description: 'มูลโคหมักพร้อมใช้ คุณภาพดี เหมาะสำหรับปลูกพืชทุกชนิด',
      images: ['https://images.unsplash.com/photo-1723174515335-7eb28e74c0cb?w=800'],
      farmName: 'ฟาร์มโคนมสุรินทร์',
      contactPhone: '082-345-6789',
      rating: 4.7,
      reviewCount: 32,
      createdDate: '2024-11-08',
    },
    {
      id: '3',
      userId: '3',
      title: 'มูลสุกรหมัก',
      animalType: 'สุกร',
      wasteType: 'มูลหมัก',
      quantity: 800,
      price: 200,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มสุกร, นครปฐม',
      distance: 15.7,
      verified: true,
      npk: { n: 3.8, p: 3.2, k: 2.4 },
      feedType: 'อาหารข้น (สูตรสำเร็จรูป)',
      description: 'มูลสุกรหมัก ผ่านกระบวนการหมักที่ถูกต้อง ไม่มีกลิ่น',
      images: ['https://images.unsplash.com/photo-1674880785058-2c98aff0a62f?w=800'],
      farmName: 'ฟาร์มสุกรนครปฐม',
      contactPhone: '083-456-7890',
      rating: 4.6,
      reviewCount: 18,
      createdDate: '2024-11-05',
    },
    {
      id: '4',
      userId: '4',
      title: 'มูลเป็ดอินทรีย์',
      animalType: 'เป็ด',
      wasteType: 'มูลแห้ง',
      quantity: 600,
      price: 280,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มเป็ด, ราชบุรี',
      distance: 12.5,
      verified: true,
      npk: { n: 3.2, p: 2.8, k: 1.6 },
      feedType: 'อาหารข้น (สูตรสำเร็จรูป)',
      description: 'มูลเป็ดคุณภาพดี เหมาะสำหรับพืชผักทุกชนิด มีธาตุอาหารสูง',
      images: ['https://images.unsplash.com/photo-1663834780891-4cda88ea2794?w=800'],
      farmName: 'ฟาร์มเป็ดราชบุรี',
      contactPhone: '084-567-8901',
      rating: 4.5,
      reviewCount: 15,
      createdDate: '2024-11-12',
    },
    {
      id: '5',
      userId: '5',
      title: 'มูลแพะออร์แกนิค',
      animalType: 'แพะ',
      wasteType: 'มูลหมัก',
      quantity: 400,
      price: 350,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มแพะ, เพชรบุรี',
      distance: 18.9,
      verified: true,
      npk: { n: 2.8, p: 2.0, k: 1.7 },
      feedType: 'หญ้า/ฟาง',
      description: 'มูลแพะหมักสุก เหมาะสำหรับพืชผักสวนครัว ไม่มีกลิ่น',
      images: ['https://images.unsplash.com/photo-1723625449728-40e7a4d968e7?w=800'],
      farmName: 'ฟาร์มแพะเพชรบุรี',
      contactPhone: '085-678-9012',
      rating: 4.9,
      reviewCount: 21,
      createdDate: '2024-11-11',
    },
    {
      id: '6',
      userId: '6',
      title: 'มูลแกะคุณภาพพรีเมี่ยม',
      animalType: 'แกะ',
      wasteType: 'มูลหมัก',
      quantity: 350,
      price: 380,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มแกะ, กาญจนบุรี',
      distance: 22.3,
      verified: true,
      npk: { n: 3.0, p: 2.2, k: 1.8 },
      feedType: 'หญ้า/ฟาง',
      description: 'มูลแกะพรีเมี่ยม หมักสุก อุดมด้วยธาตุอาหาร เหมาะกับไม้ดอกไม้ประดับ',
      images: ['https://images.unsplash.com/photo-1681154258782-d9c41ae2d6da?w=800'],
      farmName: 'ฟาร์มแกะกาญจนบุรี',
      contactPhone: '086-789-0123',
      rating: 4.8,
      reviewCount: 19,
      createdDate: '2024-11-09',
    },
    {
      id: '7',
      userId: '7',
      title: 'มูลกระบือหมักสุก',
      animalType: 'กระบือ',
      wasteType: 'มูลหมัก',
      quantity: 1500,
      price: 220,
      unit: 'กก. / สัปดาห์',
      location: 'ฟาร์มกระบือ, สุพรรณบุรี',
      distance: 25.6,
      verified: true,
      npk: { n: 2.3, p: 1.6, k: 2.3 },
      feedType: 'หญ้า/ฟาง',
      description: 'มูลกระบือหมักสุก เหมาะสำหรับนาข้าว ไร่อ้อย และพืชไร่',
      images: ['https://images.unsplash.com/photo-1566956884055-5034d746e52f?w=800'],
      farmName: 'ฟาร์มกระบือสุพรรณบุรี',
      contactPhone: '087-890-1234',
      rating: 4.6,
      reviewCount: 28,
      createdDate: '2024-11-07',
    },
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
    setPosts(posts.filter(p => p.userId !== user?.id)); // Keep other users' posts
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    // Don't reset selectedPostId if we're editing
    if (page !== 'create-post') {
      setSelectedPostId(null);
    }
    if (page !== 'create-post') {
      setIsEditingPost(false);
    }
  };

  const handleViewPostDetail = (postId) => {
    setSelectedPostId(postId);
    setCurrentPage('post-detail');
  };

  const handleEditPost = (postId) => {
    setSelectedPostId(postId);
    setIsEditingPost(true);
    setCurrentPage('create-post');
  };

  const handleCreatePost = (newPost) => {
    const post = {
      ...newPost,
      id: Date.now().toString(),
      userId: user.id,
      farmName: user.farmName || user.name,
      rating: 0,
      reviewCount: 0,
      createdDate: new Date().toISOString(),
    };
    setPosts([...posts, post]);
    navigateTo('marketplace');
  };

  const handleUpdatePost = (postId, updatedData) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updatedData } : p));
    setSelectedPostId(null);
    setIsEditingPost(false);
    navigateTo('marketplace');
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
    navigateTo('marketplace');
  };

  const handleOpenChat = (postId) => {
    setChatPostId(postId);
  };

  const handleCloseChat = () => {
    setChatPostId(null);
  };

  const handleConfirmChat = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !user) return;
    
    // สร้างห้องแชทใหม่แต่ไม่เปลี่ยนสถานะโพสต์
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

  const handleConfirmSale = (postId, roomId) => {
    // เปลี่ยนสถานะโพสต์เป็น sold เมื่อยืนยันในหน้าแชท
    setPosts(posts.map(p => p.id === postId ? { ...p, sold: true } : p));
    // เก็บสถานะว่าห้องนี้ยืนยันแล้ว
    setConfirmedChatRooms(prev => new Set([...prev, roomId]));
  };

  const handleCancelChat = (roomId) => {
    // ลบห้องแชทออกจากรายการ
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
    // ลบข้อความแชทออก
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

  if (!user && currentPage === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }

  if (!user && currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
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
            posts={posts.filter(p => p.userId === user.id)}
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
            isMyPost={currentPost.userId === user?.id}
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