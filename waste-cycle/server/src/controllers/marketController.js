// server/src/controllers/marketController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; // 👈 [เพิ่ม]

const pricesCollection = db.collection('market_prices');

// API-19
export const getMarketPrices = asyncHandler(async (req, res, next) => {
  const snapshot = await pricesCollection.orderBy('lastUpdated', 'desc').get();
  
  if (snapshot.empty) {
    // 🚨 [แก้ไข]
    return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลราคาตลาด' });
  }

  const prices = [];
  snapshot.forEach(doc => {
    prices.push({ id: doc.id, ...doc.data() });
  });

  res.json({ success: true, data: prices });
});

// API-20
export const updateMarketPrice = asyncHandler(async (req, res, next) => {
  const { name, unit, price } = req.body;

  if (!name || !unit || price === undefined) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อ, หน่วย, และราคา' });
  }

  const priceId = name.replace(/\s+/g, '_').toLowerCase();
  
  const priceData = {
    name: name,
    unit: unit,
    price: parseFloat(price),
    lastUpdated: new Date().toISOString()
  };

  await pricesCollection.doc(priceId).set(priceData, { merge: true });

  res.status(201).json({ 
    success: true, 
    message: 'อัปเดตราคาตลาดสำเร็จ', // 🚨 [แก้ไข]
    data: priceData 
  });
});