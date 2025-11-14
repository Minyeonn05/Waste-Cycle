// server/src/controllers/matchingController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; 

const productsCollection = db.collection('products');
const usersCollection = db.collection('users');
const matchingCollection = db.collection('matching_requests');
const bookingsCollection = db.collection('bookings');

// สร้างคำขอจับคู่
export const createMatching = asyncHandler(async (req, res, next) => {
  const { type, quantity, unit, location, maxDistance, priceRange, description } = req.body;
  
  if (!type || !quantity || !location) {
    // 🚨 [แก้ไข]
    return res.status(400).json({
      success: false, error: 'กรุณาระบุประเภท, จำนวน, และตำแหน่งที่ตั้ง'
    });
  }
  
  const userId = req.user.uid;
  
  const matchingData = {
    type,
    quantity: parseFloat(quantity),
    unit: unit || 'kg',
    location,
    maxDistance: maxDistance || 50,
    priceRange: priceRange || { min: 0, max: 999999 },
    description: description || '',
    userId,
    requester: {
      uid: userId,
      email: req.user.email,
      displayName: req.user.displayName
    },
    status: 'active',
    matches: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await matchingCollection.add(matchingData);
  const matches = await findMatchingProducts(matchingData);
  
  if (matches.length > 0) {
    await matchingCollection.doc(docRef.id).update({
      matches: matches.map(m => m.id)
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'สร้างคำขอจับคู่สำเร็จ', // 🚨 [แก้ไข]
    data: { id: docRef.id, ...matchingData, matchedProducts: matches }
  });
});

// หาสินค้าที่เหมาะสมสำหรับผู้ใช้
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  if (userId !== req.user.uid) {
    // 🚨 [แก้ไข]
    return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์เข้าถึง' });
  }
  
  const userDoc = await usersCollection.doc(userId).get();
  if (!userDoc.exists) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);
  }
  
  const userData = userDoc.data();
  
  const matchingSnapshot = await matchingCollection
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  let recommendations = [];
  
  if (!matchingSnapshot.empty) {
    const matchingData = matchingSnapshot.docs[0].data();
    recommendations = await findMatchingProducts(matchingData);
  } else {
    const query = productsCollection
      .where('status', '==', 'available')
      .orderBy('createdAt', 'desc')
      .limit(10);
    
    if (userData.location) {
      query.where('location', '==', userData.location);
    }
    
    const snapshot = await query.get();
    snapshot.forEach(doc => {
      recommendations.push({ id: doc.id, ...doc.data() });
    });
  }
  
  res.json({
    success: true,
    count: recommendations.length,
    data: recommendations
  });
});

// (Seller) ยื่นข้อเสนอให้ Match Request
export const createOfferForMatch = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { productId, message } = req.body;
  const sellerId = req.user.uid;

  if (!productId) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุ ID สินค้า' });
  }

  const matchRef = matchingCollection.doc(requestId);
  const matchDoc = await matchRef.get();
  if (!matchDoc.exists || matchDoc.data().status !== 'active') {
    // 🚨 [แก้ไข]
    const error = new Error('ไม่พบคำขอจับคู่ หรือคำขอไม่ได้ใช้งานแล้ว');
    error.status = 404;
    return next(error);
  }
  
  const productDoc = await productsCollection.doc(productId).get();
  if (!productDoc.exists) {
    // 🚨 [แก้ไข]
    const error = new Error('ไม่พบสินค้า');
    error.status = 404;
    return next(error);
  }
  
  const productData = productDoc.data();
  
  if (productData.userId !== sellerId) {
    // 🚨 [แก้ไข]
    const error = new Error('คุณไม่ใช่เจ้าของสินค้านี้');
    error.status = 403;
    return next(error);
  }
  if (matchDoc.data().userId === sellerId) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'คุณไม่สามารถยื่นข้อเสนอให้คำขอของตัวเองได้' });
  }

  const offerRef = matchRef.collection('offers').doc();
  const offerData = {
    offerId: offerRef.id,
    sellerId: sellerId,
    sellerInfo: req.user,
    productId: productId,
    productInfo: {
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      unit: productData.unit,
    },
    message: message || '',
    status: 'pending', 
    createdAt: new Date().toISOString()
  };
  
  await offerRef.set(offerData);
  await matchRef.update({ hasOffers: true });

  res.status(201).json({ success: true, message: 'ยื่นข้อเสนอสำเร็จ', data: offerData }); // 🚨 [แก้ไข]
});

