import { Recycle, TrendingUp, Leaf, Beef } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Progress } from './ui/progress.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const wasteFlowData = [
  { name: 'มูลสัตว์ → ฟาร์มพืช', value: 65, color: '#10b981' },
  { name: 'เศษพืช → ฟาร์มสัตว์', value: 35, color: '#f59e0b' },
];

const monthlyImpact = [
  { metric: 'ของเสียที่หมุนเวียน', value: '12.4 ตัน', progress: 78 },
  { metric: 'CO₂ ที่ลดได้', value: '8.2 ตัน', progress: 65 },
  { metric: 'ต้นทุนปุ๋ยเคมีที่ประหยัด', value: '฿1.2M', progress: 82 },
  { metric: 'รายได้จากของเสีย', value: '฿890K', progress: 71 },
];

const participantStats = [
  { type: 'ฟาร์มพืช', count: 142, icon: Leaf, color: 'text-green-600' },
  { type: 'ฟาร์มสัตว์', count: 106, icon: Beef, color: 'text-orange-600' },
];

export function CircularView() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Recycle className="w-12 h-12 text-green-600 animate-spin" style={{ animationDuration: '3s' }} />
          <h1 className="text-3xl">วงจรเกษตรหมุนเวียน</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          แสดงภาพรวมการแลกเปลี่ยนของเสียระหว่างฟาร์มสัตว์และฟาร์มพืช
          เพื่อสร้างเศรษฐกิจหมุนเวียนที่ยั่งยืน
        </p>
      </div>

      {/* Circular Flow Visualization */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle>แผนผังวงจรหมุนเวียน</CardTitle>
          <CardDescription>การไหลของทรัพยากรในระบบ Waste-Cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
            {/* Livestock Farm */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Beef className="w-16 h-16 text-orange-600" />
              </div>
              <h3 className="mb-2">ฟาร์มสัตว์</h3>
              <p className="text-sm text-gray-600 text-center">ผลิตมูลสัตว์</p>
              <p className="text-2xl text-orange-600 mt-2">106 ฟาร์ม</p>
            </div>

            {/* Arrows and Flow */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-24 bg-green-600"></div>
                <div className="flex flex-col items-center bg-green-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">มูลสัตว์</p>
                  <p className="text-lg text-green-600">8.1 ตัน/เดือน</p>
                </div>
                <div className="h-1 w-24 bg-green-600 relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-green-600"></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-1 w-24 bg-orange-600 relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-orange-600"></div>
                </div>
                <div className="flex flex-col items-center bg-orange-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">เศษพืช/อาหาร</p>
                  <p className="text-lg text-orange-600">4.3 ตัน/เดือน</p>
                </div>
                <div className="h-1 w-24 bg-orange-600"></div>
              </div>
            </div>

            {/* Crop Farm */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="mb-2">ฟาร์มพืช</h3>
              <p className="text-sm text-gray-600 text-center">ผลิตเศษพืช</p>
              <p className="text-2xl text-green-600 mt-2">142 ฟาร์ม</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Waste Flow Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนการแลกเปลี่ยน</CardTitle>
            <CardDescription>ปริมาณของเสียแต่ละประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteFlowData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteFlowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle>ผู้เข้าร่วมในระบบ</CardTitle>
            <CardDescription>จำนวนฟาร์มที่ใช้งาน Waste-Cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col justify-center h-[300px]">
            {participantStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-gray-600">{stat.type}</p>
                      <p className="text-3xl">{stat.count}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>ผลกระทบเชิงบวกต่อสิ่งแวดล้อม</CardTitle>
          <CardDescription>สถิติรวมของเดือนนี้</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monthlyImpact.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{item.metric}</p>
                  <p className="text-xl">{item.value}</p>
                </div>
                <Progress value={item.progress} className="h-2" />
                <p className="text-xs text-gray-500 text-right">{item.progress}% ของเป้าหมาย</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">ลดของเสีย</h3>
            <p className="text-sm text-gray-600">ลดการทิ้งของเสียทางการเกษตร ลดมลพิษสู่สิ่งแวดล้อม</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">เพิ่มรายได้</h3>
            <p className="text-sm text-gray-600">สร้างรายได้จากของเสีย ลดต้นทุนการซื้อปุ๋ยเคมี</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">เกษตรยั่งยืน</h3>
            <p className="text-sm text-gray-600">ส่งเสริมเกษตรอินทรีย์ สร้างเศรษฐกิจหมุนเวียน</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
