// waste-cycle/server/src/controllers/productController.js

import asyncHandler from '../middleware/asyncHandler.js';
import { db } from '../config/firebaseConfig.js';
import admin from 'firebase-admin';

// @desc    Create a new product (Post)
// @route   POST /api/products
// @access  Private (user)
const createProduct = asyncHandler(async (req, res) => {
  // สมมติว่า userId ถูกแนบมาจาก authMiddleware
  const userId = req.user.uid; 
  const { title, animalType, wasteType, quantity, price, unit, location, npk, feedType, description, images, contactPhone } = req.body;
  
  // Basic validation (ควรเพิ่มการตรวจสอบที่เข้มงวดกว่านี้)
  if (!title || !animalType || !wasteType || !quantity || !price || !location) {
     res.status(400);
     throw new Error('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
  }

  const newProduct = {
    userId,
    title,
    animalType,
    wasteType,
    quantity: parseFloat(quantity),
    price: parseFloat(price),
    unit,
    // FIX: location ควรถูกแปลงเป็น Object ที่มี lat/lng จริงๆ จากฝั่ง Client หรือ Server
    location: { 
        address: location,
        lat: 18.790, // Mock lat
        lng: 98.980, // Mock lng
    },
    npk,
    feedType,
    description,
    images,
    contactPhone,
    status: 'available',
    verified: true,
    sold: false,
    rating: 0,
    reviewCount: 0,
    distance: Math.random() * 20, // Mock distance
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('products').add(newProduct);

  res.status(201).json({ 
    success: true, 
    message: 'สร้างโพสต์สินค้าสำเร็จ',
    data: { id: docRef.id, ...newProduct } 
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (owner of the product)
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.uid; 
  const updates = req.body;

  const productDoc = await db.collection('products').doc(productId).get();

  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  // ตรวจสอบว่าเป็นเจ้าของโพสต์หรือไม่
  if (productDoc.data().userId !== userId) {
    res.status(403);
    throw new Error('ไม่ได้รับอนุญาตให้แก้ไขโพสต์นี้');
  }

  // เตรียมข้อมูลอัปเดตและแปลง string เป็น number
  const updatedData = {
    ...updates,
    quantity: parseFloat(updates.quantity),
    price: parseFloat(updates.price),
    // location: updates.location เป็น string ต้องระวังถ้ามีการส่ง lat/lng มา
    npk: updates.npk || productDoc.data().npk, 
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('products').doc(productId).update(updatedData);

  res.status(200).json({ 
    success: true, 
    message: 'บันทึกการแก้ไขสินค้าสำเร็จ',
    data: { id: productId, ...productDoc.data(), ...updatedData } 
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (owner of the product)
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.uid; 

  const productDoc = await db.collection('products').doc(productId).get();

  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  // ตรวจสอบว่าเป็นเจ้าของโพสต์หรือไม่
  if (productDoc.data().userId !== userId) {
    res.status(403);
    throw new Error('ไม่ได้รับอนุญาตให้ลบโพสต์นี้');
  }

  await db.collection('products').doc(productId).delete();

  res.status(200).json({ success: true, message: 'ลบโพสต์สินค้าสำเร็จ' });
});

export {
  createProduct,
  updateProduct,
  deleteProduct
};