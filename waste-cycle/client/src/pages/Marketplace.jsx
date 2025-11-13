// client/src/pages/Marketplace.jsx
import { useState } from 'react';
import { Search, MapPin, Filter, Star, Eye, Edit, Trash2, MessageCircle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../component/ui/card';
import { Button } from '../component/ui/button';
import { Input } from '../component/ui/input';
import { Label } from '../component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../component/ui/select';
import { Slider } from "../component/ui/slider";
import { Badge } from "../component/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../component/ui/tabs";


export function Marketplace({ user, posts, onViewDetail, onEdit, onDelete, onChat }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxDistance, setMaxDistance] = useState([50]);
  const [maxPrice, setMaxPrice] = useState([500]);
  const [sortBy, setSortBy] = useState('distance');
  const [activeTab, setActiveTab] = useState('all-posts');

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

  // Split posts into two groups
  const allPosts = filteredPosts;
  const marketplacePosts = filteredPosts.filter(post => post.userId !== user.id);
  const myPosts = filteredPosts.filter(post => post.userId === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">ตลาดกลางแลกเปลี่ยนของเสีย</h1>

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
                {/* 🚨 [อัปเดต] แก้ไข Dropdown ให้เหลือ 3 อย่าง + 'all' */}
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="chicken">ไก่</SelectItem>
                  <SelectItem value="cow">โค</SelectItem>
                  <SelectItem value="pig">สุกร</SelectItem>
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

            {/* All Posts Tab */}
            <TabsContent value="all-posts">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">พบ {allPosts.length} รายการ</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    isMyPost={post.userId === user.id}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChat={onChat}
                    showAllActions={true}
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

            {/* Marketplace Tab */}
            <TabsContent value="marketplace">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">พบ {marketplacePosts.length} รายการ</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketplacePosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    isMyPost={false}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChat={onChat}
                    showAllActions={false}
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
  );
}



function PostCard({ post, isMyPost, onViewDetail, onEdit, onDelete, onChat, showAllActions }) {
  const handleDelete = () => {
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      onDelete(post.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            <p className="text-green-600">฿{post.price}/กก.</p>
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
          {/* View Details & Chat/Edit/Delete */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetail(post.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              ดูรายละเอียด
            </Button>
            
            {isMyPost && showAllActions ? (
              <>
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
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onChat(post.id)}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Chat & Book for marketplace view, or just Chat for my posts */}
          {isMyPost && showAllActions ? (
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => onChat(post.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              แชท
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => onChat(post.id)}
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