// server/src/controllers/communityController.js

import asyncHandler from '../middleware/asyncHandler.js';
import admin, { db } from '../config/firebaseConfig.js';

// กำหนดประเภทสัตว์ที่อนุญาตให้โพสต์ได้ตามความต้องการ (หมู, ไก่, วัว)
const ALLOWED_ANIMAL_TYPES_VALUES = ['pig', 'chicken', 'cow'];

// Helper สำหรับคำนวณ NPK (Mock based on client's logic)
const calculateNPK = (animalType, feedType) => {
    const baseNPK = {
        chicken: { n: 3.2, p: 2.8, k: 1.5 },
        cow: { n: 2.5, p: 1.8, k: 2.1 },
        pig: { n: 3.8, p: 3.2, k: 2.4 },
    };
    // ในสถานการณ์จริง ควรใช้ feedType มาปรับค่า แต่ตอนนี้ใช้ค่า base ตาม animalType
    return baseNPK[animalType] || { n: 3.0, p: 2.5, k: 2.0 };
};

/**
 * @desc    Create a new community post
 * @route   POST /api/community/posts
 * @access  Private (Requires protect middleware)
 */
const createPost = asyncHandler(async (req, res) => {
    const { 
        title, 
        animalType, 
        wasteType, 
        quantity, 
        price, 
        unit, 
        location, 
        feedType, 
        description, 
        contactPhone,
        images, // Base64 strings from client
        npk // NPK calculated client-side
    } = req.body;
    const user = req.user; 

    // 1. Validation
    if (!title || !animalType || !wasteType || !quantity || !price || !unit || !location || !description || !contactPhone) {
        res.status(400);
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // 2. Animal Type Validation (Requirement #2)
    if (!ALLOWED_ANIMAL_TYPES_VALUES.includes(animalType)) {
        res.status(400);
        throw new Error(`ประเภทสัตว์ไม่ถูกต้อง ต้องเป็น: ${ALLOWED_ANIMAL_TYPES_VALUES.join(', ')} เท่านั้น`);
    }

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(price);

    if (isNaN(quantityNum) || quantityNum <= 0 || isNaN(priceNum) || priceNum < 0) {
        res.status(400);
        throw new Error('ปริมาณและราคาต้องเป็นตัวเลขที่ถูกต้อง');
    }
    
    // 3. Prepare Post Data (Requirement #1: Persistence)
    const newPost = {
        userId: user.id, // UID ของผู้โพสต์
        userName: user.name || user.farmName || user.email, 
        farmName: user.farmName || title,
        title,
        animalType,
        wasteType,
        quantity: quantityNum,
        price: priceNum,
        unit,
        location,
        feedType,
        description,
        contactPhone,
        images: images || [], // Save image Base64 strings (or upload URLs if using storage)
        npk: npk || calculateNPK(animalType, feedType), // ใช้ NPK จาก client หรือคำนวณใหม่
        distance: Math.random() * 20, // Mock distance
        verified: true,
        rating: 4.5, // Mock default values
        reviewCount: 10, // Mock default values
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 4. Save to Firestore
    const postRef = await db.collection('posts').add(newPost);
    const postDoc = await postRef.get();
    
    // 5. Response
    res.status(201).json({
        success: true,
        message: 'สร้างโพสต์สำเร็จ',
        post: {
            id: postDoc.id,
            ...postDoc.data()
        }
    });
});

/**
 * @desc    Get all community posts
 * @route   GET /api/community/posts
 * @access  Private (Requires protect middleware)
 */
const getPosts = asyncHandler(async (req, res) => {
    // ดึงโพสต์ทั้งหมด เรียงตามเวลาล่าสุด (Requirement #1: Viewable by all accounts)
    const postsSnapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure all fields expected by the client's Post type exist
            distance: data.distance || (Math.random() * 20),
            npk: data.npk || { n: 3.0, p: 2.5, k: 2.0 },
            rating: data.rating || 4.5,
            reviewCount: data.reviewCount || 10,
        };
    });

    res.status(200).json({
        success: true,
        count: posts.length,
        posts
    });
});

/**
 * @desc    Update a community post by ID
 * @route   PUT /api/community/posts/:id
 * @access  Private (Requires protect middleware)
 */
const updatePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const updateData = req.body;
    const user = req.user;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
        res.status(404);
        throw new Error('ไม่พบโพสต์ที่ต้องการแก้ไข');
    }
    
    // Authorization Check: ต้องเป็นเจ้าของโพสต์เท่านั้นที่แก้ไขได้
    if (postDoc.data().userId !== user.id) {
        res.status(403);
        throw new Error('ไม่ได้รับอนุญาตให้แก้ไขโพสต์นี้');
    }
    
    // Basic validation for numbers
    if (updateData.quantity && (isNaN(parseFloat(updateData.quantity)) || parseFloat(updateData.quantity) <= 0)) {
        res.status(400);
        throw new Error('ปริมาณต้องเป็นตัวเลขที่ถูกต้อง');
    }
    if (updateData.price && (isNaN(parseFloat(updateData.price)) || parseFloat(updateData.price) < 0)) {
        res.status(400);
        throw new Error('ราคาต้องเป็นตัวเลขที่ถูกต้อง');
    }
    if (updateData.animalType && !ALLOWED_ANIMAL_TYPES_VALUES.includes(updateData.animalType)) {
        res.status(400);
        throw new Error(`ประเภทสัตว์ไม่ถูกต้อง ต้องเป็น: ${ALLOWED_ANIMAL_TYPES_VALUES.join(', ')} เท่านั้น`);
    }

    // Perform update
    await postRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedDoc = await postRef.get();

    res.status(200).json({
        success: true,
        message: 'บันทึกการแก้ไขสำเร็จ',
        post: {
            id: updatedDoc.id,
            ...updatedDoc.data()
        }
    });
});

export { createPost, getPosts, updatePost };