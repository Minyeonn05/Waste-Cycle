// client/src/components/RegisterPage.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';
// 🚨 ไม่จำเป็นต้อง import User ที่นี่แล้ว
// import type { User } from '../App';

// 🚨 1. แก้ไข: สร้าง Interface สำหรับข้อมูลที่จะส่งไป Register
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  farmName?: string;
  role: 'user' | 'admin';
}

interface RegisterPageProps {
  onRegister: (data: RegisterFormData) => void;
  onBack: () => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onBack, onLoginClick }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    // 🚨 2. แก้ไข: ลบ mockUser ออก
    /*
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: name,
      role: isAdmin ? 'admin' : 'user',
      farmName: isAdmin ? undefined : (farmName.trim() || undefined),
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1759755487703-91f22c31bfbd?w=200',
    };
    onRegister(mockUser);
    */
    
    // ✅ สร้างออบเจ็กต์ข้อมูลจริง
    const formData: RegisterFormData = {
      name,
      email,
      password,
      role: isAdmin ? 'admin' : 'user',
      farmName: isAdmin ? undefined : (farmName.trim() || undefined),
    };
    
    // ✅ ส่งข้อมูลจริงกลับไปให้ App.tsx
    onRegister(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Recycle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle>ลงทะเบียน Waste-Cycle</CardTitle>
            <CardDescription>สร้างบัญชีเพื่อเริ่มซื้อและขายของเสีย</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="สมชาย เกษตรกร"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {!isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="farmName">ชื่อฟาร์ม</Label>
                  <Input
                    id="farmName"
                    type="text"
                    placeholder="ฟาร์มของฉัน (ไม่บังคับ)"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="admin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="admin" className="cursor-pointer">ลงทะเบียนในฐานะผู้ดูแลระบบ</Label>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                ลงทะเบียน
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}