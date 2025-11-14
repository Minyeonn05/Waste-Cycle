// server/src/controllers/matchingController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; 
// 1. 👈 [เพิ่ม] Import service แจ้งเตือน
import { createNotification } from '../utils/notificationService.js';

const productsCollection = db.collection('products');
const usersCollection = db.collection('users');
const matchingCollection = db.collection('matching_requests');
const bookingsCollection = db.collection('bookings');

// --- (ฟังก์ชัน Helper อยู่ท้ายไฟล์) ---

/**
 * @desc    สร้างคำขอจับคู่ (Matching Request)
 * @route   POST /api/matching/
 * @access  Private
 */
export const createMatching = asyncHandler(async (req, res, next) => {
  const { type, quantity, unit, location, maxDistance, priceRange, description } = req.body;
  
  if (!type || !quantity || !location) {
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
  // ลองค้นหา match ทันที
  const matches = await findMatchingProducts(matchingData);
  
  if (matches.length > 0) {
    await matchingCollection.doc(docRef.id).update({
      matches: matches.map(m => m.id)
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'สร้างคำขอจับคู่สำเร็จ',
    data: { id: docRef.id, ...matchingData, matchedProducts: matches }
  });
});

/**
 * @desc    หาสินค้าที่เหมาะสมสำหรับผู้ใช้ (Recommendations)
 * @route   GET /api/matching/recommend/:userId
 * @access  Private
 */
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  if (userId !== req.user.uid) {
    return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์เข้าถึง' });
  }
  
  const userDoc = await usersCollection.doc(userId).get();
  if (!userDoc.exists) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);
  }
  
  const userData = userDoc.data();
  
  // พยายามหาคำขอ (Request) ล่าสุดของผู้ใช้
  const matchingSnapshot = await matchingCollection
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  let recommendations = [];
  
  if (!matchingSnapshot.empty) {
    // ถ้ามีคำขอ -> ใช้คำขอนั้นหา
    const matchingData = matchingSnapshot.docs[0].data();
    recommendations = await findMatchingProducts(matchingData);
  } else {
    // ถ้าไม่มีคำขอ -> แนะนำสินค้าใหม่ๆ ทั่วไป
    let query = productsCollection
      .where('status', '==', 'available')
      .orderBy('createdAt', 'desc')
      .limit(10);
    
    // (Optional: อาจจะกรองตามพื้นที่ของผู้ใช้)
    // if (userData.location) {
    //   query = query.where('location', '==', userData.location);
    // }
    
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

/**
 * @desc    (Seller) ยื่นข้อเสนอให้ Match Request
 * @route   POST /api/matching/:requestId/offer
 * @access  Private (Seller)
 */
export const createOfferForMatch = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { productId, message } = req.body;
  const sellerId = req.user.uid; // 
  if (!productId) {
    return res.status(400).json({ success: false, error: 'กรุณาระบุ ID สินค้า' });
  }

  // 1. ดึงคำขอ (Match Request)
  const matchRef = matchingCollection.doc(requestId);
  const matchDoc = await matchRef.get();
  if (!matchDoc.exists || matchDoc.data().status !== 'active') {
    const error = new Error('ไม่พบคำขอจับคู่ หรือคำขอไม่ได้ใช้งานแล้ว');
    error.status = 404;
    return next(error);
  }
  
  // 2. ดึงสินค้า (Product) ของผู้ขาย
  const productDoc = await productsCollection.doc(productId).get();
  if (!productDoc.exists) {
    const error = new Error('ไม่พบสินค้า');
    error.status = 404;
    return next(error);
  }
  
  const productData = productDoc.data();
  
  // 3. ตรวจสอบสิทธิ์
  if (productData.userId !== sellerId) {
    const error = new Error('คุณไม่ใช่เจ้าของสินค้านี้');
    error.status = 403;
    return next(error);
  }
  if (matchDoc.data().userId === sellerId) {
    return res.status(400).json({ success: false, error: 'คุณไม่สามารถยื่นข้อเสนอให้คำขอของตัวเองได้' });
  }

  // 4. สร้าง Offer ใน Subcollection
  const offerRef = matchRef.collection('offers').doc();
  const offerData = {
    offerId: offerRef.id,
    sellerId: sellerId,
    sellerInfo: req.user, // ข้อมูลผู้ขาย (จาก verifyToken)
    productId: productId,
    productInfo: {
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      unit: productData.unit,
    },
    message: message || '',
    status: 'pending', // pending, accepted, rejected
    createdAt: new Date().toISOString()
  };
  
  await offerRef.set(offerData);
  await matchRef.update({ hasOffers: true }); // อัปเดตคำขอหลัก

  // --- 5. 👈 [ยิงแจ้งเตือน] ---
  const matchData = matchDoc.data();
  const requesterId = matchData.userId; // ID เจ้าของคำขอ
  const sellerName = req.user.displayName || 'ผู้ขาย';
  
  await createNotification(
    requesterId,
    'มีข้อเสนอใหม่สำหรับคำขอของคุณ!',
    `${sellerName} ได้ยื่นข้อเสนอสำหรับ "${matchData.type}" ที่คุณกำลังมองหา`,
    `/matching/${requestId}`, // (สมมติว่ามีหน้านี้)
    'match'
  );
  // -------------------------

  res.status(201).json({ success: true, message: 'ยื่นข้อเสนอสำเร็จ', data: offerData });
});

