import { useState } from 'react';
import { Calculator, Sprout, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';






const cropProfiles = {
  rice: {
    name: 'ข้าว',
    stages: [
      { stage: 'กล้า', days: '0-30', npk: { n: 3.5, p: 2.0, k: 1.5 }, recommendations: 'ใช้มูลไก่หรือมูลโคหมัก' },
      { stage: 'แตกกอ', days: '31-60', npk: { n: 4.0, p: 2.5, k: 2.0 }, recommendations: 'เพิ่มไนโตรเจน ใช้มูลสุกร' },
      { stage: 'ออกรวง', days: '61-90', npk: { n: 2.5, p: 3.5, k: 3.0 }, recommendations: 'ลดไนโตรเจน เพิ่มฟอสฟอรัส' },
      { stage: 'เก็บเกี่ยว', days: '91-120', npk: { n: 1.0, p: 2.0, k: 2.5 }, recommendations: 'บำรุงดิน เตรียมฤดูหน้า' },
    ],
  },
  corn: {
    name: 'ข้าวโพด',
    stages: [
      { stage: 'งอก', days: '0-20', npk: { n: 3.0, p: 2.5, k: 1.5 }, recommendations: 'มูลโคหมักผสมดิน' },
      { stage: 'เจริญเติบโต', days: '21-50', npk: { n: 4.5, p: 2.0, k: 2.0 }, recommendations: 'มูลไก่หรือมูลสุกร' },
      { stage: 'ออกดอก', days: '51-70', npk: { n: 3.5, p: 3.0, k: 3.5 }, recommendations: 'เพิ่มโพแทสเซียม' },
      { stage: 'เติมฝัก', days: '71-90', npk: { n: 2.0, p: 2.5, k: 3.0 }, recommendations: 'บำรุงฝักข้าวโพด' },
    ],
  },
  vegetables: {
    name: 'ผักสวนครัว',
    stages: [
      { stage: 'เพาะกล้า', days: '0-15', npk: { n: 2.5, p: 2.0, k: 1.5 }, recommendations: 'มูลไก่หมักอ่อนๆ' },
      { stage: 'ปลูก', days: '16-30', npk: { n: 3.5, p: 2.5, k: 2.0 }, recommendations: 'มูลโคหรือมูลไก่' },
      { stage: 'เจริญเติบโต', days: '31-50', npk: { n: 4.0, p: 2.0, k: 2.5 }, recommendations: 'มูลสุกรหมัก' },
      { stage: 'เก็บเกี่ยว', days: '51+', npk: { n: 3.0, p: 2.5, k: 2.5 }, recommendations: 'บำรุงต่อเนื่อง' },
    ],
  },
};

export function FertilizerAdvisor({ user }) {
  const [cropType, setCropType] = useState('');
  const [cropAge, setCropAge] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();

    const profile = cropProfiles[cropType];
    if (!profile) return;

    const age = parseInt(cropAge);
    const currentStage = profile.stages.find(stage => {
      const [min, max] = stage.days.includes('+') 
        ? [parseInt(stage.days), Infinity]
        : stage.days.split('-').map(Number);
      return age >= min && age <= max;
    }) || profile.stages[0];

    const area = parseFloat(farmArea);
    const fertilizerNeeded = area * 50; // kg per rai estimate

    setResult({
      profile,
      currentStage,
      fertilizerNeeded,
      area,
    });
  };

  const handleReset = () => {
    setCropType('');
    setCropAge('');
    setFarmArea('');
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl mb-6">คำนวณปุ๋ยที่เหมาะสม</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              ข้อมูลพืช
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลพืชของคุณเพื่อรับคำแนะนำปุ๋ยที่เหมาะสม
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">ชนิดพืช</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกชนิดพืช" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">ข้าว</SelectItem>
                    <SelectItem value="corn">ข้าวโพด</SelectItem>
                    <SelectItem value="vegetables">ผักสวนครัว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropAge">อายุพืช (วัน)</Label>
                <Input
                  id="cropAge"
                  type="number"
                  placeholder="เช่น 45"
                  value={cropAge}
                  onChange={(e) => setCropAge(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmArea">พื้นที่ปลูก (ไร่)</Label>
                <Input
                  id="farmArea"
                  type="number"
                  step="0.1"
                  placeholder="เช่น 5"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  คำนวณ
                </Button>
                {result && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    รีเซ็ต
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-600" />
                คำแนะนำสำหรับ{result.profile.name}
              </CardTitle>
              <CardDescription>
                ระยะ: {result.currentStage.stage} ({result.currentStage.days} วัน)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3">สัดส่วน NPK ที่แนะนำ</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-green-600">{result.currentStage.npk.n}%</p>
                    <p className="text-sm text-gray-600">ไนโตรเจน (N)</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-blue-600">{result.currentStage.npk.p}%</p>
                    <p className="text-sm text-gray-600">ฟอสฟอรัส (P)</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-purple-600">{result.currentStage.npk.k}%</p>
                    <p className="text-sm text-gray-600">โพแทสเซียม (K)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ปริมาณปุ๋ยที่แนะนำ</p>
                <p className="text-2xl">{result.fertilizerNeeded} กก.</p>
                <p className="text-sm text-gray-500 mt-1">
                  สำหรับพื้นที่ {result.area} ไร่
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">คำแนะนำ</p>
                <p>{result.currentStage.recommendations}</p>
              </div>

              <Button className="w-full" size="lg">
                <MapPin className="w-4 h-4 mr-2" />
                ดูแหล่งซื้อใกล้ฉัน
              </Button>
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center text-gray-400">
              <Calculator className="w-16 h-16 mx-auto mb-4" />
              <p>กรอกข้อมูลเพื่อรับคำแนะนำ</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Growth Stages Reference */}
      {cropType && cropProfiles[cropType] && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>ระยะการเจริญเติบโตของ{cropProfiles[cropType].name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cropProfiles[cropType].stages.map((stage, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p>{stage.stage}</p>
                      <p className="text-xs text-gray-500">{stage.days} วัน</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">N: {stage.npk.n}%</Badge>
                      <Badge variant="outline" className="text-xs">P: {stage.npk.p}%</Badge>
                      <Badge variant="outline" className="text-xs">K: {stage.npk.k}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
