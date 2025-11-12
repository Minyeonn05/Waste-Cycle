// client/src/App.jsx
import { useState, useEffect } from 'react'; // 👈 1. เพิ่ม useEffect
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

// 2. 👈 Import Firebase Auth
import { auth } from './firebaseClientConfig.js'; // (จากไฟล์ที่เราเพิ่งสร้าง)
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 3. เพิ่ม State สำหรับ Loading
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  // const [chatPostId, setChatPostId] = useState(null); // 👈 4. ลบอันนี้
  const [chatRoomId, setChatRoomId] = useState(null);  // 👈 ใช้อันนี้แทน
  
  // Posts state - (เพิ่ม coordinates เข้าไปใน mock data)
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
      coordinates: { lat: 14.864, lng: 102.784 } // 👈 (สมมติ) เพิ่มพิกัด
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
      coordinates: { lat: 7.880, lng: 98.392 } // 👈 (สมมติ) เพิ่มพิกัด
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
      coordinates: { lat: 14.884, lng: 103.493 } // 👈 (สมมติ) เพิ่มพิกัด
    },
  ]);

  // 5. 👈 เพิ่ม useEffect เพื่อดักฟังสถานะ Login "จริง"
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // ถ้า Login สำเร็จ
        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          // (ข้อมูลสมมติ)
          role: 'user', 
          farmName: currentUser.email.split('@')[0],
          location: { lat: 18.7883, lng: 98.9853 },
          verified: true
        });
        setCurrentPage('dashboard');
      } else {
        // ถ้า Logout
        setUser(null);
        setCurrentPage('landing');
      }
      setLoading(false); // โหลดเสร็จแล้ว
    });

    return () => unsubscribe(); // Cleanup
  }, []); // 👈 ให้ทำงานแค่ครั้งเดียวตอนเปิดแอป

  const handleLogin = (userData) => {
    // 6. 👈 LoginPage ไม่ต้องเรียก onLogin แล้ว (onAuthStateChanged จัดการแทน)
    // แต่เราเผื่อไว้
    if (userData) {
      setUser(userData);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = async () => {
    // 7. 👈 แก้ไขให้ Logout "จริง"
    await signOut(auth);
    // onAuthStateChanged จะทำงาน -> set user เป็น null -> set page เป็น 'landing' 
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedPostId(null);
    setIsEditingPost(false);
  };

  // ... (ฟังก์ชัน handleViewPostDetail, handleEditPost, handleCreatePost, handleUpdatePost, handleDeletePost เหมือนเดิม) ...
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
  
  // 8. 👈 [หัวใจ] แก้ไขฟังก์ชันนี้เพื่อยิง API
  const handleOpenChat = async (postId) => {
    if (!user || !auth.currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนเริ่มแชตครับ');
      return;
    }

    try {
      // ดึง Token ของ User ที่ Login อยู่
      const token = await auth.currentUser.getIdToken();

      // ยิง API ไปยัง Server ที่เราสร้างไว้
      const response = await fetch('http://localhost:8000/api/chat/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 ส่ง Token เพื่อยืนยันตัวตน
        },
        body: JSON.stringify({ postId: postId })
      });

      const data = await response.json();

      if (data.success) {
        setChatRoomId(data.roomId); // 👈 ได้รับ ID ห้องแชต
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
    // 9. 👈 แก้ไขให้ปิด state ของ roomId
    setChatRoomId(null);
  };

  // 10. 👈 เพิ่มหน้า Loading
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

  // 11. 👈 แก้ไขการหา chatPost
  const currentPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  // หา post จาก roomId (สูตรคือ "buyerId_sellerId_postId")
  const chatPost = chatRoomId ? posts.find(p => p.id === chatRoomId.split('_')[2]) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 12. 👈 Header จะได้รับ user "จริง" แล้ว */}
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

      {/* 13. 👈 Chat Dialog: ส่ง props ที่ถูกต้อง (roomId) */}
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