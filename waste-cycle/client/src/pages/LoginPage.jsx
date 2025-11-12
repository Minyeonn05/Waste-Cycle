// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';

export function LoginPage({ onLogin, onBack, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false); // 👈 เพิ่ม state สำหรับสลับหน้า

  const handleAuth = async (e) => {
    e.preventDefault();

    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      farmName: 'ฟาร์มของฉัน',
      location: { lat: 13.7563, lng: 100.5018 },
      verified: true
    };

    try {
      let userCredential;
      if (isRegister) {
        // 2. 👈 โหมดสมัครสมาชิก
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // 3. 👈 โหมด Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;

      // 4. 👈 ส่ง user "จริง" กลับไปที่ App.jsx
      onLogin({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user', // (คุณอาจต้องจัดการ role ใน Firestore ภายหลัง)
        farmName: user.email.split('@')[0],
        location: { lat: 13.7563, lng: 100.5018 },
        verified: true
      });

    } catch (err) {
      console.error("Firebase Auth Error: ", err.message);
      setError(err.message); // 👈 แสดง Error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ... (ปุ่ม Back) ... */}

        <Card>
          <CardHeader className="text-center">
            {/* ... (Icon) ... */}
            <CardTitle>{isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'} Waste-Cycle</CardTitle>
            <CardDescription>
              {isRegister ? 'สร้างบัญชีเพื่อเริ่มใช้งาน' : 'เข้าสู่ระบบเพื่อซื้อและขายของเสีย'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* 5. 👈 เปลี่ยน onSubmit */}
            <form onSubmit={handleAuth} className="space-y-4">
              {/* ... (Input Email, Password) ... */}

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
                <Label htmlFor="admin" className="cursor-pointer">
                  เข้าสู่ระบบในฐานะผู้ดูแลระบบ
                </Label>
              </div>

              <Button type="submit" className="w-full">
                {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onRegister}
              >
                ลงทะเบียน
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
