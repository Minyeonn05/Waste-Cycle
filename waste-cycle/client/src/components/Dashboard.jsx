import { useState } from 'react';
import { Package, ShoppingCart, TrendingUp, Star, Eye, Edit, Trash2, MessageCircle, MapPin, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
// Removed: import type { User, Post } from '../App';
import { ImageWithFallback } from "./figma/ImageWithFallback";
import mapImage from "../assets/map.png";

// Removed: interface DashboardProps { ... }

export function Dashboard({ user, onNavigate, posts, onViewDetail, onEdit, onDelete, onChat, allPosts = [] }) { // Removed type annotation for props
  const [searchFilters, setSearchFilters] = useState({
    wasteType: 'all',
    maxDistance: '',
    maxPrice: ''
  });
  const [searchResults, setSearchResults] = useState([]); // Removed type annotation
  const [hasSearched, setHasSearched] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);

  const handleDelete = (postId) => { // Removed type annotation
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      onDelete(postId);
    }
  };

  const handleSearch = () => {
    // ค้นหาจากโพสต์ทั้งหมด (allPosts)
    let filtered = allPosts.filter(post => !post.sold);

    // กรองตามประเภทของเสีย
    if (searchFilters.wasteType !== 'all') {
      filtered = filtered.filter(post => post.wasteType.toLowerCase().includes(searchFilters.wasteType.toLowerCase()));
    }

    // กรองตามระยะทาง
    if (searchFilters.maxDistance) {
      const maxDist = parseFloat(searchFilters.maxDistance);
      filtered = filtered.filter(post => post.distance <= maxDist);
    }

    // กรองตามราคา
    if (searchFilters.maxPrice) {
      const maxPr = parseFloat(searchFilters.maxPrice);
      filtered = filtered.filter(post => post.price <= maxPr);
    }

    setSearchResults(filtered);
    setHasSearched(true);
    setShowMarkers(true);
  };

  if (user.role === 'admin') {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">สวัสดี, {user.name}</h1>
          <p className="text-gray-600">ยินดีต้อนรับสู่แดชบอร์ด</p>
        </div>

        {/* Map Section - Moved to Top */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            {/* Map Image */}
            <div className="relative h-64 md:h-80 bg-gray-100">
              <img 
                src={mapImage} 
                alt="Map" 
                className="w-full h-full object-cover"
              />
              
              {/* View Larger Map Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-4 left-4 bg-white hover:bg-gray-50"
              >
                View larger map
              </Button>

              {/* Simulated Markers */}
              {showMarkers && searchResults.length > 0 && (
                <>
                  {searchResults.slice(0, 5).map((post, index) => (
                    <div
                      key={post.id}
                      className="absolute bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs shadow-lg cursor-pointer hover:bg-green-700 transition-colors"
                      style={{
                        top: `${20 + index * 15}%`,
                        left: `${30 + index * 10}%`
                      }}
                      title={post.title}
                    >
                      {index + 1}
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {/* Filter Section */}
            <div className="p-6 bg-white border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* ประเภทของเสีย */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ประเภทของเสีย</label>
                  <Select 
                    value={searchFilters.wasteType} 
                    onValueChange={(value) => setSearchFilters({...searchFilters, wasteType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="มูลหมู">มูลหมู</SelectItem>
                      <SelectItem value="มูลไก่">มูลไก่</SelectItem>
                      <SelectItem value="มูลวัว">มูลวัว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* ระยะทาง */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ระยะทางไม่เกิน (กิโลเมตร)</label>
                  <Input
                    type="number"
                    placeholder="ระบุระยะทาง"
                    value={searchFilters.maxDistance}
                    onChange={(e) => setSearchFilters({...searchFilters, maxDistance: e.target.value})}
                  />
                </div>
                
                {/* ราคา */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ราคาไม่เกิน (บาท/กก.)</label>
                  <Input
                    type="number"
                    placeholder="ระบุราคา"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results Section */}
        {hasSearched && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl">ผลการค้นหา ({searchResults.length} รายการ)</h2>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('marketplace')}
              >
                ดูทั้งหมดในตลาดกลาง
              </Button>
            </div>

            {/* Search Criteria Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 mb-2">🔍 <strong>เงื่อนไขการค้นหา:</strong></p>
              <div className="flex flex-wrap gap-2">
                {searchFilters.wasteType !== 'all' && (
                  <Badge variant="secondary" className="bg-white">
                    ประเภท: {searchFilters.wasteType}
                  </Badge>
                )}
                {searchFilters.maxDistance && (
                  <Badge variant="secondary" className="bg-white">
                    ระยะทาง: ไม่เกิน {searchFilters.maxDistance} กม.
                  </Badge>
                )}
                {searchFilters.maxPrice && (
                  <Badge variant="secondary" className="bg-white">
                    ราคา: ไม่เกิน ฿{searchFilters.maxPrice}/กก.
                  </Badge>
                )}
                {searchFilters.wasteType === 'all' && !searchFilters.maxDistance && !searchFilters.maxPrice && (
                  <Badge variant="secondary" className="bg-white">
                    ทั้งหมด (ไม่มีเงื่อนไข)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">ข้อมูลจาก: หน้าตลาดกลาง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.slice(0, 6).map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                    {post.images && post.images.length > 0 ? (
                      <ImageWithFallback 
                        src={post.images[0]} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Verified Badge */}
                    {post.verified && !post.sold && (
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                        ✓ พร้อมขาย
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="text-lg mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{post.farmName}</p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location} · {post.distance.toFixed(1)} กม.</span>
                    </div>

                    {/* NPK Values */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">N</p>
                        <p className="text-green-600">{post.npk.n}%</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">P</p>
                        <p className="text-blue-600">{post.npk.p}%</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">K</p>
                        <p className="text-orange-600">{post.npk.k}%</p>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-2xl text-green-600">฿{post.price}</p>
                        <p className="text-xs text-gray-500">ต่อ กก.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">มีพร้อม</p>
                        <p className="text-sm">{post.quantity} กก.</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onViewDetail(post.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        ดูข้อมูล
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onChat(post.id)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {searchResults.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไขการค้นหา</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl mb-1">{posts.length}</p>
              <p className="text-sm text-gray-600">โพสต์ของฉัน</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-3xl mb-1">8</p>
              <p className="text-sm text-gray-600">การซื้อ</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl mb-1">฿128K</p>
              <p className="text-sm text-gray-600">รายได้</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Star className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
              <p className="text-3xl mb-1">4.8</p>
              <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
            </CardContent>
          </Card>
        </div>

        {/* My Posts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">โพสต์ของฉัน ({posts.length})</h2>
            <Button onClick={() => onNavigate('create-post')} className="bg-green-600 hover:bg-green-700">
              + ลงประกาศใหม่
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                  {post.images && post.images.length > 0 ? (
                    <ImageWithFallback 
                      src={post.images[0]} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {post.verified && !post.sold && (
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                      ✓ พร้อมขาย
                    </Badge>
                  )}
                  
                  {/* Sold Badge */}
                  {post.sold && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white shadow-lg">
                      ✓ ขายแล้ว
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="text-lg mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{post.farmName}</p>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location} · {post.distance.toFixed(0)} กม.</span>
                  </div>

                  {/* NPK Values */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">N</p>
                      <p className="text-green-600">{post.npk.n}%</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">P</p>
                      <p className="text-blue-600">{post.npk.p}%</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">K</p>
                      <p className="text-orange-600">{post.npk.k}%</p>
                    </div>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-2xl text-green-600">฿{post.price}</p>
                      <p className="text-xs text-gray-500">ต่อ กก.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">มีพร้อม</p>
                      <p className="text-sm">{post.quantity} กก.</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onViewDetail(post.id)}
                    >
                      ดูข้อมูล
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
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">คุณยังไม่มีโพสต์</p>
                <Button onClick={() => onNavigate('create-post')} className="bg-green-600 hover:bg-green-700">
                  ลงประกาศโพสต์แรก
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>เมนูด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => onNavigate('marketplace')}
              >
                <ShoppingCart className="w-6 h-6" />
                <span>ตลาดกลาง</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => onNavigate('fertilizer-advisor')}
              >
                <TrendingUp className="w-6 h-6" />
                <span>คำนวณปุ๋ย</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => onNavigate('bookings')}
              >
                <Package className="w-6 h-6" />
                <span>การจอง</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => onNavigate('circular-view')}
              >
                <Star className="w-6 h-6" />
                <span>วงจรหมุนเวียน</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ onNavigate }) { // Removed type annotation for props
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">ผู้ใช้ทั้งหมด</p>
              <p className="text-3xl mb-1">248</p>
              <p className="text-sm text-green-600">+18 เดือนนี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">โพสต์ทั้งหมด</p>
              <p className="text-3xl mb-1">342</p>
              <p className="text-sm text-green-600">+24 เดือนนี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">ธุรกรรม</p>
              <p className="text-3xl mb-1">156</p>
              <p className="text-sm text-green-600">+12 เดือนนี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">รอยืนยัน</p>
              <p className="text-3xl mb-1">7</p>
              <p className="text-sm text-yellow-600">ต้องดำเนินการ</p>
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
    </div>
  );
}