// server/src/controllers/matchingController.js
import { db } from '../config/firebaseConfig.js';

const productsCollection = db.collection('products');
const usersCollection = db.collection('users');
const matchingCollection = db.collection('matching_requests');

// สร้างคำขอจับคู่
export const createMatching = async (req, res) => {
  try {
    const {
      type,
      quantity,
      unit,
      location,
      maxDistance,
      priceRange,
      description
    } = req.body;
    
    if (!type || !quantity || !location) {
      return res.status(400).json({
        success: false,
        error: 'Type, quantity, and location are required'
      });
    }
    
    const userId = req.user.uid;
    
    const matchingData = {
      type,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      location,
      maxDistance: maxDistance || 50, // km
      priceRange: priceRange || { min: 0, max: 999999 },
      description: description || '',
      userId,
      requester: {
        uid: userId,
        email: req.user.email,
        displayName: req.user.displayName
      },
      status: 'active', // active, matched, closed
      matches: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await matchingCollection.add(matchingData);
    
    // หาสินค้าที่ตรงกับความต้องการ
    const matches = await findMatchingProducts(matchingData);
    
    // อัพเดต matches
    if (matches.length > 0) {
      await matchingCollection.doc(docRef.id).update({
        matches: matches.map(m => m.id)
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Matching request created',
      data: {
        id: docRef.id,
        ...matchingData,
        matchedProducts: matches
      }
    });
  } catch (error) {
    console.error('Create matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create matching request'
    });
  }
};

// หาสินค้าที่เหมาะสมสำหรับผู้ใช้
export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ตรวจสอบว่าเป็นเจ้าของหรือไม่
    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }
    
    // ดึงข้อมูล user
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    
    // ดึงคำขอจับคู่ล่าสุด
    const matchingSnapshot = await matchingCollection
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    let recommendations = [];
    
    if (!matchingSnapshot.empty) {
      // มีคำขอจับคู่อยู่
      const matchingData = matchingSnapshot.docs[0].data();
      recommendations = await findMatchingProducts(matchingData);
    } else {
      // ไม่มีคำขอ แนะนำตาม location
      const query = productsCollection
        .where('status', '==', 'available')
        .orderBy('createdAt', 'desc')
        .limit(10);
      
      if (userData.location) {
        query.where('location', '==', userData.location);
      }
      
      const snapshot = await query.get();
      snapshot.forEach(doc => {
        recommendations.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
};

// ฟังก์ชันช่วยหาสินค้าที่ตรงกับความต้องการ
async function findMatchingProducts(matchingData) {
  try {
    let query = productsCollection
      .where('status', '==', 'available')
      .where('type', '==', matchingData.type);
    
    const snapshot = await query.get();
    const matches = [];
    
    snapshot.forEach(doc => {
      const product = doc.data();
      
      // Filter by quantity
      if (product.quantity < matchingData.quantity) return;
      
      // Filter by location (simple check)
      if (matchingData.location && product.location !== matchingData.location) {
        return; // TODO: ใช้ distance calculation จริง
      }
      
      // Filter by price
      if (matchingData.priceRange) {
        if (product.price < matchingData.priceRange.min || 
            product.price > matchingData.priceRange.max) {
          return;
        }
      }
      
      matches.push({
        id: doc.id,
        ...product,
        matchScore: calculateMatchScore(matchingData, product)
      });
    });
    
    // เรียงตาม match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches.slice(0, 10); // ส่งกลับ 10 รายการที่ดีที่สุด
  } catch (error) {
    console.error('Find matching products error:', error);
    return [];
  }
}

// คำนวณคะแนนความเหมาะสม
function calculateMatchScore(request, product) {
  let score = 100;
  
  // ตรง location = +20
  if (request.location === product.location) {
    score += 20;
  }
  
  // ปริมาณมากกว่าที่ต้องการ = +10
  if (product.quantity >= request.quantity) {
    score += 10;
  }
  
  // ราคาถูกกว่า = +15
  if (product.price < (request.priceRange?.max || 999999) * 0.8) {
    score += 15;
  }
  
  // สินค้าใหม่ = +5
  const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    score += 5;
  }
  
  return score;
}