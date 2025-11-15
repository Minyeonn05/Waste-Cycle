// client/src/components/RegisterPage.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Recycle } from 'lucide-react';

// 1. Import Firebase และ setAuthToken
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setAuthToken } from '../apiServer'; // <-- 🚨 Import นี้สำคัญมาก

// 2. สร้าง Interface สำหรับข้อมูลโปรไฟล์
interface ProfileFormData {
  name: string;
  farmName?: string;
  role: 'user' | 'admin';
}

interface RegisterPageProps {
  onRegisterSuccess: (data: ProfileFormData) => void; // <-- 🚨 เปลี่ยน Prop เป็น onRegisterSuccess
  onBack: () => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegisterSuccess, onBack, onLoginClick }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      // 3. 🚨 ขั้นตอนที่ 1: สร้าง User ใน Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 4. 🚨 ขั้นตอนที่ 2 (ที่ขาดไปในรอบก่อน): ขอ Token และตั้งค่าทันที
      const token = await userCredential.user.getIdToken();
      setAuthToken(token); // <-- 🚨 บรรทัดนี้แก้บั๊ก Race Condition

      // 5. 🚨 ขั้นตอนที่ 3: ส่งข้อมูลโปรไฟล์กลับไป App.tsx
      onRegisterSuccess({
        name,
        farmName: isAdmin ? undefined : (farmName.trim() || undefined),
        role: isAdmin ? 'admin' : 'user',
      });
      
    } catch (err: any) {
      console.error("Firebase Register failed:", err.code);
      setError(getFirebaseErrorMessage(err.code));
      setIsLoading(false);
    }
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
                  disabled={isLoading}
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
                  minLength={6}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Label htmlFor="admin" className="cursor-pointer">ลงทะเบียนในฐานะผู้ดูแลระบบ</Label>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียน'}
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

// ฟังก์ชันช่วยแปล Error Code
const getFirebaseErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ถูกใช้งานแล้ว';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/weak-password':
      return 'รหัสผ่านสั้นเกินไป (ต้องอย่างน้อย 6 ตัวอักษร)';
    default:
      return 'เกิดข้อผิดพลาดในการลงทะเบียน';
  }
};