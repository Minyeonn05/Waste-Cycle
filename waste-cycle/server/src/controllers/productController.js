// server/src/controllers/productController.js
import { db } from '../config/firebaseConfig.js';
import { validateProduct } from '../utils/validation.js';

const productsCollection = db.collection('products');

/**
 * ✅ สร้างสินค้าใหม่ - ใช้ userId จาก token เท่านั้น
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      quantity,
      unit,
      location,
      coordinates,
      description,
      price,
      images,
      farmId
    } = req.body;
    
    // Validation
    const validationErrors = validateProduct({
      name,
      type,
      quantity,
      unit,
      location
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    // ✅ CRITICAL: ใช้ userId จาก token เท่านั้น
    const userId = req.user.uid;
    
    // ✅ เช็คว่ามี userId หรือไม่
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token',
        code: 'NO_USER_ID'
      });
    }
    
    // ✅ Log เพื่อ debug
    console.log(`📝 Creating product for user: ${req.user.email} (${userId})`);
    
    // สร้าง search terms
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
      
      // ✅ CRITICAL: ใช้ userId จาก token
      userId,
      
      // ✅ เก็บข้อมูล seller จาก req.user
      seller: {
        uid: userId,
        email: req.user.email,
        displayName: req.user.displayName || req.user.email // ใช้ email ถ้าไม่มี displayName
      },
      
      status: 'available',
      searchTerms,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await productsCollection.add(productData);
    
    console.log(`✅ Product created: ${docRef.id} by ${req.user.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: docRef.id,
        ...productData
      }
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

/**
 * ✅ อัปเดตสินค้า - ตรวจสอบ ownership
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ CRITICAL: ใช้ userId จาก token
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';
    
    console.log(`📝 Updating product ${id} by ${req.user.email} (${userId})`);
    
    // ดึงสินค้า
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const productData = doc.data();
    
    // ✅ CRITICAL: ตรวจสอบว่าเป็นเจ้าของหรือ admin
    const isOwner = productData.userId === userId;
    const isAdmin = userRole === 'admin';
    
    console.log(`🔍 Owner check: isOwner=${isOwner}, isAdmin=${isAdmin}`);
    console.log(`   Product userId: ${productData.userId}`);
    console.log(`   Request userId: ${userId}`);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this product',
        code: 'NOT_OWNER',
        details: {
          productUserId: productData.userId,
          yourUserId: userId
        }
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // ✅ CRITICAL: ลบฟิลด์ที่ไม่ควรแก้ไข
    delete updateData.userId;
    delete updateData.seller;
    delete updateData.createdAt;
    delete updateData.views;
    
    await productsCollection.doc(id).update(updateData);
    
    const updatedDoc = await productsCollection.doc(id).get();
    
    console.log(`✅ Product updated: ${id}`);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

/**
 * ✅ ลบสินค้า - ตรวจสอบ ownership
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ CRITICAL: ใช้ userId จาก token
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';
    
    console.log(`🗑️ Deleting product ${id} by ${req.user.email} (${userId})`);
    
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const productData = doc.data();
    
    // ✅ CRITICAL: ตรวจสอบ ownership
    const isOwner = productData.userId === userId;
    const isAdmin = userRole === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this product',
        code: 'NOT_OWNER'
      });
    }
    
    await productsCollection.doc(id).delete();
    
    console.log(`✅ Product deleted: ${id}`);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

/**
 * ✅ ดึงสินค้าของผู้ใช้ - ใช้ userId จาก token
 * GET /api/products/my-products
 */
export const getMyProducts = async (req, res) => {
  try {
    // ✅ CRITICAL: ใช้ userId จาก token
    const userId = req.user.uid;
    
    console.log(`📋 Fetching products for user: ${req.user.email} (${userId})`);
    
    const snapshot = await productsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${products.length} products for user ${userId}`);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Get my products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// 🔴 --- ส่วนที่หายไป (เพิ่มส่วนนี้) --- 🔴

/**
 * 🌎 ดึงสินค้าทั้งหมด (Public)
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const snapshot = await productsCollection
      .where('status', '==', 'available')
      .orderBy('createdAt', 'desc')
      .get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Get all products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

/**
 * 🌎 ดึงสินค้าชิ้นเดียว (Public)
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // (Optional) เพิ่ม logic นับ views
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('❌ Get product by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

/**
 * 🌎 ค้นหาสินค้า (Public)
 * GET /api/products/search
 */
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }
    
    const searchTerm = q.toLowerCase();
    
    const snapshot = await productsCollection
      .where('searchTerms', 'array-contains', searchTerm)
      .where('status', '==', 'available')
      .orderBy('createdAt', 'desc')
      .get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products'
    });
  }
};