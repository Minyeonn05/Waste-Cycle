// client/src/component/CreatePost.jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Textarea } from './ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';

import { ImageWithFallback } from './figma/ImageWithFallback';



export function CreatePost({ user, onBack, onCreate, onUpdate, editingPost }) {
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

  const [uploadedImages, setUploadedImages] = useState([]);

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

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result );
          if (newImages.length === files.length) {
            setUploadedImages([...uploadedImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const calculateNPK = () => {
    // Simple NPK calculation based on animal type and feed type
    const baseNPK = {
      chicken: { n: 3.2, p: 2.8, k: 1.5 },
      cow: { n: 2.5, p: 1.8, k: 2.1 },
      pig: { n: 3.8, p: 3.2, k: 2.4 },
    };

    return baseNPK[formData.animalType] || { n: 3.0, p: 2.5, k: 2.0 };
  };

  const handleSubmit = (e) => {
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{editingPost ? 'แก้ไขโพสต์' : 'ลงประกาศขายของเสีย'}</CardTitle>
          <CardDescription>
            กรอกข้อมูลของเสียที่ต้องการจำหน่าย ระบบจะคำนวณคุณค่า NPK โดยอัตโนมัติ
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>รูปภาพ</Label>
              
              {/* Preview uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback 
                        src={img} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer block">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG สูงสุด 10MB (อัปโหลดได้หลายรูป)</p>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อฟาร์ม / ชื่อโพสต์</Label>
                <Input
                  id="title"
                  placeholder="เช่น เสกสรรค์ ฟาร์ม"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animalType">ประเภทสัตว์</Label>
                <Select 
                  value={formData.animalType} 
                  onValueChange={(value) => setFormData({ ...formData, animalType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทสัตว์" />
                  </SelectTrigger>
                  {/* 🚨 [อัปเดต] แก้ไข Dropdown ให้เหลือ 3 อย่าง */}
                  <SelectContent>
                    <SelectItem value="chicken">ไก่</SelectItem>
                    <SelectItem value="cow">โค</SelectItem>
                    <SelectItem value="pig">สุกร</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wasteType">ประเภทของเสีย</Label>
                <Select 
                  value={formData.wasteType} 
                  onValueChange={(value) => setFormData({ ...formData, wasteType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">มูลสด</SelectItem>
                    <SelectItem value="dried">มูลแห้ง</SelectItem>
                    <SelectItem value="composted">มูลหมัก</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">ปริมาณ (กิโลกรัม)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="เช่น 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">ราคา (บาท/กก.)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="เช่น 300"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">ที่อยู่</Label>
                <Input
                  id="location"
                  placeholder="เช่น เชียงใหม่, ไม้นอก"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">หน่วย</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
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
                <Label htmlFor="contactPhone">เบอร์โทรติดต่อ</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="feedType">ประเภทอาหารที่ให้สัตว์กิน</Label>
                <Select 
                  value={formData.feedType} 
                  onValueChange={(value) => setFormData({ ...formData, feedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทอาหาร" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concentrate">อาหารข้น (สูตรสำเร็จรูป)</SelectItem>
                    <SelectItem value="grass">หญ้า/ฟาง</SelectItem>
                    <SelectItem value="mixed">อาหารผสม</SelectItem>
                    <SelectItem value="organic">อาหารออร์แกนิก</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  ข้อมูลนี้จะใช้ในการคำนวณคุณค่า N-P-K
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <Textarea
                  id="description"
                  placeholder="บอกรายละเอียดเพิ่มเติมเกี่ยวกับของเสีย เช่น เก็บมานานแค่ไหน สภาพอย่างไร..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {formData.animalType && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg">ค่า NPK โดยประมาณ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl text-green-600">{calculateNPK().n}%</p>
                      <p className="text-sm text-gray-600">ไนโตรเจน (N)</p>
                    </div>
                    <div>
                      <p className="text-2xl text-blue-600">{calculateNPK().p}%</p>
                      <p className="text-sm text-gray-600">ฟอสฟอรัส (P)</p>
                    </div>
                    <div>
                      <p className="text-2xl text-purple-600">{calculateNPK().k}%</p>
                      <p className="text-sm text-gray-600">โพแทสเซียม (K)</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    *ค่าประมาณการจากประเภทสัตว์และอาหาร
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                ยกเลิก
              </Button>
              <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800">
                {editingPost ? 'บันทึกการแก้ไข' : 'ลงประกาศ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}