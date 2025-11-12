import { useState } from 'react';
import { Header } from './component/common/Header.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Marketplace } from './pages/Marketplace.jsx';
import { CreatePost } from './component/CreatePost.jsx';
import { PostDetail } from './pages/PostDetail.jsx';
import { BookingPage } from './pages/BookingPage.jsx';
import { FertilizerAdvisor } from './pages/FertilizerAdvisor.jsx';
import { NPKCalculator } from './pages/NPKCalculator.jsx';
import { CircularView } from './component/CircularView.jsx';
import { AdminPanel } from './pages/AdminPanel.jsx';
import { ChatDialog } from './component/ChatDialog.jsx';



export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatPostId, setChatPostId] = useState(null);
  
  // Posts state - includes all posts from all users
  const [posts, setPosts] = useState([
    {
      id: '1',
      userId: '1',
      title: 'เสกสรรค์ ฟาร์ม',
      animalType: 'แกะ',
      wasteType: 'มูลแห้ง',
      quantity: 1000,
      price: 300,
      unit: 'ตัน / สัปดาห์',
      location: 'ซับป๋อย ฟาร์ม, บุรีรัมย์',
      distance: 4.2,
      verified: true,
      npk: { n: 3.2, p: 2.8, k: 1.5 },
      feedType: 'อาหารข้น (สูตรสำเร็จรูป)',
      description: 'มูลแกะคุณภาพดี เก็บจากฟาร์มที่มีการจัดการที่ดี',
      images: [],
      farmName: 'ฟาร์มของฉัน',
      contactPhone: '081-234-5678',
      rating: 4.8,
      reviewCount: 24,
      createdDate: '2024-11-10',
    },
    {
      id: '2',
      userId: '2',
      title: 'ฟาร์มไก่ไข่ภูเก็ต',
      animalType: 'ไก่ไข่',
      wasteType: 'มูลสด',
      quantity: 500,
      price: 320,
      unit: 'กก. / วัน',
      location: 'ภูเก็ต',
      distance: 12.5,
      verified: true,
      npk: { n: 3.5, p: 3.0, k: 1.8 },
      feedType: 'อาหารข้น (สูตรสำเร็จรูป)',
      description: 'มูลไก่สด ปริมาณมาก เหมาะสำหรับทำปุ๋ยหมัก',
      images: [],
      farmName: 'ฟาร์มไก่ไข่ภูเก็ต',
      contactPhone: '082-345-6789',
      rating: 4.9,
      reviewCount: 18,
      createdDate: '2024-11-08',
    },
    {
      id: '3',
      userId: '3',
      title: 'ฟาร์มโคนมสุรินทร์',
      animalType: 'โคนม',
      wasteType: 'มูลหมัก',
      quantity: 2000,
      price: 250,
      unit: 'กก. / สัปดาห์',
      location: 'สุรินทร์',
      distance: 8.3,
      verified: true,
      npk: { n: 2.5, p: 1.8, k: 2.1 },
      feedType: 'หญ้า/ฟาง',
      description: 'มูลโคหมักพร้อมใช้ คุณภาพดี',
      images: [],
      farmName: 'ฟาร์มโคนมสุรินทร์',
      contactPhone: '083-456-7890',
      rating: 4.7,
      reviewCount: 32,
      createdDate: '2024-11-05',
    },
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
    setPosts(posts.filter(p => p.userId !== user.id)); // Keep other users' posts
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedPostId(null);
    setIsEditingPost(false);
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
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChat}
          />
        )}
        {currentPage === 'marketplace' && user.role !== 'admin' && (
          <Marketplace 
            user={user} 
            posts={posts}
            onViewDetail={handleViewPostDetail}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onChat={handleOpenChat}
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
        {currentPage === 'fertilizer-advisor' && user.role !== 'admin' && <FertilizerAdvisor user={user} />}
        {currentPage === 'npk-calculator' && user.role !== 'admin' && <NPKCalculator user={user} />}
        {currentPage === 'circular-view' && <CircularView />}
        {currentPage === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>

      {/* Chat Dialog */}
      {chatPost && (
        <ChatDialog 
          post={chatPost}
          currentUser={user}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}