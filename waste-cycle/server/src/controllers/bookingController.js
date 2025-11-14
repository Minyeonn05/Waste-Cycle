// server/src/controllers/bookingController.js
import { db } from '../config/firebaseConfig.js';
import { validateBooking } from '../utils/validation.js';
import asyncHandler from '../middleware/asyncHandler.js';
// 1. 👈 [เพิ่ม] Import service แจ้งเตือน
import { createNotification } from '../utils/notificationService.js'; 

const bookingsCollection = db.collection('bookings');
const productsCollection = db.collection('products');

// สร้างการจอง
export const createBooking = asyncHandler(async (req, res, next) => {
  const {
    productId, quantity, deliveryDate, deliveryAddress, contactPhone, note
  } = req.body;
  
  const validationErrors = validateBooking({ productId, quantity, deliveryDate });
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, errors: validationErrors });
  }
  
  const userId = req.user.uid;
  const bookingRef = bookingsCollection.doc();
  const productRef = productsCollection.doc(productId);
  
  try {
    let productData; // 👈 [เพิ่ม] ประกาศไว้นอก Transaction
    let bookingDataForNotif; // 👈 [เพิ่ม]

    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) throw new Error('ไม่พบสินค้า'); 
      
      productData = productDoc.data(); // 👈 [เพิ่ม] เก็บข้อมูลสินค้าไว้
      
      if (productData.status !== 'available') throw new Error('สินค้าไม่พร้อมจำหน่าย');
      if (productData.quantity < quantity) throw new Error(`สินค้ามีไม่เพียงพอ. (เหลือ: ${productData.quantity})`);
      if (productData.userId === userId) throw new Error('ไม่สามารถจองสินค้าของตัวเองได้');
      
      const bookingData = {
        productId,
        product: {
          name: productData.name, type: productData.type,
          unit: productData.unit, price: productData.price,
          seller: productData.seller
        },
        quantity: parseFloat(quantity),
        totalPrice: productData.price * parseFloat(quantity),
        deliveryDate: deliveryDate,
        deliveryAddress: deliveryAddress || '',
        contactPhone: contactPhone || '',
        note: note || '',
        buyerId: userId,
        buyer: {
          uid: userId, email: req.user.email, displayName: req.user.displayName
        },
        sellerId: productData.userId,
        status: 'pending', 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      bookingDataForNotif = bookingData; // 👈 [เพิ่ม]
      transaction.set(bookingRef, bookingData);
      transaction.update(productRef, {
        status: 'reserved',
        reservedBy: userId,
        reservedQuantity: parseFloat(quantity),
        updatedAt: new Date().toISOString()
      });
    });
    
    // --- 2. 👈 [เพิ่ม] ยิงแจ้งเตือนหา "ผู้ขาย" (นอก Transaction) ---
    if (productData && bookingDataForNotif) {
      const sellerId = productData.userId;
      const buyerName = req.user.displayName || 'ผู้ใช้';
      await createNotification(
        sellerId, 
        'คุณมีการจองใหม่!', 
        `${buyerName} ได้จอง "${productData.name}" จำนวน ${quantity} กก.`,
        `/bookings`, // (ลิงก์ใน client ที่จะพาไปหน้า 'การจอง')
        'booking'
      );
    }
    // ---------------------------------------------
    
    const bookingDoc = await bookingRef.get();
    res.status(201).json({
      success: true,
      message: 'สร้างการจองสำเร็จ',
      data: { id: bookingRef.id, ...bookingDoc.data() }
    });

  } catch (transactionError) {
    return next(transactionError); 
  }
});