/**
 * @desc    (Buyer) ยอมรับข้อเสนอ (Accept Offer)
 * @route   POST /api/matching/:requestId/accept/:offerId
 * @access  Private (Buyer)
 */
export const acceptMatchOffer = asyncHandler(async (req, res, next) => {
  const { requestId, offerId } = req.params;
  const buyerId = req.user.uid;

  try {
    const newBookingRef = bookingsCollection.doc(); // จอง ID Booking ใหม่ไว้ก่อน
    let offerDataForNotif; // 👈 [เพิ่ม] สำหรับส่งแจ้งเตือน

    const bookingData = await db.runTransaction(async (transaction) => {
      const matchRef = matchingCollection.doc(requestId);
      const offerRef = matchRef.collection('offers').doc(offerId);

      // 1. ดึงข้อมูล
      const matchDoc = await transaction.get(matchRef);
      const offerDoc = await transaction.get(offerRef);

      // 2. แปล Error เป็นไทย
      if (!matchDoc.exists) throw new Error('ไม่พบคำขอจับคู่');
      if (!offerDoc.exists) throw new Error('ไม่พบข้อเสนอ');

      const matchData = matchDoc.data();
      const offerData = offerDoc.data();
      offerDataForNotif = offerData; // 👈 [เพิ่ม] เก็บข้อมูลไว้

      // 3. ตรวจสอบสิทธิ์และสถานะ (แปลไทย)
      if (matchData.userId !== buyerId) throw new Error('ไม่มีสิทธิ์: คุณไม่ใช่เจ้าของคำขอนี้');
      if (matchData.status !== 'active') throw new Error('คำขอนี้ถูกจับคู่หรือปิดไปแล้ว');
      if (offerData.status !== 'pending') throw new Error('ข้อเสนอนี้ไม่ได้อยู่ในสถานะรอดำเนินการ');
      
      // 4. ดึงสินค้า
      const productRef = productsCollection.doc(offerData.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists || productDoc.data().status !== 'available') {
        throw new Error('สินค้าชิ้นนี้ไม่พร้อมจำหน่ายแล้ว');
      }
      
      const productData = productDoc.data();
      const requestedQuantity = matchData.quantity; // ปริมาณที่ผู้ซื้อต้องการ

      if (productData.quantity < requestedQuantity) {
        throw new Error(`สินค้ามีไม่เพียงพอ. (เหลือ: ${productData.quantity})`);
      }

      // --- ถ้าทุกอย่างผ่าน ---

      // 5. อัปเดต Match Request -> 'matched'
      transaction.update(matchRef, {
        status: 'matched',
        acceptedOfferId: offerId,
        updatedAt: new Date().toISOString()
      });

      // 6. อัปเดต Offer -> 'accepted'
      transaction.update(offerRef, { status: 'accepted', updatedAt: new Date().toISOString() });

      // 7. อัปเดต Product -> 'reserved'
      transaction.update(productRef, {
        status: 'reserved',
        reservedBy: buyerId,
        reservedQuantity: requestedQuantity,
        updatedAt: new Date().toISOString()
      });
      
      // 8. [สำคัญ] สร้าง Booking ใหม่
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
        deliveryDate: null, // (อาจจะใช้ค่าจาก Match)
        buyerId: buyerId,
        buyer: {
          uid: buyerId, email: req.user.email, displayName: req.user.displayName
        },
        sellerId: offerData.sellerId,
        status: 'confirmed', // "ยืนยันแล้ว" ทันที
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      transaction.set(newBookingRef, finalBookingData);
      return finalBookingData;
    });

    // --- 9. 👈 [ยิงแจ้งเตือน] ---
    if (offerDataForNotif) {
      const sellerId = offerDataForNotif.sellerId;
      const buyerName = req.user.displayName || 'ผู้ซื้อ';
      
      await createNotification(
        sellerId,
        'ข้อเสนอของคุณถูกยอมรับแล้ว!',
        `${buyerName} ได้ยอมรับข้อเสนอ "${offerDataForNotif.productInfo.name}" ของคุณ`,
        `/bookings`,
        'match'
      );
    }
    // -------------------------

    // Transaction สำเร็จ
    res.status(201).json({
      success: true,
      message: 'ยอมรับข้อเสนอ และสร้างการจองสำเร็จ!',
      data: bookingData
    });

  } catch (transactionError) {
    // ส่ง Error (ภาษาไทย) ไปให้ errorMiddleware
    return next(transactionError);
  }
});


