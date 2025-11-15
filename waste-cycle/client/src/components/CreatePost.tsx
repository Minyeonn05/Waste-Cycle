import { useState, useMemo } from 'react';
// แก้ไข Paths โดยใช้ @/components/...
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, MapPin, Upload } from 'lucide-react';
import { type User, type Post } from '../App'; // แก้ไข Path
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface CreatePostProps {
  user: User;
  onBack: () => void;
  onCreate: (newPost: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => void;
  onUpdate: (postId: string, updatedData: Partial<Post>) => void;
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

const libraries: ("places")[] = ["places"];

export function CreatePost({ user, onBack, onCreate, onUpdate, editingPost }: CreatePostProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [title, setTitle] = useState(editingPost?.title || '');
  const [description, setDescription] = useState(editingPost?.description || '');
  const [wasteType, setWasteType] = useState(editingPost?.wasteType || '');
  const [animalType, setAnimalType] = useState(editingPost?.animalType || '');
  const [feedType, setFeedType] = useState(editingPost?.feedType || '');
  const [quantity, setQuantity] = useState(editingPost?.quantity || 0);
  const [price, setPrice] = useState(editingPost?.price || 0);
  const [unit, setUnit] = useState(editingPost?.unit || 'kg');
  
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    editingPost?.location || null
  );
  const [address, setAddress] = useState(editingPost?.address || '');

  const mapCenter = useMemo(() => markerPosition || defaultCenter, [markerPosition]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });

      // Geocoding: Get address from lat/lng
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress(`พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerPosition) {
      alert("กรุณาปักหมุดบนแผนที่");
      return;
    }

    const postData = {
      title,
      description,
      wasteType,
      animalType: wasteType === 'animal' ? animalType : '',
      feedType: wasteType === 'animal' ? feedType : '',
      quantity,
      price,
      unit,
      location: markerPosition,
      address,
      // Default values for fields not in form (yet)
      distance: 0, 
      verified: false,
      npk: { n: 0, p: 0, k: 0 }, // Should be calculated
      images: [],
      farmName: user.farmName || user.name,
      contactPhone: '', // Should be from user profile
      sold: false
    };

    if (editingPost) {
      onUpdate(editingPost.id, postData);
    } else {
      onCreate(postData as Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>);
    }
  };

  const renderMap = () => {
    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12} // <-- แก้ไข: ซูมเข้า
        onClick={handleMapClick}
      >
        {markerPosition && <MarkerF position={markerPosition} />}
      </GoogleMap>
    );
  };
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับไปหน้า Marketplace
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{editingPost ? 'แก้ไขโพสต์' : 'สร้างโพสต์ใหม่'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น มูลวัวแห้ง 100 กก." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเกี่ยวกับของเสีย..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wasteType">ประเภทของเสีย</Label>
                <Select value={wasteType} onValueChange={setWasteType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animal">มูลสัตว์</SelectItem>
                    <SelectItem value="plant">เศษพืช</SelectItem>
                    <SelectItem value="food">เศษอาหาร</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {wasteType === 'animal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="animalType">ประเภทสัตว์</Label>
                    <Select value={animalType} onValueChange={setAnimalType}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทสัตว์" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cow">วัว</SelectItem>
                        <SelectItem value="chicken">ไก่</SelectItem>
                        <SelectItem value="pig">หมู</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="feedType">ประเภทอาหารสัตว์</Label>
                    <Input id="feedType" value={feedType} onChange={(e) => setFeedType(e.target.value)} placeholder="เช่น อาหารเม็ด, หญ้าสด" />
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">จำนวน</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">ราคา (บาท)</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">หน่วย</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วย" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">กิโลกรัม</SelectItem>
                    <SelectItem value="ton">ตัน</SelectItem>
                    <SelectItem value="bag">กระสอบ</SelectItem>
                    <SelectItem value="lot">กอง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ปักหมุดตำแหน่ง</Label>
              <div className="border rounded-md overflow-hidden">
                {renderMap()}
              </div>
              <Input 
                id="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="ที่อยู่ (จะถูกเติมอัตโนมัติเมื่อปักหมุด)" 
                disabled 
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="images">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</Label>
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากและวาง</p>
                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 800x400px)</p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg" />
                </Label>
              </div> 
            </div>

            <Button type="submit" className="w-full">
              {editingPost ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างโพสต์'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}