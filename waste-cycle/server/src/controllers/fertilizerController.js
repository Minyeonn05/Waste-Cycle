// server/src/controllers/fertilizerController.js
import { 
  calculateFertilizerFormula, 
  getSupportedMaterials, 
  getSupportedCrops 
} from '../utils/fertilizerCalculator.js';

// คำนวณสูตรปุ๋ย NPK
export const getFertilizerAdvice = async (req, res) => {
  try {
    const { cropType, area, materials } = req.body;
    
    // Validation
    if (!cropType || !area) {
      return res.status(400).json({
        success: false,
        error: 'Crop type and area are required'
      });
    }
    
    if (area <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Area must be greater than 0'
      });
    }
    
    try {
      // คำนวณสูตรปุ๋ย
      const result = calculateFertilizerFormula(
        cropType, 
        parseFloat(area), 
        materials
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (calcError) {
      return res.status(400).json({
        success: false,
        error: calcError.message
      });
    }
  } catch (error) {
    console.error('Fertilizer advice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fertilizer formula'
    });
  }
};

// ดึงรายการวัสดุที่รองรับ
export const getSupportedMaterialsList = async (req, res) => {
  try {
    const materials = getSupportedMaterials();
    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch materials'
    });
  }
};

// ดึงรายการพืชที่รองรับ
export const getSupportedCropsList = async (req, res) => {
  try {
    const crops = getSupportedCrops();
    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crops'
    });
  }
};