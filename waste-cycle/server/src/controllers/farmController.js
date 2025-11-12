// server/src/controllers/farmController.js
import { db } from '../config/firebaseConfig.js';
import { validateFarm } from '../utils/validation.js';

const farmsCollection = db.collection('farms');

// สร้างฟาร์มใหม่
export const createFarm = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      coordinates,
      area,
      description,
      images
    } = req.body;
    
    // Validation
    const validationErrors = validateFarm({ name, type, location, area });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    const userId = req.user.uid;
    
    const farmData = {
      name,
      type, // livestock หรือ crop
      location,
      coordinates: coordinates || null,
      area: area || 0,
      areaUnit: 'rai',
      description: description || '',
      images: images || [],
      userId,
      owner: {
        uid: userId,
        email: req.user.email,
        displayName: req.user.displayName
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await farmsCollection.add(farmData);
    
    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: {
        id: docRef.id,
        ...farmData
      }
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create farm'
    });
  }
};

// ดึงฟาร์มทั้งหมดของผู้ใช้
export const getUserFarms = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await farmsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const farms = [];
    snapshot.forEach(doc => {
      farms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    console.error('Get user farms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farms'
    });
  }
};

// ดึงฟาร์มตาม ID
export const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await farmsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found'
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
    console.error('Get farm by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farm'
    });
  }
};

// อัพเดตฟาร์ม
export const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await farmsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found'
      });
    }
    
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this farm'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    delete updateData.userId;
    delete updateData.owner;
    delete updateData.createdAt;
    
    await farmsCollection.doc(id).update(updateData);
    
    const updatedDoc = await farmsCollection.doc(id).get();
    
    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update farm'
    });
  }
};

// ลบฟาร์ม
export const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await farmsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Farm not found'
      });
    }
    
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this farm'
      });
    }
    
    await farmsCollection.doc(id).delete();
    
    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete farm'
    });
  }
};