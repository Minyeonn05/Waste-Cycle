// server/src/controllers/analyzeController.js
import { db } from '../config/firebaseConfig.js';

// 🚨 [แก้ไข] เพิ่ม 'pig' กลับเข้ามา
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
  pig: [ // 👈 เพิ่มส่วนนี้กลับเข้ามา
    { animalType: 'สุกร', wasteType: 'fresh', feedType: 'concentrate', npk: { n: 3.5, p: 3.0, k: 2.2 }, organicMatter: 68, moisture: 60 },
    { animalType: 'สุกร', wasteType: 'dried', feedType: 'concentrate', npk: { n: 4.8, p: 4.2, k: 3.0 }, organicMatter: 78, moisture: 18 },
    { animalType: 'สุกร', wasteType: 'composted', feedType: 'concentrate', npk: { n: 3.8, p: 3.2, k: 2.4 }, organicMatter: 62, moisture: 38 },
  ],
};

/**
 * @desc    คำนวณค่า NPK (API-18)
 * @route   POST /api/analyze/npk
 * @access  Public
 */
export const analyzeNPK = async (req, res) => {
  // ... (โค้ดส่วนที่เหลือของฟังก์ชันนี้เหมือนเดิมครับ) ...
  try {
    const { animalType, wasteType, feedType, quantity } = req.body;

    if (!animalType || !quantity) {
      return res.status(400).json({ success: false, error: 'Animal type and quantity are required' });
    }

    const formula = npkDatabase[animalType]?.find(
      f => f.wasteType === wasteType && f.feedType === feedType
    ) || npkDatabase[animalType]?.[0]; 

    if (!formula) {
      return res.status(404).json({ success: false, error: 'No NPK data found for this animal type' });
    }

    const qty = parseFloat(quantity);
    const totalN = (formula.npk.n / 100) * qty;
    const totalP = (formula.npk.p / 100) * qty;
    const totalK = (formula.npk.k / 100) * qty;

    res.json({
      success: true,
      data: {
        formula,
        quantity: qty,
        totalNutrients: {
          n: totalN.toFixed(2),
          p: totalP.toFixed(2),
          k: totalK.toFixed(2),
        },
      }
    });

  } catch (error) {
    console.error('NPK Analysis Error:', error);
    res.status(500).json({ success: false, error: 'Server error during NPK analysis' });
  }
};