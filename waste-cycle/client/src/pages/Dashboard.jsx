// client/src/pages/Dashboard.jsx
import { Package, ShoppingCart, TrendingUp, Users, Truck, CheckCircle, MapPin, Star, Eye, Edit, Trash2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../component/ui/card.jsx';
import { Button } from '../component/ui/button.jsx';
import { Badge } from '../component/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../component/ui/select.jsx';
import { Input } from '../component/ui/input.jsx';
import { useState } from 'react';

// (Import Map - เหมือนเดิม)
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';


export function Dashboard({ user, onNavigate, posts, onViewDetail, onEdit, onDelete, onChat }) {
  const [selectedWasteType, setSelectedWasteType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [maxDistance, setMaxDistance] = useState('');

  const handleDelete = (postId) => {
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      onDelete(postId);
    }
  };

  const userLocation = user.location || { lat: 18.7883, lng: 98.9853 }; // 👈 เชียงใหม่
  const postsWithLocations = posts.filter(p => p.coordinates);

  // 🚨 1. 👈 [เพิ่มโค้ดคำนวณ] 
  // (posts คือ posts ที่ถูก filter มาจาก App.jsx แล้ว)
  
  // โพสต์ทั้งหมด (อันนี้ถูกอยู่แล้ว)
  const totalPosts = posts.length;
  
  // การซื้อ/ขาย (เราจะจำลองจาก "reviewCount" ของทุกโพสต์รวมกัน)
  const totalSales = posts.reduce((acc, post) => acc + (post.reviewCount || 0), 0);
  
  // รายได้ (คำนวณ "มูลค่า" รวมของโพสต์ โดยเอา ราคา * ปริมาณ)
  // (หมายเหตุ: นี่คือการคำนวณคร่าวๆ เพราะ unit อาจจะไม่เหมือนกัน)
  const totalValue = posts.reduce((acc, post) => acc + ((post.price || 0) * (post.quantity || 0)), 0);
  
  // ฟังก์ชัน format ให้อ่านง่าย
  const formatCurrency = (num) => {
    if (num >= 1000) {
      return `฿${(num / 1000).toFixed(0)}K`; // 128000 -> ฿128K
    }
    return `฿${num}`;
  };
  
  // คะแนนเฉลี่ย
  const totalRating = posts.reduce((acc, post) => acc + (post.rating || 0), 0);
  // (หารด้วย totalPosts)
  const avgRating = totalPosts > 0 ? (totalRating / totalPosts).toFixed(1) : '0';


  if (user.role === 'admin') {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* (Map Section - เหมือนเดิม) */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-200">
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={userLocation}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {/* ปักหมุดตำแหน่งของ User (สีน้ำเงิน) */}
          <AdvancedMarker 
            position={userLocation} 
            title={user.farmName}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'blue',
              border: '2px solid white',
              boxShadow: '0 0 5px rgba(0,0,0,0.5)'
            }} />
          </AdvancedMarker>

          {/* ปักหมุด Post ทั้งหมดของ User (สีเขียว) */}
          {postsWithLocations.map(post => (
            <AdvancedMarker
              key={post.id}
              position={post.coordinates}
              title={post.title}
              onClick={() => onViewDetail(post.id)}
            >
              <Package className="w-8 h-8 text-green-700" />
            </AdvancedMarker>
          ))}
        </Map>
      </div>


      <div className="container mx-auto px-4 -mt-20 relative z-10">
        
        {/* (Search Filters Card - เหมือนเดิม) */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            {/* ... (โค้ด Select) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Select value={selectedWasteType} onValueChange={setSelectedWasteType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เหมาะกับพืชชนิดใด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="rice">ข้าว</SelectItem>
                    <SelectItem value="corn">ข้าวโพด</SelectItem>
                    <SelectItem value="vegetables">ผักสวนครัว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="ประเภทสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="available">พร้อมขาย</SelectItem>
                    <SelectItem value="pre-order">สั่งจองล่วงหน้า</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="number"
                  placeholder="ระยะทางไม่เกิน (กิโลเมตร)"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full bg-green-700 hover:bg-green-800">
              🔍 ค้นหา
            </Button>
          </CardContent>
        </Card>
        
        {/* (My Posts Section - เหมือนเดิม) */}
        <div className="mb-6">
          {/* ... (โค้ด "โพสต์ของฉัน" และ .map(post => ...)) ... */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl">โพสต์ของฉัน ({posts.length})</h2>
            <Button onClick={() => onNavigate('create-post')} className="bg-green-700 hover:bg-green-800">
              + ลงประกาศใหม่
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="mb-1">{post.title}</h3>
                      {post.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">พร้อมขาย</Badge>
                      )}
                    </div>
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">ปริมาณ:</span> {post.quantity} {post.unit}
                    </p>
                    <p>
                      <span className="text-gray-600">ราคา:</span> <span className="text-green-600">฿{post.price}/กก.</span>
                    </p>
                    <p>
                      <span className="text-gray-600">สถานะ:</span> <span className="text-green-600">{post.animalType}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">ระยะทาง:</span> {post.distance && post.distance.toFixed(1)} กิโลเมตร
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onViewDetail(post.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      ดูรายละเอียด
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(post.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                  _ onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => onChat(post.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      พูดคุย
            _       </Button>
                    <Button size="sm" className="flex-1 bg-green-700 hover:bg-green-800">
                      ตรวจประเมิน
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {posts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">คุณยังไม่มีโพสต์</p>
                <Button onClick={() => onNavigate('create-post')} className="bg-green-700 hover:bg-green-800">
                  ลงประกาศโพสต์แรก
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* 🚨 2. 👈 [Quick Stats] - แทนที่ค่า Mock ด้วยข้อมูลจริง 🚨 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              {/* โพสต์ทั้งหมด (อันนี้ถูกอยู่แล้ว) */}
              <p className="text-2xl mb-1">{totalPosts}</p>
              <p className="text-sm text-gray-600">โพสต์ทั้งหมด</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
              {/* การซื้อ (เปลี่ยน "8" เป็น totalSales) */}
              <p className="text-2xl mb-1">{totalSales}</p>
              <p className="text-sm text-gray-600">การขาย (จากรีวิว)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              {/* รายได้ (เปลี่ยน "฿128K" เป็น totalValue) */}
              <p className="text-2xl mb-1">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-gray-600">มูลค่าโพสต์ (฿)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              {/* คะแนน (เปลี่ยน "4.8" เป็น avgRating) */}
              <p className="text-2xl mb-1">{avgRating}</p>
              <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// (AdminDashboard function - เหมือนเดิม)
function AdminDashboard({ onNavigate }) {
  // ... (โค้ด AdminDashboard เหมือนเดิม)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl">342</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => onNavigate('admin')} className="h-auto py-4">
              จัดการผู้ใช้
            </Button>
            <Button onClick={() => onNavigate('marketplace')} variant="outline" className="h-auto py-4">
              จัดการโพสต์
            </Button>
            <Button onClick={() => onNavigate('circular-view')} variant="outline" className="h-auto py-4">
              ดูสถิติรวม
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}