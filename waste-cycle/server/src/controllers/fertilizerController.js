// server/src/controllers/fertilizerController.js
import { 
  calculateFertilizerFormula, 
  getSupportedMaterials, 
  getSupportedCrops 
} from '../utils/fertilizerCalculator.js';
import asyncHandler from '../middleware/asyncHandler.js'; // 👈 [เพิ่ม]

// คำนวณสูตรปุ๋ย NPK
export const getFertilizerAdvice = asyncHandler(async (req, res, next) => {
  const { cropType, area, materials } = req.body;
  
  if (!cropType || !area) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุประเภทพืชและพื้นที่' });
  }
  if (area <= 0) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'พื้นที่ต้องมากกว่า 0' });
  }
  
  try {
    const result = calculateFertilizerFormula(cropType, parseFloat(area), materials);
    res.json({ success: true, data: result });
  } catch (calcError) {
    // นี่คือ Error จาก calculateFertilizerFormula (เช่น 'Unsupported crop type')
    return res.status(400).json({ success: false, error: calcError.message });
  }
});

// ดึงรายการวัสดุที่รองรับ
export const getSupportedMaterialsList = asyncHandler(async (req, res, next) => {
  const materials = getSupportedMaterials();
  res.json({
    success: true,
    count: materials.length,
    data: materials
  });
});

// ดึงรายการพืชที่รองรับ
export const getSupportedCropsList = asyncHandler(async (req, res, next) => {
  const crops = getSupportedCrops();
  res.json({
    success: true,
    count: crops.length,
    data: crops
  });
});