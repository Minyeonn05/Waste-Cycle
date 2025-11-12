// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Button } from '../component/ui/button.jsx';
import { Input } from '../component/ui//input.jsx';
import { Label } from '../component/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../component/ui/card.jsx';
import { ArrowLeft, Recycle } from 'lucide-react';

// 1. Import auth และ
import { auth } from '../firebaseClientConfig'; // (จากไฟล์ที่เราเพิ่งสร้าง)
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false); // 👈 เพิ่ม state สำหรับสลับหน้า

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let userCredential;
      if (isRegister) {
        // 2. โหมดสมัครสมาชิก
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // 3. โหมด Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;

      // 4. ส่ง user "จริง" กลับไปที่ App.jsx (onLogin จะถูกเรียกโดย onAuthStateChanged)
      // เราจึงไม่จำเป็นต้องเรียก onLogin(user) ที่นี่แล้ว
      // onAuthStateChanged ใน App.jsx จะจัดการเอง

    } catch (err) {
      console.error("Firebase Auth Error: ", err.message);
      setError(err.message); // 5. แสดง Error
    }
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
            <CardTitle>{isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'} Waste-Cycle</CardTitle>
            <CardDescription>
              {isRegister ? 'สร้างบัญชีเพื่อเริ่มใช้งาน' : 'เข้าสู่ระบบเพื่อซื้อและขายของเสีย'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* 6. เปลี่ยน onSubmit */}
            <form onSubmit={handleAuth} className="space-y-4">
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

              {/* 7. แสดง Error ถ้ามี */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              {/* (ลบ Checkbox "ผู้ดูแลระบบ" ออก) */}

              <Button type="submit" className="w-full">
                {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {/* 8. เพิ่มปุ่มสลับโหมด */}
            <div className="mt-4 text-center text-sm">
              <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}