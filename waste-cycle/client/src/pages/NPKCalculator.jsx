import { useState } from 'react';
import { Beaker, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';






const npkDatabase = {
  chicken: [
    { animalType: 'ไก่', wasteType: 'fresh', feedType: 'concentrate', npk: { n: 3.2, p: 2.8, k: 1.5 }, organicMatter: 65, moisture: 55 },
    { animalType: 'ไก่', wasteType: 'dried', feedType: 'concentrate', npk: { n: 4.5, p: 3.5, k: 2.2 }, organicMatter: 75, moisture: 15 },
    { animalType: 'ไก่', wasteType: 'composted', feedType: 'concentrate', npk: { n: 2.8, p: 2.5, k: 1.8 }, organicMatter: 55, moisture: 35 },
  ],
  cow: [
    { animalType: 'โค', wasteType: 'fresh', feedType: 'grass', npk: { n: 2.0, p: 1.5, k: 1.8 }, organicMatter: 60, moisture: 70 },
    { animalType: 'โค', wasteType: 'dried', feedType: 'grass', npk: { n: 3.0, p: 2.2, k: 2.5 }, organicMatter: 70, moisture: 20 },
    { animalType: 'โค', wasteType: 'composted', feedType: 'mixed', npk: { n: 2.5, p: 1.8, k: 2.1 }, organicMatter: 58, moisture: 40 },
  ],
  pig: [
    { animalType: 'สุกร', wasteType: 'fresh', feedType: 'concentrate', npk: { n: 3.5, p: 3.0, k: 2.2 }, organicMatter: 68, moisture: 60 },
    { animalType: 'สุกร', wasteType: 'dried', feedType: 'concentrate', npk: { n: 4.8, p: 4.2, k: 3.0 }, organicMatter: 78, moisture: 18 },
    { animalType: 'สุกร', wasteType: 'composted', feedType: 'concentrate', npk: { n: 3.8, p: 3.2, k: 2.4 }, organicMatter: 62, moisture: 38 },
  ],
  duck: [
    { animalType: 'เป็ด', wasteType: 'fresh', feedType: 'mixed', npk: { n: 2.8, p: 2.3, k: 1.6 }, organicMatter: 63, moisture: 58 },
    { animalType: 'เป็ด', wasteType: 'dried', feedType: 'mixed', npk: { n: 4.0, p: 3.2, k: 2.3 }, organicMatter: 72, moisture: 17 },
    { animalType: 'เป็ด', wasteType: 'composted', feedType: 'mixed', npk: { n: 2.9, p: 2.5, k: 1.8 }, organicMatter: 56, moisture: 36 },
  ],
};

export function NPKCalculator({ user }) {
  const [animalType, setAnimalType] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [feedType, setFeedType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();

    const formula = npkDatabase[animalType]?.find(
      f => f.wasteType === wasteType && f.feedType === feedType
    ) || npkDatabase[animalType]?.[0];

    if (!formula) return;

    const qty = parseFloat(quantity);
    const totalN = (formula.npk.n / 100) * qty;
    const totalP = (formula.npk.p / 100) * qty;
    const totalK = (formula.npk.k / 100) * qty;

    setResult({
      formula,
      quantity: qty,
      totalNutrients: {
        n: totalN.toFixed(2),
        p: totalP.toFixed(2),
        k: totalK.toFixed(2),
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl mb-6">วิเคราะห์คุณภาพ NPK</h1>

      <Alert className="mb-6">
        <Info className="w-4 h-4" />
        <AlertDescription>
          เครื่องมือนี้ช่วยคำนวณคุณค่าทางเคมีของมูลสัตว์ตามประเภทสัตว์ อาหารที่กิน และวิธีการจัดเก็บ
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              ข้อมูลของเสีย
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลเพื่อคำนวณค่า N-P-K
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="animalType">ประเภทสัตว์</Label>
                <Select value={animalType} onValueChange={setAnimalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทสัตว์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chicken">ไก่</SelectItem>
                    <SelectItem value="duck">เป็ด</SelectItem>
                    <SelectItem value="cow">โค</SelectItem>
                    <SelectItem value="pig">สุกร</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wasteType">ประเภทของเสีย</Label>
                <Select value={wasteType} onValueChange={setWasteType}>
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
                <Label htmlFor="feedType">ประเภทอาหารที่ให้สัตว์กิน</Label>
                <Select value={feedType} onValueChange={setFeedType}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">ปริมาณ (กิโลกรัม)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="เช่น 500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                คำนวณ NPK
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>ผลการวิเคราะห์</CardTitle>
              <CardDescription>
                {result.formula.animalType} • {
                  result.formula.wasteType === 'fresh' ? 'มูลสด' :
                  result.formula.wasteType === 'dried' ? 'มูลแห้ง' : 'มูลหมัก'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3">สัดส่วน NPK (%)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-green-600">{result.formula.npk.n}%</p>
                    <p className="text-sm text-gray-600">ไนโตรเจน</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-blue-600">{result.formula.npk.p}%</p>
                    <p className="text-sm text-gray-600">ฟอสฟอรัส</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-2xl text-purple-600">{result.formula.npk.k}%</p>
                    <p className="text-sm text-gray-600">โพแทสเซียม</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">ปริมาณธาตุอาหารรวม (กก.)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-xl text-green-600">{result.totalNutrients.n}</p>
                    <p className="text-xs text-gray-600">N รวม</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-xl text-blue-600">{result.totalNutrients.p}</p>
                    <p className="text-xs text-gray-600">P รวม</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-xl text-purple-600">{result.totalNutrients.k}</p>
                    <p className="text-xs text-gray-600">K รวม</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">อินทรียวัตถุ</p>
                  <p className="text-xl">{result.formula.organicMatter}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">ความชื้น</p>
                  <p className="text-xl">{result.formula.moisture}%</p>
                </div>
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  ค่าที่คำนวณได้เป็นค่าประมาณการ สำหรับค่าที่แม่นยำควรส่งตัวอย่างไปตรวจวิเคราะห์ในห้องแล็บ
                </AlertDescription>
              </Alert>

              <Button className="w-full" variant="outline">
                บันทึกผลลัพธ์
              </Button>
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center text-gray-400">
              <Beaker className="w-16 h-16 mx-auto mb-4" />
              <p>กรอกข้อมูลเพื่อคำนวณค่า NPK</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* NPK Reference Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ตารางอ้างอิงค่า NPK</CardTitle>
          <CardDescription>ค่ามาตรฐานสำหรับมูลสัตว์แต่ละประเภท</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">ประเภทสัตว์</th>
                  <th className="p-3 text-left">สภาพ</th>
                  <th className="p-3 text-center">N (%)</th>
                  <th className="p-3 text-center">P (%)</th>
                  <th className="p-3 text-center">K (%)</th>
                  <th className="p-3 text-center">อินทรียวัตถุ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.values(npkDatabase).flat().map((formula, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3">{formula.animalType}</td>
                    <td className="p-3">
                      {formula.wasteType === 'fresh' ? 'มูลสด' :
                       formula.wasteType === 'dried' ? 'มูลแห้ง' : 'มูลหมัก'}
                    </td>
                    <td className="p-3 text-center">{formula.npk.n}</td>
                    <td className="p-3 text-center">{formula.npk.p}</td>
                    <td className="p-3 text-center">{formula.npk.k}</td>
                    <td className="p-3 text-center">{formula.organicMatter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
