import { useState } from 'react';
import { Button } from '../component/ui/button';
import { Input } from '../component/ui/input';
import { Label } from '../component/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../component/ui/card";
import { ArrowLeft, Recycle } from 'lucide-react';




export function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock login - in real app, this would authenticate with backend
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      farmName: 'ฟาร์มของฉัน',
      location: { lat: 13.7563, lng: 100.5018 },
      verified: true
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
        </Button>

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

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>สำหรับทดสอบ: ใช้อีเมลและรหัสผ่านใดก็ได้</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}