// ----------------------------------------------------------------
// ⬇️ HELPER FUNCTIONS (ฟังก์ชันช่วย) ⬇️
// ----------------------------------------------------------------

/**
 * (Helper) ค้นหาสินค้าที่ตรงกับคำขอ
 */
async function findMatchingProducts(matchingData) {
  try {
    let query = productsCollection
      .where('status', '==', 'available')
      .where('type', '==', matchingData.type);
    
    // (อาจจะเพิ่มเงื่อนไขอื่นๆ เช่น location)
    // if (matchingData.location) {
    //   query = query.where('location', '==', matchingData.location);
    // }

    const snapshot = await query.get();
    const matches = [];
    
    snapshot.forEach(doc => {
      const product = doc.data();
      // กรอง Logic ที่ซับซ้อนใน JavaScript
      if (product.quantity < matchingData.quantity) return;
      
      if (matchingData.priceRange) {
        if (product.price < matchingData.priceRange.min || product.price > matchingData.priceRange.max) return;
      }
      
      matches.push({ 
        id: doc.id, 
        ...product, 
        matchScore: calculateMatchScore(matchingData, product) 
      });
    });
    
    // เรียงตามคะแนน
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, 10); // ส่งคืน 10 อันดับแรก

  } catch (error) {
    console.error('Find matching products error:', error);
    return [];
  }
}

/**
 * (Helper) คำนวณคะแนนความเข้ากันได้
 */
function calculateMatchScore(request, product) {
  let score = 100;
  if (request.location === product.location) score += 20;
  if (product.quantity >= request.quantity) score += 10;
  if (product.price < (request.priceRange?.max || 999999) * 0.8) score += 15;
  const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) score += 5; // โพสต์ใหม่
  return score;
}