// (Buyer) ยอมรับข้อเสนอ
export const acceptMatchOffer = asyncHandler(async (req, res, next) => {
  const { requestId, offerId } = req.params;
  const buyerId = req.user.uid;

  try {
    const newBookingRef = bookingsCollection.doc(); 
    
    const bookingData = await db.runTransaction(async (transaction) => {
      const matchRef = matchingCollection.doc(requestId);
      const offerRef = matchRef.collection('offers').doc(offerId);

      const matchDoc = await transaction.get(matchRef);
      const offerDoc = await transaction.get(offerRef);

      // 🚨 [แก้ไข] แปล Error ใน Transaction
      if (!matchDoc.exists) throw new Error('ไม่พบคำขอจับคู่');
      if (!offerDoc.exists) throw new Error('ไม่พบข้อเสนอ');

      const matchData = matchDoc.data();
      const offerData = offerDoc.data();

      if (matchData.userId !== buyerId) throw new Error('ไม่มีสิทธิ์: คุณไม่ใช่เจ้าของคำขอนี้');
      if (matchData.status !== 'active') throw new Error('คำขอนี้ถูกจับคู่หรือปิดไปแล้ว');
      if (offerData.status !== 'pending') throw new Error('ข้อเสนอนี้ไม่ได้อยู่ในสถานะรอดำเนินการ');
      
      const productRef = productsCollection.doc(offerData.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists || productDoc.data().status !== 'available') {
        throw new Error('สินค้าชิ้นนี้ไม่พร้อมจำหน่ายแล้ว');
      }
      
      const productData = productDoc.data();
      const requestedQuantity = matchData.quantity; 

      if (productData.quantity < requestedQuantity) {
        throw new Error(`สินค้ามีไม่เพียงพอ. (เหลือ: ${productData.quantity})`);
      }

      transaction.update(matchRef, {
        status: 'matched',
        acceptedOfferId: offerId,
        updatedAt: new Date().toISOString()
      });
      transaction.update(offerRef, { status: 'accepted', updatedAt: new Date().toISOString() });
      transaction.update(productRef, {
        status: 'reserved',
        reservedBy: buyerId,
        reservedQuantity: requestedQuantity,
        updatedAt: new Date().toISOString()
      });
      
      const finalBookingData = {
        bookingId: newBookingRef.id,
        matchRequestId: requestId,
        offerId: offerId,
        productId: offerData.productId,
        product: {
          name: productData.name, type: productData.type,
          unit: productData.unit, price: productData.price,
          seller: productData.seller
        },
        quantity: requestedQuantity,
        totalPrice: productData.price * requestedQuantity,
        deliveryDate: null, 
        buyerId: buyerId,
        buyer: {
          uid: buyerId, email: req.user.email, displayName: req.user.displayName
        },
        sellerId: offerData.sellerId,
        status: 'confirmed', 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      transaction.set(newBookingRef, finalBookingData);
      return finalBookingData;
    });

    res.status(201).json({
      success: true,
      message: 'ยอมรับข้อเสนอ และสร้างการจองสำเร็จ!', // 🚨 [แก้ไข]
      data: bookingData
    });

  } catch (transactionError) {
    return next(transactionError);
  }
});


// (ฟังก์ชัน Helper เหมือนเดิม)
async function findMatchingProducts(matchingData) {
  try {
    let query = productsCollection
      .where('status', '==', 'available')
      .where('type', '==', matchingData.type);
    
    const snapshot = await query.get();
    const matches = [];
    
    snapshot.forEach(doc => {
      const product = doc.data();
      if (product.quantity < matchingData.quantity) return;
      if (matchingData.location && product.location !== matchingData.location) return;
      if (matchingData.priceRange) {
        if (product.price < matchingData.priceRange.min || product.price > matchingData.priceRange.max) return;
      }
      matches.push({ id: doc.id, ...product, matchScore: calculateMatchScore(matchingData, product) });
    });
    
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, 10);
  } catch (error) {
    console.error('Find matching products error:', error);
    return [];
  }
}

function calculateMatchScore(request, product) {
  let score = 100;
  if (request.location === product.location) score += 20;
  if (product.quantity >= request.quantity) score += 10;
  if (product.price < (request.priceRange?.max || 999999) * 0.8) score += 15;
  const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) score += 5;
  return score;
}