// ดึงการจองของผู้ใช้
export const getUserBookings = asyncHandler(async (req, res, next) => {
  // ... (โค้ดเดิม ไม่ต้องแก้) ...
  const { userId } = req.params;
  
  if (userId !== req.user.uid) {
    return res.status(403).json({ success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' });
  }
  
  const buyerSnapshot = await bookingsCollection
    .where('buyerId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  const sellerSnapshot = await bookingsCollection
    .where('sellerId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  const buyerBookings = [];
  buyerSnapshot.forEach(doc => {
    buyerBookings.push({ id: doc.id, role: 'buyer', ...doc.data() });
  });
  
  const sellerBookings = [];
  sellerSnapshot.forEach(doc => {
    sellerBookings.push({ id: doc.id, role: 'seller', ...doc.data() });
  });
  
  res.json({
    success: true,
    data: { asBuyer: buyerBookings, asSeller: sellerBookings }
  });
});

// อัพเดตสถานะการจอง
export const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'สถานะไม่ถูกต้อง (ต้องเป็น confirmed, completed, หรือ cancelled เท่านั้น)'
    });
  }
  
  const userId = req.user.uid;
  const bookingRef = bookingsCollection.doc(id);
  
  try {
    let bookingDataForNotif; // 👈 [เพิ่ม]
    
    await db.runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists) throw new Error('ไม่พบการจองนี้');
      
      const bookingData = bookingDoc.data();
      bookingDataForNotif = bookingData; // 👈 [เพิ่ม] เก็บข้อมูลไว้
      
      if (status === 'confirmed' && bookingData.sellerId !== userId) throw new Error('เฉพาะผู้ขายเท่านั้นที่สามารถ "ยืนยัน" การจองได้');
      if (status === 'completed' && bookingData.sellerId !== userId) throw new Error('เฉพาะผู้ขายเท่านั้นที่สามารถ "เสร็จสิ้น" การจองได้');
      if (status === 'cancelled' && bookingData.buyerId !== userId && bookingData.sellerId !== userId) {
        throw new Error('คุณไม่มีสิทธิ์ยกเลิกการจองนี้');
      }
      
      transaction.update(bookingRef, { status, updatedAt: new Date().toISOString() });
      
      // ... (โค้ด update product status ... เหมือนเดิม) ...
      if (status === 'cancelled') {
        const productRef = productsCollection.doc(bookingData.productId);
        transaction.update(productRef, {
          status: 'available', reservedBy: null, reservedQuantity: 0,
          updatedAt: new Date().toISOString()
        });
      }
      
      if (status === 'completed') {
        const productRef = productsCollection.doc(bookingData.productId);
        const productDoc = await transaction.get(productRef);
        if(productDoc.exists) { // 👈 [เพิ่ม] เช็กก่อนว่ามีสินค้า
          const productData = productDoc.data();
          const newQuantity = productData.quantity - bookingData.quantity;
          
          transaction.update(productRef, {
            quantity: newQuantity,
            status: newQuantity > 0 ? 'available' : 'sold',
            reservedBy: null, reservedQuantity: 0,
            updatedAt: new Date().toISOString()
          });
        }
      }
    });

    // --- 3. 👈 [เพิ่ม] ยิงแจ้งเตือนหา "ผู้ซื้อ" ---
    if (bookingDataForNotif) {
      const buyerId = bookingDataForNotif.buyerId;
      let title = '';
      let message = '';
      const productName = bookingDataForNotif.product.name;
      const sellerName = bookingDataForNotif.product.seller.displayName || 'ผู้ขาย';

      if (status === 'confirmed') {
        title = 'การจองของคุณถูกยืนยันแล้ว';
        message = `${sellerName} ยืนยันการจอง "${productName}" ของคุณแล้ว`;
      } else if (status === 'cancelled') {
        title = 'การจองของคุณถูกยกเลิก';
        message = `การจอง "${productName}" ถูกยกเลิกโดย ${sellerName}`;
      } else if (status === 'completed') {
        title = 'การจองเสร็จสิ้น';
        message = `การจอง "${productName}" เสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ`;
      }
      
      if (title) { // ถ้ามี title (แปลว่ามีสถานะที่ต้องแจ้ง)
        await createNotification(buyerId, title, message, '/bookings', 'booking');
      }
    }
    // ----------------------------------------
    
    const updatedDoc = await bookingRef.get();
    res.json({
      success: true,
      message: 'อัปเดตสถานะการจองสำเร็จ',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (transactionError) {
    return next(transactionError);
  }
});