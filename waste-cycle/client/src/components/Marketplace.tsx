import { useState } from 'react';
import { Filter, Plus, MapPin, Eye, Edit, Trash2, MessageCircle, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import type { User, Post } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketplaceProps {
  user: User;
  posts: Post[];
  onViewDetail: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onChat: (postId: string) => void;
  chattingPostIds: Set<string>;
}

export function Marketplace({ user, posts, onViewDetail, onEdit, onDelete, onChat, chattingPostIds }: MarketplaceProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all');
  const [maxDistance, setMaxDistance] = useState([50]);
  const [sortBy, setSortBy] = useState('distance');
  const [showFilters, setShowFilters] = useState(true);

  const myPosts = posts.filter(post => post.userId === user.id);
  const otherPosts = posts.filter(post => post.userId !== user.id);
  
  const allPosts = [...myPosts, ...otherPosts];
  const marketplacePosts = otherPosts;

  // Apply filters
  const filterPosts = (postsToFilter: Post[]) => {
    let filtered = postsToFilter;

    // Filter by waste type
    if (wasteTypeFilter !== 'all') {
      filtered = filtered.filter(post => post.wasteType === wasteTypeFilter);
    }

    // Filter by distance
    filtered = filtered.filter(post => post.distance <= maxDistance[0]);

    // Sort
    if (sortBy === 'distance') {
      filtered = [...filtered].sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    }

    return filtered;
  };

  const displayAllPosts = activeTab === 'all' ? filterPosts(allPosts) : allPosts;
  const displayMarketplacePosts = activeTab === 'marketplace' ? filterPosts(marketplacePosts) : marketplacePosts;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">ตลาดกลางและลูกค้าซื้อของเสีย</h1>
          <p className="text-gray-600">ค้นหาและจัดเรียงของเสียทางการเกษตรที่ต้องการ</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="waste-type" className="mb-2 block">ประเภทของเสีย</Label>
                <Select value={wasteTypeFilter} onValueChange={setWasteTypeFilter}>
                  <SelectTrigger id="waste-type">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="มูลแห้ง">มูลแห้ง</SelectItem>
                    <SelectItem value="มูลหมัก">มูลหมัก</SelectItem>
                    <SelectItem value="มูลสด">มูลสด</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">ระยะทางสูงสุด: {maxDistance[0]} กม.</Label>
                <Slider
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  max={100}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sort-by" className="mb-2 block">เรียงตาม</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">ระยะทางใกล้สุด</SelectItem>
                    <SelectItem value="price">ราคาต่ำสุด</SelectItem>
                    <SelectItem value="newest">ล่าสุด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                พบ <span className="font-medium">{activeTab === 'all' ? displayAllPosts.length : displayMarketplacePosts.length}</span> รายการ
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                ตัวกรองเพิ่มเติม
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              รวมโพสต์ ({allPosts.length})
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              ตลาดกลาง ({marketplacePosts.length})
            </TabsTrigger>
          </TabsList>

          {/* All Posts Tab */}
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAllPosts.map(post => (
                <ModernPostCard 
                  key={post.id} 
                  post={post} 
                  isMyPost={post.userId === user.id}
                  onViewDetail={onViewDetail}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChat={onChat}
                  showAllActions={true}
                  isChatting={chattingPostIds.has(post.id)}
                />
              ))}
            </div>

            {displayAllPosts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหา</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMarketplacePosts.map(post => (
                <ModernPostCard 
                  key={post.id} 
                  post={post} 
                  isMyPost={false}
                  onViewDetail={onViewDetail}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChat={onChat}
                  showAllActions={false}
                  isChatting={chattingPostIds.has(post.id)}
                />
              ))}
            </div>

            {displayMarketplacePosts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหา</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  isMyPost: boolean;
  onViewDetail: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onChat: (postId: string) => void;
  showAllActions: boolean;
  isChatting: boolean;
}

function ModernPostCard({ post, isMyPost, onViewDetail, onEdit, onDelete, onChat, showAllActions, isChatting }: PostCardProps) {
  const handleDelete = () => {
    if (confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) {
      onDelete(post.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
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
        {post.verified && !isChatting && !post.sold && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            ✓ พร้อมขาย
          </Badge>
        )}
        
        {/* Chatting Badge */}
        {isChatting && !post.sold && (
          <Badge className="absolute top-3 right-3 bg-yellow-400 text-gray-900 shadow-lg">
            กำลังพูดคุย
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
          {isMyPost && showAllActions ? (
            <>
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
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
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
                onClick={() => onChat(post.id)}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}