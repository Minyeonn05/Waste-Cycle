import { useState } from 'react';
import { Search, MapPin, Filter, Star, Eye, Edit, Trash2, MessageCircle, ShoppingCart, ArrowLeft, Calendar, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../component/ui/card';
import { Button } from '../component/ui/button';
import { Input } from '../component/ui/input';
import { Label } from '../component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../component/ui/select';
import { Slider } from "../component/ui/slider";
import { Badge } from "../component/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../component/ui/tabs";

export default function MarketplaceApp() {
  const [currentView, setCurrentView] = useState('marketplace'); // 'marketplace' or 'detail'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxDistance, setMaxDistance] = useState([50]);
  const [maxPrice, setMaxPrice] = useState([500]);
  const [sortBy, setSortBy] = useState('distance');
  const [activeTab, setActiveTab] = useState('all-posts');

  // Mock user
  const user = { id: 1 };

  // Mock posts with images
  const posts = [
    {
      id: 1,
      userId: 2,
      title: "เสถียรรรค์ ฟาร์ม",
      farmName: "เสถียรรรค์ ฟาร์ม",
      animalType: "แกะ",
      wasteType: "มูลแห้ง",
      quantity: 1000,
      price: 300,
      unit: "กก. / สัปดาห์",
      npk: { n: 3.2, p: 2.8, k: 1.5 },
      distance: 4.2,
      location: "ชั้นป้อม ฟาร์ม, บุรีรัมย์",
      rating: 4.8,
      reviewCount: 24,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1548550023-2bdb3c5f467b?w=800",
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800"
      ],
      feedType: "อาหารเข้มข้น (สูตรสำเร็จรูป)",
      description: "มูลแกะคุณภาพดี เก็บจากฟาร์มที่มีมีการจัดการที่ดี",
      contactPhone: "081-234-5678",
      createdDate: "2024-11-10"
    },
    {
      id: 2,
      userId: 3,
      title: "ฟาร์มโคนมสุรินทร์",
      farmName: "ฟาร์มโคนมสุรินทร์",
      animalType: "โค",
      wasteType: "มูลสด",
      quantity: 2000,
      price: 250,
      unit: "กก. / สัปดาห์",
      npk: { n: 2.5, p: 1.8, k: 2.1 },
      distance: 8.3,
      location: "456 ถ.ซุปเปอร์ไฮเวย์ ต.ท่าศาลา อ.เมือง จ.เชียงใหม่",
      rating: 4.7,
      reviewCount: 32,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800",
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800"
      ],
      feedType: "หญ้า/ฟาง",
      description: "มูลโคนมคุณภาพ จากฟาร์มโคนมที่ได้มาตรฐาน",
      contactPhone: "082-345-6789",
      createdDate: "2024-11-08"
    },
    {
      id: 3,
      userId: 4,
      title: "มูลไก่หมักพร้อมใช้",
      farmName: "ฟาร์มไก่ไข่ภูเก็ต",
      animalType: "ไก่",
      wasteType: "มูลแห้ง",
      quantity: 300,
      price: 80,
      unit: "กก. / สัปดาห์",
      npk: { n: 3.5, p: 3, k: 1.8 },
      distance: 25,
      location: "รายบุรี",
      rating: 0,
      reviewCount: 0,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1548550023-2bdb3c5f467b?w=800",
        "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800"
      ],
      feedType: "อาหารสำเร็จรูป",
      description: "มูลไก่หมักพร้อมใช้ ผ่านกระบวนการหมักอย่าง ไม่มีกลิ่น ราคาถูก",
      contactPhone: "082-345-6789",
      createdDate: "2024-11-11"
    }
  ];

  // Filter posts
  let filteredPosts = posts.filter(post => {
    const matchesSearch = post.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || post.animalType.toLowerCase().includes(selectedType.toLowerCase());
    const matchesDistance = post.distance <= maxDistance[0];
    const matchesPrice = post.price <= maxPrice[0];
    
    return matchesSearch && matchesType && matchesDistance && matchesPrice;
  });

  // Sort posts
  if (sortBy === 'distance') {
    filteredPosts.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === 'price') {
    filteredPosts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'rating') {
    filteredPosts.sort((a, b) => b.rating - a.rating);
  }

  const allPosts = filteredPosts;
  const marketplacePosts = filteredPosts.filter(post => post.userId !== user.id);

  const handleViewDetail = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('marketplace');
    setSelectedPostId(null);
  };

  if (currentView === 'detail' && selectedPostId) {
    const post = posts.find(p => p.id === selectedPostId);
    const isMyPost = post.userId === user.id;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <PostDetail 
          post={post} 
          onBack={handleBack}
          isMyPost={isMyPost}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ตลาดกลางแลกเปลี่ยนของเสีย</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                ตัวกรอง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search">ค้นหา</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="ชื่อฟาร์ม, ประเภทสัตว์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ประเภทของเสีย</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="chicken">ไก่</SelectItem>
                    <SelectItem value="cow">โค</SelectItem>
                    <SelectItem value="pig">สุกร</SelectItem>
                    <SelectItem value="duck">เป็ด</SelectItem>
                    <SelectItem value="sheep">แกะ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ระยะทางสูงสุด: {maxDistance[0]} กม.</Label>
                <Slider
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>ราคาสูงสุด: ฿{maxPrice[0]}/กก.</Label>
                <Slider
                  value={maxPrice}
                  onValueChange={setMaxPrice}
                  max={1000}
                  step={50}
                />
              </div>

              <div className="space-y-2">
                <Label>เรียงตาม</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">ระยะทางใกล้สุด</SelectItem>
                    <SelectItem value="price">ราคาถูกสุด</SelectItem>
                    <SelectItem value="rating">คะแนนสูงสุด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section with Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all-posts">
                  รวมโพสต์ ({allPosts.length})
                </TabsTrigger>
                <TabsTrigger value="marketplace">
                  ตลาดกลาง ({marketplacePosts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-posts">
                <div className="mb-4">
                  <p className="text-gray-600">พบ {allPosts.length} รายการ</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      isMyPost={post.userId === user.id}
                      showAllActions={true}
                      onViewDetail={() => handleViewDetail(post.id)}
                    />
                  ))}
                </div>

                {allPosts.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="marketplace">
                <div className="mb-4">
                  <p className="text-gray-600">พบ {marketplacePosts.length} รายการ</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {marketplacePosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      isMyPost={false}
                      showAllActions={false}
                      onViewDetail={() => handleViewDetail(post.id)}
                    />
                  ))}
                </div>

                {marketplacePosts.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">ยังไม่มีสินค้าในตลาดกลาง</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, isMyPost, showAllActions, onViewDetail }) {
  const handleDelete = () => {
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      alert('ลบโพสต์แล้ว');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Section */}
      {post.images && post.images.length > 0 && (
        <div className="w-full h-48 bg-gray-100 overflow-hidden cursor-pointer" onClick={onViewDetail}>
          <img 
            src={post.images[0]} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <CardDescription>{post.animalType}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {post.verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                พร้อมขาย
              </Badge>
            )}
            {isMyPost && showAllActions && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                โพสต์ของฉัน
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {post.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{post.rating}</span>
            <span className="text-sm text-gray-500">({post.reviewCount} รีวิว)</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">ปริมาณ</p>
            <p>{post.quantity} กก.</p>
          </div>
          <div>
            <p className="text-gray-600">ราคา</p>
            <p className="text-green-600 font-semibold">฿{post.price}/กก.</p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-sm mb-2">คุณค่า NPK</p>
          <div className="flex gap-2">
            <Badge variant="outline">N: {post.npk.n}%</Badge>
            <Badge variant="outline">P: {post.npk.p}%</Badge>
            <Badge variant="outline">K: {post.npk.k}%</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{post.distance} กม. จากคุณ</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewDetail}
            >
              <Eye className="w-4 h-4 mr-1" />
              ดูรายละเอียด
            </Button>
            
            {isMyPost && showAllActions ? (
              <>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isMyPost && showAllActions ? (
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              แชท
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                พูดคุย
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-green-700 hover:bg-green-800"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                จองเลย
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PostDetail({ post, onBack, isMyPost }) {
  const handleDelete = () => {
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      onBack();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
              <div className="flex gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">พร้อมขาย</Badge>
                {post.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ยืนยันแล้ว
                  </Badge>
                )}
              </div>
            </div>
            {isMyPost && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  แก้ไข
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  ลบ
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.images.map((img, index) => (
                <div key={index} className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={img} 
                    alt={`${post.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ประเภทสัตว์</p>
                <p className="text-lg">{post.animalType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">ประเภทของเสีย</p>
                <p className="text-lg">{post.wasteType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">ปริมาณ</p>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <p className="text-lg">{post.quantity} กก.</p>
                </div>
                <p className="text-sm text-gray-500">{post.unit}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">ราคา</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <p className="text-xl text-green-600">฿{post.price}/กก.</p>
                </div>
                <p className="text-sm text-gray-500">{post.unit}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ที่อยู่</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p>{post.location}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">ระยะทาง: {post.distance} กิโลเมตร</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">คุณค่า NPK</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">N: {post.npk.n}%</Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">P: {post.npk.p}%</Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">K: {post.npk.k}%</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">อาหารที่ให้สัตว์</p>
                <p>{post.feedType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">วันที่ลงประกาศ</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p>{new Date(post.createdDate).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 mb-2">รายละเอียด</p>
            <p className="text-gray-700 leading-relaxed">{post.description}</p>
          </div>

          {/* Contact Info */}
          {!isMyPost && (
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">ติดต่อผู้ขาย</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  พูดคุย
                </Button>
                <Button variant="outline" className="flex-1">โทร {post.contactPhone}</Button>
                <Button className="flex-1 bg-green-700 hover:bg-green-800">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  จองเลย
                </Button>
              </div>
            </div>
          )}

          {isMyPost && (
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">ติดต่อ</p>
              <div className="space-y-2">
                <p className="text-sm">เบอร์โทรศัพท์</p>
                <p className="font-medium">{post.contactPhone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}