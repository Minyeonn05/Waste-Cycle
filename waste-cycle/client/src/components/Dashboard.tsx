// client/src/components/Dashboard.tsx
import { useState } from 'react';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  MessageSquare,
  Recycle,
  Lightbulb,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui'; // (สมมติว่า import มาจาก ./ui)
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { auth } from '../firebaseConfig'; // (จำเป็นสำหรับ fallback)

interface User {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  farmName?: string;
  verified?: boolean;
}

// 1. 🚨 เพิ่ม onLogout ใน Interface
interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// 2. 🚨 รับ onLogout เข้ามาใน props
export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState('overview');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* ... (ส่วน Sidebar Navigation) ... */}
      <nav className="hidden border-r bg-muted/40 md:block">
        {/* ... (โค้ด Sidebar) ... */}
      </nav>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* ... (ส่วน Header ด้านบน) ... */}
          
          <div className="ml-auto flex-1 sm:flex-initial">
            {/* ... (Search bar) ... */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>โปรไฟล์</DropdownMenuItem>
              <DropdownMenuItem>ตั้งค่า</DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* 3. 🚨 (สำคัญมาก) เปลี่ยน onClick ให้เรียก onLogout */}
              <DropdownMenuItem onClick={onLogout}>
                ออกจากระบบ
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* ... (ส่วนเนื้อหา Dashboard) ... */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              {activePage === 'overview' && 'ภาพรวม'}
              {activePage === 'market' && 'ตลาดซื้อขาย'}
              {/* ... (อื่นๆ) ... */}
            </h1>
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
            x-chunk="dashboard-02-chunk-1"
          >
            {/* (นี่คือจุดที่ Component ของแต่ละหน้าจะถูก Render
              เช่น <Marketplace /> หรือ <ProfilePage />
              ขึ้นอยู่กับ state 'activePage')
            */}
          </div>
        </main>
      </div>
    </div>
  );
}