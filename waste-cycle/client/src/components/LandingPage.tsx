// client/src/components/LandingPage.tsx
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Recycle } from 'lucide-react';

// 1. 🚨 แก้ไข Interface:
interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

// 2. 🚨 แก้ไข Signature ของฟังก์ชัน:
export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Recycle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">Waste-Cycle</CardTitle>
            <CardDescription className="text-lg">
              เปลี่ยนของเสียให้เป็นศูนย์ (Waste to Zero)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6">
              แพลตฟอร์มกลางสำหรับซื้อ-ขาย และจัดการของเสียภาคการเกษตร
              เพื่อสร้างระบบเศรษฐกิจหมุนเวียน
            </p>
            <div className="space-y-4">
              {/* 3. 🚨 แก้ไข onClick ของปุ่ม Login: */}
              <Button onClick={onLogin} className="w-full text-lg py-6">
                เข้าสู่ระบบ
              </Button>
              {/* 4. 🚨 แก้ไข onClick ของปุ่ม Register: */}
              <Button onClick={onRegister} variant="outline" className="w-full text-lg py-6">
                ลงทะเบียน
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}