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
  Search,
} from 'lucide-react';

// --- 🚨 START: แก้ไข Imports ---
// (แยก import ตามไฟล์จริง)
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
// --- 🚨 END: แก้ไข Imports ---

// 1. 🚨 แก้ไข Interface User
interface User {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  farmName?: string;
  verified?: boolean;
  photoURL?: string; 
}

// 2. 🚨 เพิ่ม onLogout ใน Interface
interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// 3. 🚨 รับ onLogout เข้ามาใน props
export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState('overview');

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* --- Sidebar --- */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <Recycle className="h-6 w-6 text-green-600" />
              <span className="">Waste-Cycle</span>
            </a>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <button
                onClick={() => setActivePage('overview')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  activePage === 'overview' ? 'bg-muted text-primary' : 'text-muted-foreground'
                } transition-all hover:text-primary`}
              >
                <Home className="h-4 w-4" />
                ภาพรวม
              </button>
              {/* (เพิ่มปุ่มอื่นๆ... เช่น ตลาดซื้อขาย) */}
            </nav>
          </div>
        </div>
      </div>
      
      {/* --- Main Content --- */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ค้นหา..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/S/3 lg:w-1/3"
                />
              </div>
            </form>
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
              
              {/* 4. 🚨 (สำคัญมาก) เปลี่ยน onClick ให้เรียก onLogout */}
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                ออกจากระบบ
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* ... (เนื้อหา) ... */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              {activePage === 'overview' && 'ภาพรวม'}
            </h1>
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                ยินดีต้อนรับ, {user.name}!
              </h3>
              <p className="text-sm text-muted-foreground">
                คุณสามารถเริ่มใช้งานได้เลย
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}