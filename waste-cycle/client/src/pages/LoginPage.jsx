// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Recycle } from 'lucide-react';

// 1. 👈 Import auth และ signIn
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

              {/* 6. 👈 แสดง Error ถ้ามี */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              {/* (ลบ Checkbox "ผู้ดูแลระบบ" ออก) */}

              <Button type="submit" className="w-full">
                {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {/* 7. 👈 เพิ่มปุ่มสลับโหมด */}
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