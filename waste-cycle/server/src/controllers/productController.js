// server/src/controllers/productController.js
import { db } from '../config/firebaseConfig.js';
import { validateProduct } from '../utils/validation.js';

// Handle mock mode - productsCollection might be null
const getProductsCollection = () => {
  if (!db) {
    console.warn('⚠️  Firestore not available in mock mode');
    return null;
  }
  return db.collection('products');
};

/**
 * ✅ สร้างสินค้าใหม่ - ใช้ userId จาก token เท่านั้น
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return success
    return res.status(201).json({
      success: true,
      message: 'Product created successfully (mock mode)',
      data: {
        id: Date.now().toString(),
        ...req.body,
        userId: req.user?.uid || req.user?.id || 'mock-user',
        createdAt: new Date().toISOString(),
      }
    });
  }
  
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
    
    // ❌ ห้าม: const userId = req.body.userId;
    // ❌ ห้าม: const userId = req.body.user?.uid;
    // ❌ ห้าม: const userId = req.query.userId;
    
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
        displayName: req.user.displayName
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
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return success
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully (mock mode)',
      data: {
        id: req.params.id,
        ...req.body,
      }
    });
  }
  
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
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return success
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully (mock mode)'
    });
  }
  
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
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return empty array
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
  
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

/**
 * ✅ ดึงสินค้าทั้งหมด
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return empty array
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
  
  try {
    const snapshot = await productsCollection
      .orderBy('createdAt', 'desc')
      .limit(50)
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
 * ✅ ดึงสินค้าตาม ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return mock product
    return res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        name: 'Mock Product',
        type: 'waste',
        quantity: 0,
        location: 'Mock Location',
      }
    });
  }
  
  try {
    const { id } = req.params;
    
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // เพิ่ม view count
    await productsCollection.doc(id).update({
      views: (doc.data().views || 0) + 1
    });
    
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
 * ✅ ค้นหาสินค้า
 * GET /api/products/search?q=keyword
 */
export const searchProducts = async (req, res) => {
  const productsCollection = getProductsCollection();
  if (!productsCollection) {
    // Mock mode - return empty array
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
  
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchTerm = q.toLowerCase().trim();
    const searchTerms = searchTerm.split(' ');
    
    // Search in multiple fields
    let snapshot;
    try {
      // Try to search using searchTerms array field
      snapshot = await productsCollection
        .where('searchTerms', 'array-contains-any', searchTerms)
        .limit(50)
        .get();
    } catch (error) {
      // If search fails, get all and filter client-side
      console.warn('Firestore search failed, using fallback:', error.message);
      snapshot = await productsCollection
        .limit(100)
        .get();
    }
    
    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const productText = [
        data.name,
        data.type,
        data.location,
        data.description
      ].join(' ').toLowerCase();
      
      // Filter if using fallback
      if (productText.includes(searchTerm) || searchTerms.some(term => productText.includes(term))) {
        products.push({
          id: doc.id,
          ...data
        });
      }
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