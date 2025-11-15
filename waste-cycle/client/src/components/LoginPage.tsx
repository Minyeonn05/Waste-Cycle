import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';
import type { User, UserRole } from '../App';
import { loginUser, getMyProfile } from '../apiServer';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function LoginPage({ onLogin, onBack, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login with Firebase Auth
      const userCredential = await loginUser(email, password);
      const firebaseUser = userCredential.user;

      // Get user profile from backend
      try {
        const profileResponse = await getMyProfile();
        const profileData = profileResponse.data.data || profileResponse.data;
        
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: profileData.displayName || profileData.name || firebaseUser.displayName || 'ผู้ใช้',
          role: profileData.role || 'user',
          farmName: profileData.farmName,
          verified: firebaseUser.emailVerified || profileData.verified || false,
          avatar: profileData.photoURL || profileData.avatar || firebaseUser.photoURL,
        };
        
        onLogin(user);
      } catch (profileError: any) {
        // If profile doesn't exist, create a basic user object
        if (profileError.response?.status === 404) {
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || email,
            name: firebaseUser.displayName || 'ผู้ใช้',
            role: 'user',
            verified: firebaseUser.emailVerified,
            avatar: firebaseUser.photoURL,
          };
          onLogin(user);
        } else {
          throw profileError;
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.code === 'auth/user-not-found' ? 'ไม่พบผู้ใช้นี้ในระบบ' :
        err.code === 'auth/wrong-password' ? 'รหัสผ่านไม่ถูกต้อง' :
        err.code === 'auth/invalid-email' ? 'รูปแบบอีเมลไม่ถูกต้อง' :
        err.code === 'auth/too-many-requests' ? 'เข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอสักครู่' :
        err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Recycle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle>เข้าสู่ระบบ Waste-Cycle</CardTitle>
            <CardDescription>เข้าสู่ระบบเพื่อซื้อและขายของเสีย</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  ลงทะเบียน
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
