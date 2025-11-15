// client/src/components/Dashboard.tsx
import React from 'react';
import type { User, Post, Page } from '../App'; // 👈 Import Types จาก App.tsx
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LogOut, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminPanel } from './AdminPanel'; // 👈 (ถ้ามี AdminPanel)

interface DashboardProps {
  user: User;
  onLogout: () => void;
  
  // 🚨 [เพิ่ม] 👈 รับ Props ใหม่จาก App.tsx
  posts: Post[];
  onNavigate: (page: Page) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

export function Dashboard({
  user,
  onLogout,
  posts,
  onNavigate,
  onEditPost,
  onDeletePost
}: DashboardProps) {

  // -------------------------------------------------
  // 🚨 (ส่วนนี้สำหรับ Admin) 🚨
  // -------------------------------------------------
  if (user.role === 'admin') {
    // (ถ้าคุณมีไฟล์ AdminPanel.tsx ให้ Import มาใช้)
    // return <AdminPanel user={user} onLogout={onLogout} />;
    
    // (ถ้่าไม่มี ให้ใช้ UI ชั่วคราวนี้)
    return (
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl">Admin Dashboard</h1>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ, {user.name} (ผู้ดูแลระบบ)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>คุณอยู่ในหน้าจัดการระบบ</p>
            {/* (วาง Component AdminPanel ของคุณที่นี่) */}
          </CardContent>
        </Card>
      </div>
    )
  }

  // -------------------------------------------------
  // 🚨 (ส่วนนี้สำหรับ User ทั่วไป) 🚨
  // -------------------------------------------------
  
  // กรองโพสต์เฉพาะของ User คนนี้
  const myPosts = posts.filter(post => post.userId === user.uid);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* (สมมติว่ามี Header Component) */}
      <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl">Waste-Cycle</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">สวัสดี, {user.name}</span>
            <Button onClick={onLogout} variant="ghost" className="text-white hover:bg-green-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl">โพสต์ของฉัน</h2>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onNavigate('create-post')} // 👈 ใช้งาน Action
          >
            <Plus className="w-4 h-4 mr-2" />
            สร้างโพสต์ใหม่
          </Button>
        </div>

        {/* 🚨 [เพิ่ม] 👈 ส่วนแสดงผล Post */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPosts.length > 0 ? (
            myPosts.map(post => (
              <Card key={post.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.animalType} ({post.wasteType})</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p>ราคา: {post.price} บาท / {post.unit}</p>
                  <p>จำนวน: {post.quantity} กก.</p>
                  <p>ที่อยู่: {post.location}</p>
                </CardContent>
                <div className="flex border-t p-4 gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onEditPost(post)} // 👈 ใช้งาน Action
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    แก้ไข
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => onDeletePost(post.id)} // 👈 ใช้งาน Action
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent className="p-12 text-center text-gray-500">
                <p>คุณยังไม่มีโพสต์</p>
                <Button 
                  className="mt-4" 
                  onClick={() => onNavigate('create-post')} // 👈 ใช้งาน Action
                >
                  สร้างโพสต์แรกของคุณ
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* (เพิ่ม Component อื่นๆ ที่นี่ เช่น Marketplace, Booking ฯลฯ) */}
        
      </main>
    </div>
  );
}