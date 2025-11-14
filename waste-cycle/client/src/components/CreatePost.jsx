import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
// Removed: import type { User, Post } from '../App';
// Removed: interface CreatePostProps { ... }

export function CreatePost({ user, onBack, onCreate, onUpdate, editingPost }) { // Removed type annotation for props
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

  const [uploadedImages, setUploadedImages] = useState([]); // Removed type annotation

  // Load editing post data
  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        animalType: editingPost.animalType,
        wasteType: editingPost.wasteType,
        quantity: editingPost.quantity.toString(),
        price: editingPost.price.toString(),
        description: editingPost.description,
        feedType: editingPost.feedType,
        location: editingPost.location,
        unit: editingPost.unit,
        contactPhone: editingPost.contactPhone,
      });
      setUploadedImages(editingPost.images);
    }
  }, [editingPost]);

  const handleImageUpload = (e) => { // Removed type annotation
    const files = e.target.files;
    if (files) {
      const newImages = []; // Removed type annotation
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result); // Removed type assertion
          if (newImages.length === files.length) {
            setUploadedImages([...uploadedImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => { // Removed type annotation
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const calculateNPK = () => {
    // Simple NPK calculation based on animal type and feed type
    const baseNPK = { // Removed type annotation
      chicken: { n: 3.2, p: 2.8, k: 1.5 },
      duck: { n: 2.9, p: 2.5, k: 1.6 },
      cow: { n: 2.5, p: 1.8, k: 2.1 },
      pig: { n: 3.8, p: 3.2, k: 2.4 },
      sheep: { n: 3.0, p: 2.2, k: 1.8 },
      goat: { n: 2.8, p: 2.0, k: 1.7 },
    };

    return baseNPK[formData.animalType] || { n: 3.0, p: 2.5, k: 2.0 };
  };

  const handleSubmit = (e) => { // Removed type annotation
    e.preventDefault();

    const postData = {
      title: formData.title,
      animalType: formData.animalType,
      wasteType: formData.wasteType,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      unit: formData.unit,
      location: formData.location,
      distance: Math.random() * 20, // Mock distance
      verified: true,
      npk: calculateNPK(),
      feedType: formData.feedType,
      description: formData.description,
      images: uploadedImages,
      contactPhone: formData.contactPhone || '081-234-5678',
    };

    if (editingPost) {
      onUpdate(editingPost.id, postData);
    } else {
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
                      <SelectItem value="ไก่">ไก่</SelectItem>
                      <SelectItem value="ไก่ไข่">ไก่ไข่</SelectItem>
                      <SelectItem value="เป็ด">เป็ด</SelectItem>
                      <SelectItem value="โค">โค</SelectItem>
                      <SelectItem value="โคนม">โคนม</SelectItem>
                      <SelectItem value="กระบือ">กระบือ</SelectItem>
                      <SelectItem value="สุกร">สุกร</SelectItem>
                      <SelectItem value="แพะ">แพะ</SelectItem>
                      <SelectItem value="แกะ">แกะ</SelectItem>
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
                  <Label htmlFor="unit" className="text-base">หน่วยปริมาณ</Label>
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