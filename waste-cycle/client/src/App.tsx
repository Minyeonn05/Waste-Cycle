// client/src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  setAuthToken,
  createProfile,
  getMyProfile,
  getPosts,
  createPost,
  updatePost,
  deletePost
} from './apiServer'; // 👈 [แก้ไข] Import API ทั้งหมด
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { CreatePost } from './components/CreatePost'; // 👈 [เพิ่ม]
import { Toaster, toast } from 'sonner';

// 🚨 [ย้ายมาที่นี่] 👈 ย้าย Types มาที่นี่เพื่อให้ Import ง่าย
export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  farmName?: string;
  verified?: boolean;
  photoURL?: string;
}

export interface ProfileFormData {
  name: string;
  farmName?: string;
  role: 'user' | 'admin';
}

export interface Post {
  id: string;
  userId: string;
  createdDate: string;
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
  contactPhone: string;
  rating?: number;
  reviewCount?: number;
}

// 🚨 [แก้ไข] 👈 เพิ่มหน้าสำหรับ Post
export type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'app' // (คือ Dashboard)
  | 'create-post' // 👈 [เพิ่ม]
  | 'edit-post' // 👈 [เพิ่ม]
  | 'loading';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]); // 👈 [เพิ่ม]
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined); // 👈 [เพิ่ม]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 🚨 [เพิ่ม] 👈 ฟังก์ชันดึงโพสต์
  const fetchPosts = useCallback(async () => {
    if (!auth.currentUser) return; // ต้อง Login ก่อน
    setIsLoading(true);
    try {
      const response = await getPosts(); // (เรียก API)
      setPosts(response.data.data || []); // 👈 (แก้ path ตาม API response)
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
      toast.error('ไม่สามารถดึงข้อมูลโพสต์ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // [แก้ไข] useEffect (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);

          const response = await getMyProfile();
          const profile = response.data.user;

          setUser(profile);
          setCurrentPage('app');

          await fetchPosts(); // 👈 [เพิ่ม] ดึงโพสต์หลังจาก Login

        } catch (err: any) {
          console.error("Auth state change error:", err);
          setError(err.response?.data?.error || err.message || 'Failed to fetch profile');
          setAuthToken(null);
          setUser(null);
          setCurrentPage('landing');
        }
      } else {
        setAuthToken(null);
        setUser(null);
        setPosts([]); // 👈 [เพิ่ม] ล้างโพสต์เมื่อ Logout
        setCurrentPage('landing');
      }
      setIsLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [fetchPosts]); // 👈 [เพิ่ม] dependency

  const handleLogout = useCallback(() => {
    auth.signOut();
    // (State อื่นๆ จะถูกล้างโดย onAuthStateChanged)
    toast.success('ออกจากระบบสำเร็จ');
  }, []);

  const handleRegisterSuccess = async (profileData: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // ขั้นตอนที่ 1: เรียก API สร้างโปรไฟล์
      const response = await createProfile(profileData);

      // ขั้นตอนที่ 2: ดึงข้อมูล User ที่เพิ่งสร้างเสร็จ
      const createdUser = response.data.user;
      setUser(createdUser);
      setCurrentPage('app');
      toast.success(`ยินดีต้อนรับ, ${createdUser.name}!`);

    } catch (err: any) {
      console.error('💥 Registration Flow Error:', err);
      let errorMsg = err.response?.data?.error || err.message || 'สร้างโปรไฟล์ไม่สำเร็จ';
      setError(errorMsg);
      toast.error(errorMsg);
      
      auth.signOut(); // 👈 ล็อกเอาท์ ถ้าสร้างโปรไฟล์ไม่สำเร็จ
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 [เพิ่ม] 👈 ฟังก์ชันสำหรับ CRUD Posts (ที่ CreatePost.tsx จะเรียก)

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
    setIsLoading(true);
    try {
      await createPost(postData); // (เรียก API)
      toast.success('สร้างโพสต์สำเร็จ!');
      await fetchPosts(); // ดึงข้อมูลใหม่
      setCurrentPage('app'); // กลับไปหน้า Dashboard
    } catch (err: any) {
      console.error("Create post failed:", err);
      toast.error(err.response?.data?.error || 'สร้างโพสต์ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (postId: string, updatedData: Partial<Post>) => {
    setIsLoading(true);
    try {
      await updatePost(postId, updatedData); // (เรียก API)
      toast.success('อัปเดตโพสต์สำเร็จ!');
      await fetchPosts(); // ดึงข้อมูลใหม่
      setCurrentPage('app'); // กลับไปหน้า Dashboard
      setEditingPost(undefined);
    } catch (err: any) {
      console.error("Update post failed:", err);
      toast.error(err.response?.data?.error || 'อัปเดตโพสต์ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('คุณแน่ใจหรือว่าต้องการลบโพสต์นี้?')) return;

    setIsLoading(true);
    try {
      await deletePost(postId); // (เรียก API)
      toast.success('ลบโพสต์สำเร็จ');
      await fetchPosts(); // ดึงข้อมูลใหม่ (หรือ filter ออกจาก state)
      // setPosts(posts.filter(p => p.id !== postId)); (เร็วกว่า แต่ fetch ดีกว่า)
    } catch (err: any) {
      console.error("Delete post failed:", err);
      toast.error(err.response?.data?.error || 'ลบโพสต์ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 [เพิ่ม] 👈 ฟังก์ชันสำหรับ Navigation
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToEdit = (post: Post) => {
    setEditingPost(post);
    setCurrentPage('edit-post');
  };

  if (!authChecked || (isLoading && currentPage === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  // 🚨 [แก้ไข] 👈 การ Render หน้า (Routing)

  if (currentPage === 'app' && user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Dashboard
          user={user}
          onLogout={handleLogout}
          // 🚨 [เพิ่ม] 👈 ส่ง State และ Actions ไปให้ Dashboard
          posts={posts} 
          onNavigate={navigateTo} 
          onEditPost={navigateToEdit} 
          onDeletePost={handleDeletePost} 
        />
      </>
    );
  }

  // 🚨 [เพิ่ม] 👈 หน้าสร้างและแก้ไขโพสต์
  if ((currentPage === 'create-post' || currentPage === 'edit-post') && user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <CreatePost
          user={user}
          onBack={() => setCurrentPage('app')}
          onCreate={handleCreatePost}
          onUpdate={handleUpdatePost}
          editingPost={currentPage === 'edit-post' ? editingPost : undefined}
        />
      </>
    );
  }

  if (currentPage === 'login') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage
          onBack={() => setCurrentPage('landing')}
          onRegisterClick={() => setCurrentPage('register')}
        />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onBack={() => setCurrentPage('landing')}
          onLoginClick={() => setCurrentPage('login')}
        />
      </>
    );
  }

  // (หน้า Landing)
  return (
    <>
      <Toaster position="top-right" richColors />
      <LandingPage
        onLogin={() => setCurrentPage('login')}
        onRegister={() => setCurrentPage('register')}
      />
    </>
  );
}

export default App;