import { useState } from 'react';
import { Button } from '../component/ui/button';
import { Input } from '../component/ui/input';
import { Label } from '../component/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../component/ui/card";
import { ArrowLeft, Recycle } from 'lucide-react';

export function RegisterPage({ onRegister, onBack }) {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // Mock registration
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      farmName,
      role: isAdmin ? 'admin' : 'user',
      verified: false,
      location: { lat: 13.7563, lng: 100.5018 }
    };

    onRegister(newUser);
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
            <CardTitle>ลงทะเบียน Waste-Cycle</CardTitle>
            <CardDescription>สร้างบัญชีใหม่สำหรับฟาร์มของคุณ</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อผู้ใช้</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmName">ชื่อฟาร์ม</Label>
                <Input
                  id="farmName"
                  type="text"
                  placeholder="ชื่อฟาร์มของคุณ"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
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
                <Label htmlFor="admin" className="cursor-pointer">
                  ลงทะเบียนในฐานะผู้ดูแลระบบ
                </Label>
              </div>

              <Button type="submit" className="w-full">
                ลงทะเบียน
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>มีบัญชีอยู่แล้ว? <span className="text-green-600 cursor-pointer" onClick={onBack}>เข้าสู่ระบบ</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
