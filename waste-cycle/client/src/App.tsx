// client/src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setAuthToken, createProfile, getMyProfile } from './apiServer';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { Toaster, toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  farmName?: string;
  verified?: boolean;
  photoURL?: string; 
}

interface ProfileFormData {
  name: string;
  farmName?: string;
  role: 'user' | 'admin';
}

type Page = 'landing' | 'login' | 'register' | 'app' | 'loading';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
        setCurrentPage('landing');
      }
      setIsLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = useCallback(() => {
    auth.signOut();
    setAuthToken(null);
    setUser(null);
    setCurrentPage('landing');
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

      // (แก้ไขการดักจับ Error ให้ฉลาดขึ้น)
      let errorMsg = 'Unknown error';
      if (err.response) {
        errorMsg = err.response.data?.error || err.response.data?.message || 'Server error';
      } else if (err.request) {
        errorMsg = 'Server ไม่ตอบสนอง (อาจกำลังปรับปรุง)';
      } else {
        errorMsg = err.message || 'An unexpected error occurred';
      }

      setError(errorMsg);
      toast.error(`สร้างโปรไฟล์ไม่สำเร็จ: ${errorMsg}`);
      
      auth.signOut();
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Dashboard user={user} onLogout={handleLogout} />
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