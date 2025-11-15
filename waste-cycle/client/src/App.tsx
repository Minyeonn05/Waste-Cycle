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
} from './apiServer'; 
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { CreatePost } from './components/CreatePost'; 
import { Toaster, toast } from 'sonner';

// 🚨 (Types ทั้งหมดถูกต้องจากครั้งที่แล้ว) 🚨
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
  sold?: boolean; 
}
export type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'app' // (คือ Dashboard)
  | 'create-post' 
  | 'edit-post' 
  | 'loading';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]); 
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  
  const fetchPosts = useCallback(async () => {
    if (!auth.currentUser) return; 
    setIsLoading(true);
    try {
      const response = await getPosts();
      // 🚨 [แก้ไข] 👈 ต้องเข้าถึง .data (ที่มาจาก { success: true, data: ... })
      setPosts(response.data.data || []); 
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
      toast.error('ไม่สามารถดึงข้อมูลโพสต์ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);

          const response = await getMyProfile();
          
          // 🚨 [แก้ไข] 👈 ต้องเข้าถึง .data
          const profile = response.data.data; 

          setUser(profile);
          setCurrentPage('app');

          await fetchPosts(); 

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
        setPosts([]); 
        setCurrentPage('landing');
      }
      setIsLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [fetchPosts]); 

  const handleLogout = useCallback(() => {
    auth.signOut();
    toast.success('ออกจากระบบสำเร็จ');
  }, []);

  const handleRegisterSuccess = async (profileData: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createProfile(profileData);

      // 🚨 [แก้ไข] 👈 ต้องเข้าถึง .data
      const createdUser = response.data.data; 
      setUser(createdUser);
      setCurrentPage('app');
      toast.success(`ยินดีต้อนรับ, ${createdUser.name}!`);

    } catch (err: any) {
      console.error('💥 Registration Flow Error:', err);
      let errorMsg = err.response?.data?.error || err.message || 'สร้างโปรไฟล์ไม่สำเร็จ';
      setError(errorMsg);
      toast.error(errorMsg);
      
      auth.signOut(); 
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 (ฟังก์ชัน CRUD ทั้งหมดถูกต้อง ไม่ต้องแก้) 🚨
  const handleCreatePost = async (postData: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => {
    setIsLoading(true);
    try {
      await createPost(postData); 
      toast.success('สร้างโพสต์สำเร็จ!');
      await fetchPosts(); 
      setCurrentPage('app'); 
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
      await updatePost(postId, updatedData); 
      toast.success('อัปเดตโพสต์สำเร็จ!');
      await fetchPosts(); 
      setCurrentPage('app'); 
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
      await deletePost(postId); 
      toast.success('ลบโพสต์สำเร็จ');
      await fetchPosts(); 
    } catch (err: any) {
      console.error("Delete post failed:", err);
      toast.error(err.response?.data?.error || 'ลบโพสต์ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToEdit = (post: Post) => {
    setEditingPost(post);
    setCurrentPage('edit-post');
  };

  // 🚨 (Routing ทั้งหมดถูกต้อง ไม่ต้องแก้) 🚨
  if (!authChecked || (isLoading && currentPage === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    );
  }

  if (currentPage === 'app' && user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Dashboard
          user={user}
          onLogout={handleLogout}
          posts={posts} 
          onNavigate={navigateTo} 
          onEditPost={navigateToEdit} 
          onDeletePost={handleDeletePost} 
        />
      </>
    );
  }

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