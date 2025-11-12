// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Button } from '../component/ui/button.jsx';
import { Input } from '../component/ui/input.jsx';
import { Label } from '../component/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../component/ui/card.jsx';
import { ArrowLeft, Recycle } from 'lucide-react';

// 1. Import auth และ
import { auth } from '../firebaseClientConfig'; // (จากไฟล์ที่เราเพิ่งสร้าง)
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// 2. 👈 ฟังก์ชันสำหรับเช็กอีเมล (Regex ง่ายๆ)
const isEmailValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    // --- 3. 👈 [ส่วนที่ 1] การตรวจสอบก่อนส่ง (Client-Side Validation) ---

    // 3.1 เช็กรูปแบบอีเมล
    if (!isEmailValid(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return; // 👈 หยุดทำงาน
    }

    // 3.2 เช็ก "รหัสไม่ครบ" (สำหรับตอนสมัคร)
    if (isRegister && password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return; // 👈 หยุดทำงาน
    }

    // --- 4. 👈 [ส่วนที่ 2] การส่งไป Firebase ---
    try {
      if (isRegister) {
        // โหมดสมัครสมาชิก
        await createUserWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged ใน App.jsx จะจัดการที่เหลือเอง
      } else {
        // โหมด Login
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged ใน App.jsx จะจัดการที่เหลือเอง
      }
      
    } catch (err) {
      // --- 5. 👈 [ส่วนที่ 3] การจัดการ Error ที่ Firebase ส่งกลับมา ---
      console.error("Firebase Auth Error: ", err.code, err.message);
      
      // แปลง Error code เป็นภาษาไทย
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found': // (บางที Firebase ก็ส่งอันนี้)
        case 'auth/wrong-password': // (บางที Firebase ก็ส่งอันนี้)
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          break;
        case 'auth/invalid-email':
          setError('รูปแบบอีเมลไม่ถูกต้อง');
          break;
        case 'auth/email-already-in-use': // (สำหรับตอนสมัคร)
          setError('อีเมลนี้มีผู้ใช้งานแล้ว');
          break;
        case 'auth/weak-password': // (สำหรับตอนสมัคร)
          setError('รหัสผ่านสั้นเกินไป (ต้องอย่างน้อย 6 ตัวอักษร)');
          break;
        case 'auth/too-many-requests':
          setError('คุณพยายามบ่อยเกินไป กรุณาลองใหม่ในภายหลัง');
          break;
        default:
          setError('เกิดข้อผิดพลาด: ' + err.message);
      }
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

              {/* 6. 👈 จุดแสดง Error (ไม่ว่าจะเป็น Validation หรือจาก Firebase) */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <Button type="submit" className="w-full">
                {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

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