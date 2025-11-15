import { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, MapPin, Upload } from 'lucide-react';
import { type User, type Post } from '../App';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface CreatePostProps {
  user: User;
  onBack: () => void;
  onCreate: (postData: any) => Promise<void>;
  onUpdate: (postId: string, postData: any) => Promise<void>;
  editingPost?: Post;
}

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 18.7883, // Chiang Mai default
  lng: 98.9853
};

const libraries = ["places"];

export function CreatePost({ user, onBack, onCreate, onUpdate, editingPost }: CreatePostProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // ใส่ Key ของคุณอีกครั้ง (หรือ import จาก .env)
    libraries: libraries as any,
  });

  const [title, setTitle] = useState(editingPost?.title || '');
  const [description, setDescription] = useState(editingPost?.description || '');
  const [wasteType, setWasteType] = useState(editingPost?.wasteType || '');
  const [animalType, setAnimalType] = useState(editingPost?.animalType || '');
  const [feedType, setFeedType] = useState(editingPost?.feedType || '');
  const [quantity, setQuantity] = useState(editingPost?.quantity || 0);
  const [price, setPrice] = useState(editingPost?.price || 0);
  const [unit, setUnit] = useState(editingPost?.unit || 'kg');
  
  // เปลี่ยน location string เป็น address string
  const [address, setAddress] = useState(editingPost?.address || '');
  // State ใหม่สำหรับเก็บพิกัด
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    editingPost?.location || null
  );

  const [images, setImages] = useState<string[]>(editingPost?.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const mapCenter = useMemo(() => markerPosition || defaultCenter, [markerPosition]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerPosition) {
      setError('กรุณาปักหมุดตำแหน่งบนแผนที่');
      return;
    }
    if (!title || !wasteType || quantity <= 0 || price <= 0) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ (หัวข้อ, ประเภท, ปริมาณ, ราคา)');
      return;
    }
    setError('');
    setIsLoading(true);

    const postData = {
      title,
      description,
      wasteType,
      animalType,
      feedType,
      quantity,
      price,
      unit,
      location: markerPosition, // ส่งเป็น object
      address: address, // ส่งเป็น string
      images,
      // npk, etc. (ยังไม่ได้เพิ่มในฟอร์มนี้)
      npk: editingPost?.npk || { n: 0, p: 0, k: 0 }, 
    };

    try {
      if (editingPost) {
        await onUpdate(editingPost.id, postData);
      } else {
        await onCreate(postData);
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบันทึกโพสต์');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMap = () => {
    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onClick={handleMapClick}
      >
        {markerPosition && <MarkerF position={markerPosition} />}
      </GoogleMap>
    );
  };
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้ามาร์เก็ตเพลส
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{editingPost ? 'แก้ไขโพสต์' : 'สร้างโพสต์ใหม่'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อโพสต์</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wasteType">ประเภทของเสีย</Label>
                <Select value={wasteType} onValueChange={setWasteType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="มูลวัว">มูลวัว</SelectItem>
                    <SelectItem value="มูลไก่">มูลไก่</SelectItem>
                    <SelectItem value="มูลหมู">มูลหมู</SelectItem>
                    <SelectItem value="เศษผัก">เศษผัก</SelectItem>
                    <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="animalType">ประเภทสัตว์ (ถ้ามี)</Label>
                <Input id="animalType" value={animalType} onChange={(e) => setAnimalType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedType">ประเภทอาหาร (ถ้ามี)</Label>
                <Input id="feedType" value={feedType} onChange={(e) => setFeedType(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">ปริมาณ</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">ราคา</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">หน่วย</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วย" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">กก.</SelectItem>
                    <SelectItem value="ton">ตัน</SelectItem>
                    <SelectItem value="truck">คันรถ</SelectItem>
                    <SelectItem value="bag">กระสอบ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">ที่อยู่ (สำหรับแสดงผล)</Label>
              <Input id="address" placeholder="เช่น ต.สุเทพ อ.เมือง จ.เชียงใหม่" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>ปักหมุดตำแหน่งที่ตั้ง</Label>
              <p className="text-sm text-gray-500">คลิกบนแผนที่เพื่อปักหมุดตำแหน่งของเสีย</p>
              {renderMap()}
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังบันทึก...' : (editingPost ? 'อัปเดตโพสต์' : 'สร้างโพสต์')}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}