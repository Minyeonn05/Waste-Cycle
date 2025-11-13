// server/src/controllers/bookingController.js
import { db } from '../config/firebaseConfig.js';
import { validateBooking } from '../utils/validation.js';

const bookingsCollection = db.collection('bookings');
const productsCollection = db.collection('products');

// สร้างการจอง (ใช้ Transaction ป้องกันการจองซ้ำ)
export const createBooking = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      deliveryDate,
      deliveryAddress,
      contactPhone,
      note
    } = req.body;
    
    // Validation
    const validationErrors = validateBooking({
      productId,
      quantity,
      deliveryDate
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    const userId = req.user.uid;
    
    // ใช้ Transaction เพื่อป้องกันการจองซ้ำ
    const bookingRef = bookingsCollection.doc();
    const productRef = productsCollection.doc(productId);
    
    try {
      await db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists) {
          throw new Error('Product not found');
        }
        
        const productData = productDoc.data();
        
        // ตรวจสอบสถานะสินค้า
        if (productData.status !== 'available') {
          throw new Error('Product is not available');
        }
        
        // ตรวจสอบปริมาณ
        if (productData.quantity < quantity) {
          throw new Error(`Insufficient quantity. Available: ${productData.quantity}`);
        }
        
        // ห้ามจองสินค้าของตัวเอง
        if (productData.userId === userId) {
          throw new Error('Cannot book your own product');
        }
        
        // สร้างข้อมูลการจอง
        const bookingData = {
          productId,
          product: {
            name: productData.name,
            type: productData.type,
            unit: productData.unit,
            price: productData.price,
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
            uid: userId,
            email: req.user.email,
            displayName: req.user.displayName
          },
          sellerId: productData.userId,
          status: 'pending', // pending, confirmed, completed, cancelled
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // บันทึกการจอง
        transaction.set(bookingRef, bookingData);
        
        // อัพเดตสถานะสินค้า
        transaction.update(productRef, {
          status: 'reserved',
          reservedBy: userId,
          reservedQuantity: parseFloat(quantity),
          updatedAt: new Date().toISOString()
        });
      });
      
      // ดึงข้อมูลการจองที่สร้างเสร็จแล้ว
      const bookingDoc = await bookingRef.get();
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          id: bookingRef.id,
          ...bookingDoc.data()
        }
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return res.status(400).json({
        success: false,
        error: transactionError.message
      });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
};

// ดึงการจองของผู้ใช้
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ตรวจสอบว่าเป็นเจ้าของหรือไม่
    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }
    
    // ดึงทั้งการจองที่เป็น buyer และ seller
    const buyerSnapshot = await bookingsCollection
      .where('buyerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const sellerSnapshot = await bookingsCollection
      .where('sellerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const buyerBookings = [];
    const sellerBookings = [];
    
    buyerSnapshot.forEach(doc => {
      buyerBookings.push({
        id: doc.id,
        role: 'buyer',
        ...doc.data()
      });
    });
    
    sellerSnapshot.forEach(doc => {
      sellerBookings.push({
        id: doc.id,
        role: 'seller',
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      data: {
        asBuyer: buyerBookings,
        asSeller: sellerBookings
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
};

// อัพเดตสถานะการจอง
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be confirmed, completed, or cancelled'
      });
    }
    
    const userId = req.user.uid;
    const bookingRef = bookingsCollection.doc(id);
    
    // ใช้ Transaction
    try {
      await db.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        
        if (!bookingDoc.exists) {
          throw new Error('Booking not found');
        }
        
        const bookingData = bookingDoc.data();
        
        // ตรวจสอบสิทธิ์
        // seller สามารถ confirm, buyer และ seller สามารถ cancel
        if (status === 'confirmed' && bookingData.sellerId !== userId) {
          throw new Error('Only seller can confirm booking');
        }
        
        if (status === 'completed' && bookingData.sellerId !== userId) {
          throw new Error('Only seller can mark as completed');
        }
        
        if (status === 'cancelled' && 
            bookingData.buyerId !== userId && 
            bookingData.sellerId !== userId) {
          throw new Error('Unauthorized to cancel this booking');
        }
        
        // อัพเดตสถานะการจอง
        transaction.update(bookingRef, {
          status,
          updatedAt: new Date().toISOString()
        });
        
        // ถ้ายกเลิก คืนสถานะสินค้า
        if (status === 'cancelled') {
          const productRef = productsCollection.doc(bookingData.productId);
          transaction.update(productRef, {
            status: 'available',
            reservedBy: null,
            reservedQuantity: 0,
            updatedAt: new Date().toISOString()
          });
        }
        
        // ถ้าเสร็จสิ้น ตัดสต็อก
        if (status === 'completed') {
          const productRef = productsCollection.doc(bookingData.productId);
          const productDoc = await transaction.get(productRef);
          const productData = productDoc.data();
          
          const newQuantity = productData.quantity - bookingData.quantity;
          
          transaction.update(productRef, {
            quantity: newQuantity,
            status: newQuantity > 0 ? 'available' : 'sold',
            reservedBy: null,
            reservedQuantity: 0,
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      const updatedDoc = await bookingRef.get();
      
      res.json({
        success: true,
        message: 'Booking status updated',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return res.status(400).json({
        success: false,
        error: transactionError.message
      });
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
};