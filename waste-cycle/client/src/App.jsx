// client/src/App.jsx
import { useState, useEffect } from 'react';
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

// Import Firebase Auth
import { auth } from './firebaseClientConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  
  // 🚨 1. 👈 เปลี่ยน Mock data เป็น Array ว่าง
  const [posts, setPosts] = useState([]);
  
  // 🚨 2. 👈 [ฟังก์ชันใหม่] สำหรับดึงข้อมูลจาก Server
  const fetchPosts = async () => {
    try {
      // (Server ของคุณต้องรันอยู่ที่ Port 8000 ด้วยนะครับ)
      const response = await fetch('http://localhost:8000/api/wastes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // 🚨 3. 👈 (สำคัญ) ข้อมูลจาก Firestore อาจจะไม่มี 'id' ใน object
      // เราต้องดึง id มาใส่เอง (ถ้า `getAllProducts` ของคุณส่งมาแบบมี id อยู่แล้ว ก็ไม่ต้อง .map())
      const formattedPosts = data.data.map(post => ({
        id: post.id,
        ...post,
        // (เพิ่มข้อมูล Mock ชั่วคราว ถ้า Server ยังไม่มี)
        distance: post.distance || Math.floor(Math.random() * 20),
        rating: post.rating || 4.5,
        reviewCount: post.reviewCount || 20,
        coordinates: post.coordinates || { lat: 18.7883, lng: 98.9853 }
      }));
      
      setPosts(formattedPosts);

    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // (กรณีดึงข้อมูลไม่สำเร็จ ก็จะแสดงโพสต์ 0 อัน)
      setPosts([]);
    }
  };

  // 4. 👈 [แก้ไข] useEffect (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          role: 'user', 
          farmName: currentUser.email.split('@')[0],
          location: { lat: 18.7883, lng: 98.9853 }, // 👈 (เชียงใหม่)
          verified: true
        });
        setCurrentPage('dashboard');
        // 🚨 5. 👈 ดึงข้อมูลโพสต์ *หลังจาก* Login สำเร็จ
        fetchPosts(); 
      } else {
        setUser(null);
        setCurrentPage('landing');
        setPosts([]); // 👈 (ถ้า Logout ก็ล้างโพสต์)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // 👈 ให้ทำงานแค่ครั้งเดียวตอนเปิดแอป

  // (handleLogin, handleLogout, navigateTo, handleViewPostDetail, handleEditPost... เหมือนเดิม)
  const handleLogin = (userData) => {
    if (userData) {
      setUser(userData);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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

  // 🚨 6. 👈 [แก้ไข] handleCreatePost
  const handleCreatePost = (newPost) => {
    // (ในอนาคต: ตรงนี้ควรยิง API "POST" /api/wastes ไปที่ Server
    // แล้วค่อย fetchPosts() ใหม่อีกครั้ง)
    
    // (แบบชั่วคราว: เพิ่มใน State ไปก่อน)
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

  // 🚨 7. 👈 [แก้ไข] handleUpdatePost
  const handleUpdatePost = (postId, updatedData) => {
    // (ในอนาคต: ตรงนี้ควรยิง API "PUT" /api/wastes/:id)
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updatedData } : p));
    navigateTo('marketplace');
  };

  // 🚨 8. 👈 [แก้ไข] handleDeletePost
  const handleDeletePost = (postId) => {
    // (ในอนาคต: ตรงนี้ควรยิง API "DELETE" /api/wastes/:id)
    setPosts(posts.filter(p => p.id !== postId));
    navigateTo('marketplace');
  };
  
  // (handleOpenChat, handleCloseChat... เหมือนเดิม)
  const handleOpenChat = async (postId) => {
    if (!user || !auth.currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนเริ่มแชตครับ');
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:8000/api/chat/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: postId })
      });
      const data = await response.json();
      if (data.success) {
        setChatRoomId(data.roomId);
      } else {
        console.error('Failed to initiate chat:', data.error);
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์แชตได้');
    }
  };

  const handleCloseChat = () => {
    setChatRoomId(null);
  };

  // (ส่วน return ... เหมือนเดิมทั้งหมด)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user && currentPage === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
  }

  if (!user && currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
  }

  const currentPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const chatPost = chatRoomId ? posts.find(p => p.id === chatRoomId.split('_')[2]) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} onNavigate={navigateTo} currentPage={currentPage} />
      
      <main className="pt-16">
        {/* 🚨 9. 👈 [ข้อมูลจริง]
          ตรงนี้โค้ดถูกต้องอยู่แล้วครับ มันจะกรองโพสต์ (posts) ที่เราดึงมา
          เหลือเฉพาะ `p.userId === user.id` (โพสต์ของเรา)
          แล้วส่งไปให้ Dashboard เองอัตโนมัติ!
        */}
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
        {/* Marketplace ก็จะแสดงโพสต์จริงทั้งหมด (posts) อัตโนมัติ */}
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

      {chatPost && user && chatRoomId && (
        <ChatDialog 
          roomId={chatRoomId}
          post={chatPost}
          currentUser={user}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}