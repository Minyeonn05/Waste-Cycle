// client/src/components/Dashboard.tsx
import React from 'react';
// 🚨 [แก้ไข] 👈 Import Types จาก App.tsx
import type { User, Post, Page } from '../App'; 
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
// 🚨 [เพิ่ม] 👈 Import ไอคอนสำหรับ Stats และ Map
import { LogOut, Plus, Edit, Trash2, MapPin, Package, Star, TrendingUp, Users, CheckCircle, Eye } from 'lucide-react';
import { AdminPanel } from './AdminPanel'; // (ถ้ามี)
import { Badge } from './ui/badge';
// 🚨 [เพิ่ม] 👈 Import Map
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

// 🚨 [แก้ไข] 👈 Interface ของ Props ที่รับมา
interface DashboardProps {
  user: User;
  onLogout: () => void;
  posts: Post[];
  onNavigate: (page: Page) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

// 🚨 [แก้ไข] 👈 รับ Props ใหม่
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
    // (ถ้าคุณมีไฟล์ AdminPanel.tsx ให้นำเข้าและใช้งาน)
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
            <CardDescription>
              นี่คือหน้าสำหรับผู้ดูแลระบบ (คุณสามารถแทนที่หน้านี้ด้วย AdminPanel.tsx)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             {/* (คัดลอก Stats มาจาก Dashboard.jsx เก่า) */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ผู้ใช้ทั้งหมด</p>
                    <p className="text-2xl">248</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">โพสต์ทั้งหมด</p>
                    <p className="text-2xl">{posts.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ธุรกรรม</p>
                    <p className="text-2xl">156</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">รอยืนยัน</p>
                    <p className="text-2xl">7</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
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
  const userLocation = { lat: 18.7883, lng: 98.9853 }; // (Mock Location)

  // (คำนวณ Stats จาก Dashboard.jsx เก่า)
  const totalPosts = myPosts.length;
  const totalSales = myPosts.reduce((acc, post) => acc + (post.reviewCount || 0), 0);
  const totalValue = myPosts.reduce((acc, post) => acc + ((post.price || 0) * (post.quantity || 0)), 0);
  const totalRating = myPosts.reduce((acc, post) => acc + (post.rating || 0), 0);
  const avgRating = totalPosts > 0 ? (totalRating / totalPosts).toFixed(1) : '0';
  const formatCurrency = (num: number) => {
    if (num >= 1000) return `฿${(num / 1000).toFixed(0)}K`;
    return `฿${num}`;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* (Header) */}
      <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Waste-Cycle (Dashboard)</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">สวัสดี, {user.name}</span>
            <Button onClick={onLogout} variant="ghost" className="text-white hover:bg-green-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 🚨 [เพิ่ม] 👈 นำ UI จาก Dashboard.jsx เก่ามาใช้ */}
      <main className="pt-0"> {/* 👈 (แก้ pt-4 เป็น pt-0) */}
        
        {/* Map Section */}
        <div className="relative h-[300px] md:h-[400px] bg-gray-200">
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={userLocation}
            defaultZoom={12}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            mapId={"DEMO_MAP_ID"} // 👈 (จำเป็นสำหรับ Map)
          >
            <AdvancedMarker position={userLocation} title={user.farmName || user.name}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: 'blue', border: '2px solid white'
              }} />
            </AdvancedMarker>
            
            {/* (ปักหมุดโพสต์) */}
            {myPosts.map(post => (
              <AdvancedMarker
                key={post.id}
                // (ต้องแก้ post.coordinates ถ้ามีข้อมูลจริง)
                position={{ lat: userLocation.lat + Math.random() * 0.05, lng: userLocation.lng + Math.random() * 0.05 }}
                title={post.title}
              >
                <Package className="w-8 h-8 text-green-700" />
              </AdvancedMarker>
            ))}
          </Map>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl mb-1">{totalPosts}</p>
                <p className="text-sm text-gray-600">โพสต์ทั้งหมด</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl mb-1">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-gray-600">มูลค่าโพสต์ (฿)</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl mb-1">{avgRating}</p>
                <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl mb-1">{totalSales}</p>
                <p className="text-sm text-gray-600">การขาย (รีวิว)</p>
              </CardContent>
            </Card>
          </div>

          {/* My Posts Section (เหมือนเดิม) */}
          <div className="flex justify-between items-center mb-4 mt-8">
            <h2 className="text-2xl">โพสต์ของฉัน ({myPosts.length})</h2>
            <Button 
              className="bg-green-600 hover:bg-green-700 shadow-sm"
              onClick={() => onNavigate('create-post')} // 👈 ใช้งาน Action
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้างโพสต์ใหม่
            </Button>
          </div>

          {/* 🚨 [แก้ไข] 👈 ส่วนแสดงผล Post */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.length > 0 ? (
              myPosts.map(post => (
                <Card key={post.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow bg-white">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.animalType} ({post.wasteType})</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <p><span className="text-gray-600">ราคา:</span> {post.price} บาท / {post.unit}</p>
                    <p><span className="text-gray-600">จำนวน:</span> {post.quantity} กก.</p>
                    <p><span className="text-gray-600">ที่อยู่:</span> {post.location}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">N: {post.npk.n}%</Badge>
                      <Badge variant="outline">P: {post.npk.p}%</Badge>
                      <Badge variant="outline">K: {post.npk.k}%</Badge>
                    </div>
                  </CardContent>
                  <div className="flex border-t p-4 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      // onClick={() => onNavigate('post-detail', post.id)} // (ต้องเพิ่มหน้านี้ใน App.tsx)
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onEditPost(post)} // 👈 ใช้งาน Action
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => onDeletePost(post.id)} // 👈 ใช้งาน Action
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              // (นี่คือ UI ที่คุณเห็นใน Screenshot)
              <Card className="md:col-span-3 bg-white">
                <CardContent className="p-12 text-center text-gray-500">
                  <p>คุณยังไม่มีโพสต์</p>
                  <Button 
                    className="mt-4 bg-green-600 hover:bg-green-700" 
                    onClick={() => onNavigate('create-post')} // 👈 ใช้งาน Action
                  >
                    สร้างโพสต์แรกของคุณ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}