import asyncHandler from '../middleware/asyncHandler.js';
import { db, storage } from '../config/firebaseConfig.js';

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  // This route is similar to market/search but simpler
  // You might want to consolidate this with marketController
  const productsSnapshot = await db.collection('products')
    .where('status', '==', 'available')
    .orderBy('createdAt', 'desc')
    .get();
    
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, data: products });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, wasteType, animalType, feedType, quantity, price, unit, location, images, npk } = req.body;
  const user = req.user;

  const newProduct = {
    userId: user.uid,
    farmName: user.farmName || user.name,
    title,
    description,
    wasteType,
    animalType,
    feedType,
    quantity: Number(quantity),
    price: Number(price),
    unit,
    location,
    images: images || [], // Assume images are URLs for now
    npk: npk || {}, // e.g., { n: 5, p: 2, k: 3 }
    status: 'available', // available, sold
    verified: false, // Admin or system can verify this
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  const productRef = await db.collection('products').add(newProduct);

  res.status(201).json({ success: true, data: { id: productRef.id, ...newProduct } });
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const productDoc = await db.collection('products').doc(productId).get();

  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ success: true, data: { id: productDoc.id, ...productDoc.data() } });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const user = req.user;
  const updatedData = req.body;

  const productRef = db.collection('products').doc(productId);
  const productDoc = await productRef.get();

  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (productDoc.data().userId !== user.uid) {
    res.status(401);
    throw new Error('User not authorized to update this product');
  }

  // Remove fields that should not be updated this way
  delete updatedData.id;
  delete updatedData.userId;
  delete updatedData.farmName;
  delete updatedData.createdAt;

  updatedData.updatedAt = new Date().toISOString();

  await productRef.update(updatedData);

  res.status(200).json({ success: true, data: { id: productId, ...updatedData } });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const user = req.user;

  const productRef = db.collection('products').doc(productId);
  const productDoc = await productRef.get();

  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (productDoc.data().userId !== user.uid) {
    res.status(401);
    throw new Error('User not authorized to delete this product');
  }

  // TODO: Delete images from storage
  // TODO: Delete related bookings, chats? (or archive)
  
  await productRef.delete();

  res.status(200).json({ success: true, message: 'Product deleted' });
});

export {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
};