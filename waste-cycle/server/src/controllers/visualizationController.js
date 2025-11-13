// server/src/controllers/visualizationController.js
import { db } from '../config/firebaseConfig.js';

const farmsCollection = db.collection('farms');
const bookingsCollection = db.collection('bookings');

/**
 * @desc    แสดงข้อมูลภาพวงจรเกษตรหมุนเวียน (API-21)
 * @route   GET /api/visualization/cycle
 * @access  Public
 */
export const getCycleData = async (req, res) => {
  try {
    // 1. นับจำนวนฟาร์ม
    const cropFarmsPromise = farmsCollection.where('type', '==', 'crop').count().get();
    const livestockFarmsPromise = farmsCollection.where('type', '==', 'livestock').count().get();
    
    // 2. คำนวณยอดรวมจาก bookings
    const completedBookingsPromise = bookingsCollection.where('status', '==', 'completed').get();

    const [cropSnapshot, livestockSnapshot, completedBookings] = await Promise.all([
      cropFarmsPromise,
      livestockFarmsPromise,
      completedBookingsPromise
    ]);

    let totalWasteRecycled = 0; // ตัน
    let totalValue = 0; // บาท

    completedBookings.forEach(doc => {
      const booking = doc.data();
      // สมมติว่า quantity อยู่ในหน่วย kg
      totalWasteRecycled += booking.quantity || 0;
      totalValue += booking.totalPrice || 0;
    });

    // แปลง kg เป็น ton
    totalWasteRecycled = totalWasteRecycled / 1000; 

    // Mock-up data for chart
    const wasteFlowData = [
      { name: 'มูลสัตว์ → ฟาร์มพืช', value: 65, color: '#10b981' },
      { name: 'เศษพืช → ฟาร์มสัตว์', value: 35, color: '#f59e0b' },
    ];

    res.json({
      success: true,
      data: {
        participants: {
          cropFarms: cropSnapshot.data().count,
          livestockFarms: livestockSnapshot.data().count,
        },
        impact: {
          wasteRecycledTonnes: totalWasteRecycled.toFixed(2),
          totalValueExchanged: totalValue,
        },
        wasteFlowChart: wasteFlowData,
      }
    });

  } catch (error) {
    console.error('Get Cycle Data Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch visualization data' });
  }
};