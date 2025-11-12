// server/src/controllers/productController.js
import { db } from '../config/firebaseConfig.js';
import { validateProduct } from '../utils/validation.js';

const productsCollection = db.collection('products');

// ดึงสินค้าทั้งหมด
export const getAllProducts = async (req, res) => {
  try {
    const { limit = 20, status, type } = req.query;
    
    let query = productsCollection.orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
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
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// สร้างสินค้าใหม่
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
    
    const userId = req.user.uid;
    
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
      type, // waste, fertilizer, plant_residue
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
      status: 'available', // available, reserved, sold
      searchTerms,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await productsCollection.add(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: docRef.id,
        ...productData
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// ดึงสินค้าตาม ID
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
    
    // เพิ่มยอดวิว
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
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

// อัพเดตสินค้า
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';
    
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // ตรวจสอบว่าเป็นเจ้าของหรือ admin
    if (doc.data().userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this product',
        message: 'Only the owner or admin can update this product'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // ลบฟิลด์ที่ไม่ควรแก้ไข
    delete updateData.userId;
    delete updateData.seller;
    delete updateData.createdAt;
    delete updateData.views;
    
    await productsCollection.doc(id).update(updateData);
    
    const updatedDoc = await productsCollection.doc(id).get();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// ลบสินค้า
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';
    
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // ตรวจสอบว่าเป็นเจ้าของหรือ admin
    if (doc.data().userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this product',
        message: 'Only the owner or admin can delete this product'
      });
    }
    
    await productsCollection.doc(id).delete();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// ค้นหาสินค้า
export const searchProducts = async (req, res) => {
  try {
    const { q, location, type, minQuantity, maxQuantity } = req.query;
    
    let query = productsCollection.where('status', '==', 'available');
    
    if (q) {
      query = query.where('searchTerms', 'array-contains', q.toLowerCase());
    }
    
    if (location) {
      query = query.where('location', '==', location);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    let results = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (minQuantity && data.quantity < parseInt(minQuantity)) return;
      if (maxQuantity && data.quantity > parseInt(maxQuantity)) return;
      
      results.push({
        id: doc.id,
        ...data
      });
    });
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};