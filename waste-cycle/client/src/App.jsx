// client/src/App.jsx
import { useState, useEffect } from 'react';
import { Header } from './component/common/Header.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx'; // 👈 1. [เพิ่ม] Import RegisterPage
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

// 2. 👈 [แก้ไข] Import auth, onAuthStateChanged, signOut และ getIdTokenResult
import { auth } from './firebaseClientConfig.js'; 
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null); 
  
  // 3. 👈 [แก้ไข] เปลี่ยน Mock data เป็น Array ว่าง
  const [posts, setPosts] = useState([]);

  // 4. 👈 [เพิ่ม] ฟังก์ชันสำหรับดึงข้อมูลโพสต์จริง
  const fetchPosts = async () => {
    try {
      // (Server ของคุณต้องรันอยู่ที่ Port 8000 ด้วยนะครับ)
      const response = await fetch('http://localhost:8000/api/wastes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // (Server [productController.js] ส่งข้อมูลมาใน data.data)
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
      setPosts([]);
    }
  };

  // 5. 👈 [แก้ไข] useEffect (onAuthStateChanged) ให้รองรับ Admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // 👈 เพิ่ม async
      if (currentUser) {

        // 6. 👈 [เพิ่ม] ดึง "Role" จริง (Custom Claim) จาก Token
        let userRole = 'user'; // (Default คือ user)
        try {
          const idTokenResult = await getIdTokenResult(currentUser, true); // (true = บังคับโหลดใหม่)
          userRole = idTokenResult.claims.role || 'user'; // 👈 ดึง Role จริงจาก Server
        } catch (error) {
          console.error("Error fetching user role:", error);
        }

        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          role: userRole, // 👈 7. [แก้ไข] ใช้ Role จริง (ไม่ใช่ 'user' ที่ Hardcode)
          farmName: currentUser.email.split('@')[0],
          location: { lat: 18.7883, lng: 98.9853 },
          verified: true
        });
        
        // 8. 👈 [แก้ไข] ถ้าเป็น admin ให้ไปหน้า AdminPanel
        if (userRole === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
        
        // 9. 👈 [เพิ่ม] ดึงข้อมูลโพสต์ *หลังจาก* Login สำเร็จ
        fetchPosts(); 

      } else {
        setUser(null);
        setCurrentPage('landing');
        setPosts([]); // 👈 (ถ้า Logout ก็ล้างโพสต์)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  const handleLogin = (userData) => {
    // (ฟังก์ชันนี้ไม่จำเป็นแล้ว เพราะ onAuthStateChanged จัดการแทน)
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedPostId(null);
    setIsEditingPost(false);
  };

  // ... (ฟังก์ชัน handleViewPostDetail, handleEditPost... เหมือนเดิม) ...
  const handleViewPostDetail = (postId) => {
    setSelectedPostId(postId);
    setCurrentPage('post-detail');
  };

  const handleEditPost = (postId) => {
    setSelectedPostId(postId);
    setIsEditingPost(true);
    setCurrentPage('create-post');
  };

  // 10. 👈 [หมายเหตุ] ฟังก์ชัน Create/Update/Delete นี้ยังทำงานแค่ใน Client
  // ในอนาคต ควรแก้ให้ยิง API (POST, PUT, DELETE) ไปที่ Server แล้วค่อย fetchPosts() ใหม่
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
  
  // (handleOpenChat, handleCloseChat - เหมือนเดิม)
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

  // (Loading - เหมือนเดิม)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 11. 👈 [แก้ไข] การสลับหน้า (Routing)
  if (!user && currentPage === 'landing') {
    // 12. 👈 [แก้ไข] เพิ่มปุ่มไปหน้า Register
    return <LandingPage onGetStarted={() => setCurrentPage('login')} onRegister={() => setCurrentPage('register')} />;
  }

  if (!user && currentPage === 'login') {
    // 13. 👈 [แก้ไข] onLogin ไม่ต้องใช้แล้ว และเพิ่มปุ่มไป Register
    return <LoginPage onBack={() => setCurrentPage('landing')} onGoToRegister={() => setCurrentPage('register')} />;
  }

  // 14. 👈 [เพิ่ม] เพิ่มหน้า Register
  if (!user && currentPage === 'register') {
    return <RegisterPage onBack={() => setCurrentPage('landing')} onGoToLogin={() => setCurrentPage('login')} />;
  }

  // 15. 👈 [เพิ่ม] ถ้า user ยังไม่มี (กำลังโหลด) ให้แสดง Loading
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
        {/* 16. 👈 [ข้อมูลจริง]
          โค้ดที่เหลือตรงนี้ (Routing) ถูกต้องแล้วครับ
          มันจะใช้ 'posts' (ที่เป็นข้อมูลจริง) และ 'user.role' (ที่เป็น Role จริง)
          ในการแสดงผลหน้า Dashboard, Marketplace, หรือ AdminPanel เองอัตโนมัติ
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