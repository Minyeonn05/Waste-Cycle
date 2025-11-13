// server/src/controllers/marketController.js
import { db } from '../config/firebaseConfig.js';

const pricesCollection = db.collection('market_prices');

/**
 * @desc    แสดงราคาตลาดเฉลี่ย (API-19)
 * @route   GET /api/market/price
 * @access  Public
 */
export const getMarketPrices = async (req, res) => {
  try {
    const snapshot = await pricesCollection.orderBy('lastUpdated', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: 'No market prices found' });
    }

    const prices = [];
    snapshot.forEach(doc => {
      prices.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: prices });

  } catch (error) {
    console.error('Get Market Prices Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market prices' });
  }
};

/**
 * @desc    (Admin) อัปเดตราคากลางตลาด (API-20)
 * @route   POST /api/market/update
 * @access  Admin
 */
export const updateMarketPrice = async (req, res) => {
  try {
    const { name, unit, price } = req.body;

    if (!name || !unit || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, unit, and price are required' });
    }

    // ใช้ชื่อเป็น ID (เช่น "มูลไก่แห้ง")
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
      message: 'Market price updated successfully',
      data: priceData 
    });

  } catch (error) {
    console.error('Update Market Price Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update market price' });
  }
};