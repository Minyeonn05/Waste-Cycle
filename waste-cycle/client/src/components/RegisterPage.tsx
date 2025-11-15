import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';
import type { User } from '../App';
import { registerUser, createProfile, getMyProfile } from '../apiServer';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onBack: () => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onBack, onLoginClick }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    try {
      // Register with Firebase Auth
      const userCredential = await registerUser(email, password);
      const firebaseUser = userCredential.user;

      // Create user profile in backend
      try {
        await createProfile({
          name: name,
          farmName: farmName.trim() || undefined,
          role: 'user',
        });

        // Get the created profile
        const profileResponse = await getMyProfile();
        const profileData = profileResponse.data.data || profileResponse.data;
        
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: profileData.displayName || profileData.name || name,
          role: profileData.role || 'user',
          farmName: profileData.farmName,
          verified: firebaseUser.emailVerified || profileData.verified || false,
          avatar: profileData.photoURL || profileData.avatar || firebaseUser.photoURL,
        };
        
        onRegister(user);
      } catch (profileError: any) {
        console.error('Profile creation error:', profileError);
        // Even if profile creation fails, we can still login
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          name: name,
          role: 'user',
          farmName: farmName.trim() || undefined,
          verified: firebaseUser.emailVerified,
          avatar: firebaseUser.photoURL,
        };
        onRegister(user);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.code === 'auth/email-already-in-use' ? 'อีเมลนี้ถูกใช้งานแล้ว' :
        err.code === 'auth/invalid-email' ? 'รูปแบบอีเมลไม่ถูกต้อง' :
        err.code === 'auth/weak-password' ? 'รหัสผ่านอ่อนแอเกินไป' :
        err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
      );
      setLoading(false);
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

              <div className="space-y-2">
                <Label htmlFor="farmName">ชื่อฟาร์ม (ไม่บังคับ)</Label>
                <Input
                  id="farmName"
                  type="text"
                  placeholder="ฟาร์มของฉัน"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
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
