// server/src/controllers/wasteController.js
import { db } from '../config/firebaseConfig.js';

const wastesCollection = db.collection('wastes');

// ดึงข้อมูลมูลสัตว์ทั้งหมด
export const getAllWastes = async (req, res) => {
  try {
    const { limit = 20, status, type } = req.query;
    
    let query = wastesCollection.orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const wastes = [];
    
    snapshot.forEach(doc => {
      wastes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: wastes.length,
      data: wastes
    });
  } catch (error) {
    console.error('Get all wastes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wastes'
    });
  }
};

// ค้นหามูลสัตว์
export const searchWastes = async (req, res) => {
  try {
    const { q, location, minQuantity, maxQuantity } = req.query;
    
    let query = wastesCollection;
    
    // ค้นหาตามชื่อหรือประเภท (simple search)
    if (q) {
      query = query.where('searchTerms', 'array-contains', q.toLowerCase());
    }
    
    if (location) {
      query = query.where('location', '==', location);
    }
    
    const snapshot = await query.get();
    let results = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Filter by quantity range
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
    console.error('Search wastes error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};

// ดึงข้อมูลมูลสัตว์ตาม ID
export const getWasteById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await wastesCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Waste item not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get waste by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waste item'
    });
  }
};

// สร้างประกาศมูลสัตว์ใหม่
export const createWaste = async (req, res) => {
  try {
    const {
      type,
      quantity,
      unit,
      location,
      coordinates,
      description,
      price,
      contactInfo
    } = req.body;
    
    // Validation
    if (!type || !quantity || !location) {
      return res.status(400).json({
        success: false,
        error: 'Type, quantity, and location are required'
      });
    }
    
    const userId = req.user.uid; // จาก auth middleware
    
    // สร้าง search terms สำหรับการค้นหา
    const searchTerms = [
      type.toLowerCase(),
      location.toLowerCase(),
      ...type.toLowerCase().split(' '),
      ...location.toLowerCase().split(' ')
    ];
    
    const wasteData = {
      type,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      location,
      coordinates: coordinates || null,
      description: description || '',
      price: price ? parseFloat(price) : 0,
      contactInfo: contactInfo || {},
      userId,
      status: 'available',
      searchTerms,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await wastesCollection.add(wasteData);
    
    res.status(201).json({
      success: true,
      message: 'Waste item created successfully',
      data: {
        id: docRef.id,
        ...wasteData
      }
    });
  } catch (error) {
    console.error('Create waste error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create waste item'
    });
  }
};

// อัพเดตข้อมูลมูลสัตว์
export const updateWaste = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await wastesCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Waste item not found'
      });
    }
    
    // ตรวจสอบว่าเป็นเจ้าของหรือไม่
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this item'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // ลบฟิลด์ที่ไม่ควรแก้ไข
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.views;
    
    await wastesCollection.doc(id).update(updateData);
    
    const updatedDoc = await wastesCollection.doc(id).get();
    
    res.json({
      success: true,
      message: 'Waste item updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update waste error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update waste item'
    });
  }
};

// ลบประกาศมูลสัตว์
export const deleteWaste = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await wastesCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Waste item not found'
      });
    }
    
    // ตรวจสอบว่าเป็นเจ้าของหรือไม่
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this item'
      });
    }
    
    await wastesCollection.doc(id).delete();
    
    res.json({
      success: true,
      message: 'Waste item deleted successfully'
    });
  } catch (error) {
    console.error('Delete waste error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete waste item'
    });
  }
};