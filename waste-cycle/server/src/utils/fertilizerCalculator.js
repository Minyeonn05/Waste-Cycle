// server/src/utils/fertilizerCalculator.js

/**
 * ข้อมูล NPK content ของวัสดุต่างๆ (%)
 * N = Nitrogen, P = Phosphorus, K = Potassium
 */
const MATERIAL_NPK = {
  'chicken_manure': { N: 3.5, P: 2.5, K: 1.5, name: 'มูลไก่' },
  'cow_manure': { N: 2.0, P: 1.0, K: 2.0, name: 'มูลวัว' },
  'pig_manure': { N: 3.0, P: 2.0, K: 1.5, name: 'มูลหมู' },

};

/**
 * ความต้องการ NPK ของพืชแต่ละชนิด (kg/rai)
 */
const CROP_REQUIREMENTS = {
  'rice': { N: 8, P: 4, K: 6, name: 'ข้าว' },
  'corn': { N: 12, P: 6, K: 8, name: 'ข้าวโพด' },
  'vegetable': { N: 10, P: 5, K: 10, name: 'ผักทั่วไป' },
  'fruit': { N: 15, P: 8, K: 12, name: 'ผลไม้' },
  'sugarcane': { N: 10, P: 4, K: 8, name: 'อ้อย' }
};

/**
 * คำนวณสูตรปุ๋ยที่เหมาะสม
 * @param {string} cropType - ชนิดพืช
 * @param {number} area - พื้นที่ (ไร่)
 * @param {Array} availableMaterials - วัสดุที่มี [{type, quantity}]
 * @returns {Object} - สูตรปุ๋ยที่แนะนำ
 */
export const calculateFertilizerFormula = (cropType, area, availableMaterials = []) => {
  // ตรวจสอบ input
  if (!CROP_REQUIREMENTS[cropType]) {
    throw new Error(`Unsupported crop type: ${cropType}`);
  }
  
  const requirement = CROP_REQUIREMENTS[cropType];
  
  // คำนวณความต้องการรวม (kg)
  const totalNeeded = {
    N: requirement.N * area,
    P: requirement.P * area,
    K: requirement.K * area
  };
  
  // สร้างสูตรแนะนำ
  const formula = [];
  let actualNPK = { N: 0, P: 0, K: 0 };
  
  // ถ้ามีวัสดุที่ระบุ คำนวณจากวัสดุนั้น
  if (availableMaterials.length > 0) {
    for (const material of availableMaterials) {
      const matData = MATERIAL_NPK[material.type];
      if (!matData) continue;
      
      const qty = material.quantity || 0;
      actualNPK.N += (qty * matData.N) / 100;
      actualNPK.P += (qty * matData.P) / 100;
      actualNPK.K += (qty * matData.K) / 100;
      
      formula.push({
        material: material.type,
        name: matData.name,
        quantity: qty,
        unit: 'kg',
        npk: matData
      });
    }
  } else {
    // ถ้าไม่มีวัสดุ แนะนำสูตรทั่วไป
    // ใช้มูลไก่เป็นหลัก (NPK สูง)
    const chickenManure = MATERIAL_NPK.chicken_manure;
    const neededQty = Math.ceil(totalNeeded.N / (chickenManure.N / 100));
    
    actualNPK.N = (neededQty * chickenManure.N) / 100;
    actualNPK.P = (neededQty * chickenManure.P) / 100;
    actualNPK.K = (neededQty * chickenManure.K) / 100;
    
    formula.push({
      material: 'chicken_manure',
      name: chickenManure.name,
      quantity: neededQty,
      unit: 'kg',
      npk: chickenManure
    });
  }
  
  // คำนวณ % ความเพียงพอ
  const adequacy = {
    N: (actualNPK.N / totalNeeded.N * 100).toFixed(1),
    P: (actualNPK.P / totalNeeded.P * 100).toFixed(1),
    K: (actualNPK.K / totalNeeded.K * 100).toFixed(1)
  };
  
  // คำแนะนำเพิ่มเติม
  const recommendations = [];
  
  if (parseFloat(adequacy.N) < 80) {
    recommendations.push('ควรเพิ่มปุ๋ยไนโตรเจน เช่น มูลไก่ หรือปุ๋ยยูเรีย');
  }
  if (parseFloat(adequacy.P) < 80) {
    recommendations.push('ควรเพิ่มปุ๋ยฟอสฟอรัส เช่น มูลหมู หรือปุ๋ยโฟสเฟต');
  }
  if (parseFloat(adequacy.K) < 80) {
    recommendations.push('ควรเพิ่มปุ๋ยโพแทสเซียม เช่น มูลวัว หรือเถ้าแกลบ');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('สูตรปุ๋ยมีความเหมาะสมแล้ว');
  }
  
  return {
    cropType: cropType,
    cropName: requirement.name,
    area: area,
    areaUnit: 'rai',
    required: totalNeeded,
    actual: actualNPK,
    adequacy: adequacy,
    formula: formula,
    recommendations: recommendations
  };
};

/**
 * ดึงรายการวัสดุที่รองรับ
 */
export const getSupportedMaterials = () => {
  return Object.entries(MATERIAL_NPK).map(([key, value]) => ({
    type: key,
    name: value.name,
    npk: { N: value.N, P: value.P, K: value.K }
  }));
};

/**
 * ดึงรายการพืชที่รองรับ
 */
export const getSupportedCrops = () => {
  return Object.entries(CROP_REQUIREMENTS).map(([key, value]) => ({
    type: key,
    name: value.name,
    requirement: { N: value.N, P: value.P, K: value.K }
  }));
};