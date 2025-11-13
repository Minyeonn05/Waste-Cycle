// client/src/App.jsx
import { useState, useEffect } from 'react';
import { Header } from './component/common/Header.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
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

// 🚨 1. [แก้ไข] Import auth, onAuthStateChanged, signOut และ getIdTokenResult
import { auth } from './firebaseClientConfig.js'; 
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null); 
  
  // 🚨 2. [แก้ไข] เปลี่ยน Mock data เป็น Array ว่าง
  const [posts, setPosts] = useState([]);

  // 🚨 3. [เพิ่ม] ฟังก์ชันสำหรับดึงข้อมูลโพสต์จริง
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/wastes');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const formattedPosts = data.data.map(post => ({
        id: post.id,
        ...post,
        distance: post.distance || Math.floor(Math.random() * 20),
        rating: post.rating || 4.5,
        reviewCount: post.reviewCount || 20,
        coordinates: post.coordinates || { lat: 18.7883, lng: 98.9853 }
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    }
  };

  // 🚨 4. [แก้ไข] useEffect (onAuthStateChanged) ให้รองรับ Admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // 👈 เพิ่ม async
      if (currentUser) {

        // 5. [เพิ่ม] ดึง "Role" จริง (Custom Claim) จาก Token
        let userRole = 'user'; 
        try {
          const idTokenResult = await getIdTokenResult(currentUser, true);
          userRole = idTokenResult.claims.role || 'user'; 
        } catch (error) {
          console.error("Error fetching user role:", error);
        }

        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          role: userRole, // 👈 6. [แก้ไข] ใช้ Role จริง
          farmName: currentUser.email.split('@')[0],
          location: { lat: 18.7883, lng: 98.9853 },
          verified: true
        });
        
        // 7. [แก้ไข] ถ้าเป็น admin ให้ไปหน้า AdminPanel
        if (userRole === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
        
        fetchPosts(); // 👈 [เพิ่ม] ดึงข้อมูลโพสต์

      } else {
        setUser(null);
        setCurrentPage('landing');
        setPosts([]); 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  const handleLogin = (userData) => {
    // (ไม่จำเป็นแล้ว)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🚨 8. [แก้ไข] การสลับหน้า (Routing)
  if (!user && currentPage === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentPage('login')} onRegister={() => setCurrentPage('register')} />;
  }

  if (!user && currentPage === 'login') {
    return <LoginPage onBack={() => setCurrentPage('landing')} onGoToRegister={() => setCurrentPage('register')} />;
  }

  if (!user && currentPage === 'register') {
    return <RegisterPage onBack={() => setCurrentPage('landing')} onGoToLogin={() => setCurrentPage('login')} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading user...
      </div>
    );
  }

  const currentPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const chatPost = chatRoomId ? posts.find(p => p.id === chatRoomId.split('_')[2]) : null;

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
        
        {/* 🚨 9. [แก้ไข] นี่คือบรรทัดที่ทำให้ Admin Panel แสดง 🚨 */}
        {currentPage === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>

      {/* (Chat Dialog - เหมือนเดิม) */}
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