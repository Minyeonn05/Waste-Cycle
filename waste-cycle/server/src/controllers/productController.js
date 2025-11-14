// server/src/controllers/productController.js
import { db } from '../config/firebaseConfig.js';
import { validateProduct } from '../utils/validation.js';
import asyncHandler from '../middleware/asyncHandler.js'; 

const productsCollection = db.collection('products');

// --- [เพิ่ม] Helper Function (ลดโค้ดซ้ำ) ---
const getProductAndCheckOwnership = async (productId, userId, userRole) => {
  const doc = await productsCollection.doc(productId).get();

  if (!doc.exists) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  if (doc.data().userId !== userId && userRole !== 'admin') {
    const error = new Error('Unauthorized to modify this product');
    error.status = 403;
    throw error;
  }

  return doc;
};

// ดึงสินค้าทั้งหมด
export const getAllProducts = asyncHandler(async (req, res, next) => {
  const { limit = 20, status, type } = req.query;
  
  let query = productsCollection.orderBy('createdAt', 'desc');
  
  if (status) query = query.where('status', '==', status);
  if (type) query = query.where('type', '==', type);
  
  query = query.limit(parseInt(limit));
  
  const snapshot = await query.get();
  const products = [];
  
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// สร้างสินค้าใหม่
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name, type, quantity, unit, location, coordinates, description, price, images, farmId
  } = req.body;
  
  const validationErrors = validateProduct({ name, type, quantity, unit, location });
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, errors: validationErrors });
  }
  
  const userId = req.user.uid;
  
  const searchTerms = [
    name.toLowerCase(),
    type.toLowerCase(),
    location.toLowerCase(),
    ...name.toLowerCase().split(' '),
    ...location.toLowerCase().split(' ')
  ];
  
  const productData = {
    name,
    type, 
    quantity: parseFloat(quantity),
    unit,
    location,
    coordinates: coordinates || null,
    description: description || '',
    price: price ? parseFloat(price) : 0,
    images: images || [],
    farmId: farmId || null,
    userId,
    seller: {
      uid: userId,
      email: req.user.email,
      displayName: req.user.displayName
    },
    status: 'available',
    searchTerms,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await productsCollection.add(productData);
  
  res.status(201).json({
    success: true,
    message: 'สร้างสินค้าสำเร็จ', // 🚨 [แก้ไข]
    data: { id: docRef.id, ...productData }
  });
});

// ดึงสินค้าตาม ID
export const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const doc = await productsCollection.doc(id).get();
  
  if (!doc.exists) {
    const error = new Error('Product not found');
    error.status = 404;
    return next(error); 
  }
  
  await productsCollection.doc(id).update({
    views: (doc.data().views || 0) + 1
  });
  
  res.json({
    success: true,
    data: {
      id: doc.id,
      ...doc.data(),
      views: (doc.data().views || 0) + 1
    }
  });
});

// อัพเดตสินค้า
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  await getProductAndCheckOwnership(id, req.user.uid, req.user.role);
  
  const updateData = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  delete updateData.userId;
  delete updateData.seller;
  delete updateData.createdAt;
  delete updateData.views;
  
  await productsCollection.doc(id).update(updateData);
  const updatedDoc = await productsCollection.doc(id).get();
  
  res.json({
    success: true,
    message: 'อัปเดตสินค้าสำเร็จ', // 🚨 [แก้ไข]
    data: { id: updatedDoc.id, ...updatedDoc.data() }
  });
});

// ลบสินค้า
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await getProductAndCheckOwnership(id, req.user.uid, req.user.role);
  
  await productsCollection.doc(id).delete();
  
  res.json({
    success: true,
    message: 'ลบสินค้าสำเร็จ' // 🚨 [แก้ไข]
  });
});

// ค้นหาสินค้า
export const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, location, type, minQuantity, maxQuantity } = req.query;
  
  let query = productsCollection.where('status', '==', 'available');
  
  if (q) query = query.where('searchTerms', 'array-contains', q.toLowerCase());
  if (location) query = query.where('location', '==', location);
  if (type) query = query.where('type', '==', type);
  
  const snapshot = await query.get();
  let results = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (minQuantity && data.quantity < parseInt(minQuantity)) return;
    if (maxQuantity && data.quantity > parseInt(maxQuantity)) return;
    results.push({ id: doc.id, ...data });
  });
  
  res.json({
    success: true,
    count: results.length,
    data: results
  });
});