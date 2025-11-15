import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';
import type { User, UserRole } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function LoginPage({ onLogin, onBack, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockUser: User = {
      id: '1',
      email: email,
      name: 'สมชาย เกษตรกร',
      role: email.includes('admin') ? 'admin' : 'user',
      farmName: email.includes('admin') ? undefined : 'ฟาร์มของฉัน',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1759755487703-91f22c31bfbd?w=200',
    };
    
    onLogin(mockUser);
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="admin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="admin" className="cursor-pointer">เข้าสู่ระบบในฐานะผู้ดูแลระบบ</Label>
              </div>

              <Button type="submit" className="w-full">
                เข้าสู่ระบบ
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

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>สำหรับทดสอบ: ใช้อีเมลและรหัสผ่านใดก็ได้</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
