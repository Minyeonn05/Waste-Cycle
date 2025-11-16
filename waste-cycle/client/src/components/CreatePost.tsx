import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { User, Post } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePostProps {
  user: User;
  onBack: () => void;
  onCreate: (post: Omit<Post, 'id' | 'userId' | 'createdDate' | 'rating' | 'reviewCount'>) => void;
  onUpdate: (postId: string, updatedData: Partial<Post>) => void;
  editingPost?: Post;
}

// Helper to mock geocoding (for demonstration, converting string address to an object with coordinates)
const mockGeocode = (address: string) => {
  let lat = 18.7883; // Default to Chiang Mai
  let lng = 98.9853; 
  
  if (address.toLowerCase().includes('กรุงเทพ')) {
    lat = 13.7563;
    lng = 100.5018;
  } else if (address.toLowerCase().includes('ขอนแก่น')) {
    lat = 16.4323;
    lng = 102.8361;
  }
  
  // Returns the object structure expected by the Post type
  return { lat, lng, address: address || 'ไม่ระบุ' };
};

export function CreatePost({ user, onBack, onCreate, onUpdate, editingPost }: CreatePostProps) {
  const [formData, setFormData] = useState({
    title: '',
    animalType: '',
    wasteType: '',
    quantity: '',
    price: '',
    description: '',
    feedType: '',
    location: '',
    unit: 'กก. / สัปดาห์',
    contactPhone: '',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Load editing post data
  useEffect(() => {
    if (editingPost) {
      // FIX: ใช้ 'unknown' เพื่อแก้ไข TypeScript error จากการที่ location อาจไม่ overlap กับ { address: string }
      // เราทราบว่า Post.location ควรจะมี address, lat, lng
      const locationAddress = 
        typeof editingPost.location === 'string' 
        ? editingPost.location 
        : (editingPost.location as unknown as { address: string }).address || '';

      setFormData({
        title: editingPost.title,
        animalType: editingPost.animalType,
        wasteType: editingPost.wasteType,
        quantity: editingPost.quantity.toString(),
        price: editingPost.price.toString(),
        description: editingPost.description,
        feedType: editingPost.feedType,
        location: locationAddress, // ใช้ string address สำหรับ input field
        unit: editingPost.unit,
        contactPhone: editingPost.contactPhone,
      });
      setUploadedImages(editingPost.images);
    }
  }, [editingPost]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setUploadedImages([...uploadedImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const calculateNPK = () => {
    // Simple NPK calculation based on ANIMAL TYPE and FEED TYPE
    // Values are placeholders for demonstration, real NPK calculation is complex.
    const baseNPK: Record<string, { n: number; p: number; k: number }> = {
      ไก่: { n: 3.2, p: 2.8, k: 1.5 },
      โค: { n: 2.5, p: 1.8, k: 2.1 },
      สุกร: { n: 3.8, p: 3.2, k: 2.4 },
    };

    let npk = baseNPK[formData.animalType] || { n: 3.0, p: 2.5, k: 2.0 };
    
    // Adjust based on Feed Type (simple mock adjustment)
    if (formData.feedType === 'อาหารออร์แกนิก') {
        npk.n += 0.5; // Slightly higher NPK for premium feed
        npk.p += 0.3;
    } else if (formData.feedType === 'หญ้า/ฟาง') {
        npk.n -= 0.5; // Slightly lower NPK for simpler feed
        npk.k += 0.2; 
    }

    return { 
        n: parseFloat(npk.n.toFixed(1)), 
        p: parseFloat(npk.p.toFixed(1)), 
        k: parseFloat(npk.k.toFixed(1)) 
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure numeric values are valid
    const quantity = parseFloat(formData.quantity);
    const price = parseFloat(formData.price);

    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price < 0 || !formData.animalType) {
        alert('กรุณากรอกข้อมูลปริมาณ, ราคา และประเภทสัตว์ให้ถูกต้อง');
        return;
    }

    // Prepare location object using mock geocoding
    const locationObject = mockGeocode(formData.location);

    const postData = {
      title: formData.title,
      animalType: formData.animalType,
      wasteType: formData.wasteType,
      quantity: quantity,
      price: price,
      unit: formData.unit,
      // NOTE: ส่ง location ในรูปแบบ Object { lat, lng, address } 
      location: locationObject, 
      distance: Math.random() * 20, // Mock distance
      verified: true,
      npk: calculateNPK(),
      feedType: formData.feedType,
      description: formData.description,
      images: uploadedImages,
      contactPhone: formData.contactPhone || '081-234-5678',
    };

    if (editingPost) {
      // onUpdate จะส่งข้อมูลไปที่ Server/Firebase
      onUpdate(editingPost.id, postData);
    } else {
      // onCreate จะส่งข้อมูลไปที่ Server/Firebase
      onCreate(postData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
        </Button>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="text-2xl">
              {editingPost ? 'แก้ไขโพสต์' : 'สร้างโพสต์ขายของเสีย'}
            </CardTitle>
            <CardDescription className="text-green-50">
              กรอกข้อมูลของเสียที่ต้องการจำหน่าย ระบบจะคำนวณคุณค่า NPK โดยอัตโนมัติ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-base">รูปภาพ</Label>
                
                {/* Preview uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <ImageWithFallback 
                          src={img} 
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-all transform hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <label className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-100 transition-all cursor-pointer block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">คลิกเพื่ออัปโหลดรูปภาพ</p>
                    <p className="text-xs text-gray-500">PNG, JPG สูงสุด 10MB (อัปโหลดได้หลายรูป)</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">ชื่อฟาร์ม / ชื่อโพสต์</Label>
                  <Input
                    id="title"
                    placeholder="เช่น เสกสรรค์ ฟาร์ม"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalType" className="text-base">ประเภทสัตว์</Label>
                  <Select 
                    value={formData.animalType} 
                    onValueChange={(value) => setFormData({ ...formData, animalType: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="เลือกประเภทสัตว์" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* --- แก้ไข: เหลือเพียง ไก่, โค, สุกร --- */}
                      <SelectItem value="ไก่">ไก่ (Chicken)</SelectItem>
                      <SelectItem value="โค">โค (Cow)</SelectItem>
                      <SelectItem value="สุกร">สุกร (Pig)</SelectItem>
                      {/* ------------------------------------- */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wasteType" className="text-base">ประเภทของเสีย</Label>
                  <Select 
                    value={formData.wasteType} 
                    onValueChange={(value) => setFormData({ ...formData, wasteType: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="มูลสด">มูลสด</SelectItem>
                      <SelectItem value="มูลแห้ง">มูลแห้ง</SelectItem>
                      <SelectItem value="มูลหมัก">มูลหมัก</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-base">ปริมาณ (กิโลกรัม)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="เช่น 500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">ราคา (บาท/กก.)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="เช่น 300"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">ที่อยู่</Label>
                  <Input
                    id="location"
                    placeholder="เช่น เชียงใหม่, ไม้นอก"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-base">หน่วย</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="กก. / วัน">กก. / วัน</SelectItem>
                      <SelectItem value="กก. / สัปดาห์">กก. / สัปดาห์</SelectItem>
                      <SelectItem value="ตัน / สัปดาห์">ตัน / สัปดาห์</SelectItem>
                      <SelectItem value="ตัน / เดือน">ตัน / เดือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-base">เบอร์โทรติดต่อ</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="เช่น 081-234-5678"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="feedType" className="text-base">ประเภทอาหารที่ให้สัตว์กิน</Label>
                  <Select 
                    value={formData.feedType} 
                    onValueChange={(value) => setFormData({ ...formData, feedType: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="เลือกประเภทอาหาร" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="อาหารข้น (สูตรสำเร็จรูป)">อาหารข้น (สูตรสำเร็จรูป)</SelectItem>
                      <SelectItem value="หญ้า/ฟาง">หญ้า/ฟาง</SelectItem>
                      <SelectItem value="อาหารผสม">อาหารผสม</SelectItem>
                      <SelectItem value="อาหารออร์แกนิก">อาหารออร์แกนิก</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    ข้อมูลนี้จะใช้ในการคำนวณคุณค่า N-P-K
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-base">รายละเอียดเพิ่มเติม</Label>
                  <Textarea
                    id="description"
                    placeholder="บอกรายละเอียดเพิ่มเติมเกี่ยวกับของเสีย เช่น เก็บมานานแค่ไหน สภาพอย่างไร..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {formData.animalType && formData.feedType && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800">📊 ค่า NPK โดยประมาณ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-3xl text-green-600 mb-1">{calculateNPK().n}%</p>
                        <p className="text-sm text-gray-600">ไนโตรเจน (N)</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-3xl text-blue-600 mb-1">{calculateNPK().p}%</p>
                        <p className="text-sm text-gray-600">ฟอสฟอรัส (P)</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-3xl text-orange-600 mb-1">{calculateNPK().k}%</p>
                        <p className="text-sm text-gray-600">โพแทสเซียม (K)</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      *ค่าประมาณการจากประเภทสัตว์และอาหาร
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-100" 
                  onClick={onBack}
                >
                  ยกเลิก
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                >
                  {editingPost ? '💾 บันทึกการแก้ไข' : '📤 ลงประกาศ'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}