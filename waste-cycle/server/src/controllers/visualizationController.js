// server/src/controllers/visualizationController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; // 👈 [เพิ่ม]

const farmsCollection = db.collection('farms');
const bookingsCollection = db.collection('bookings');

/**
 * @desc    แสดงข้อมูลภาพวงจรเกษตรหมุนเวียน (API-21)
 * @route   GET /api/visualization/cycle
 * @access  Public
 */
export const getCycleData = asyncHandler(async (req, res, next) => {
  const cropFarmsPromise = farmsCollection.where('type', '==', 'crop').count().get();
  const livestockFarmsPromise = farmsCollection.where('type', '==', 'livestock').count().get();
  const completedBookingsPromise = bookingsCollection.where('status', '==', 'completed').get();

  const [cropSnapshot, livestockSnapshot, completedBookings] = await Promise.all([
    cropFarmsPromise,
    livestockFarmsPromise,
    completedBookingsPromise
  ]);

  let totalWasteRecycled = 0; 
  let totalValue = 0; 

  completedBookings.forEach(doc => {
    const booking = doc.data();
    totalWasteRecycled += booking.quantity || 0;
    totalValue += booking.totalPrice || 0;
  });

  totalWasteRecycled = totalWasteRecycled / 1000; // แปลง kg เป็น ton

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
});