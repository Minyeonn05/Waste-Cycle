// client/src/components/LoginPage.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Recycle } from 'lucide-react';

// 1. Import Firebase
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginPageProps {
  // 2. ลบ onLogin ออก (จัดการในนี้)
  onBack: () => void;
  onRegisterClick: () => void;
}

export function LoginPage({ onBack, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 3. เรียก Firebase Client SDK
      await signInWithEmailAndPassword(auth, email, password);
      // ... จบ! ...
      // onAuthStateChanged ใน App.tsx จะตรวจจับได้เอง
      
    } catch (err: any) {
      console.error("Firebase Login failed:", err.code);
      setError(getFirebaseErrorMessage(err.code));
      setIsLoading(false);
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
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

// ฟังก์ชันช่วยแปล Error Code
const getFirebaseErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/user-not-found':
      return 'ไม่พบผู้ใช้นี้';
    case 'auth/wrong-password':
      return 'รหัสผ่านไม่ถูกต้อง';
    default:
      return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
  }
};