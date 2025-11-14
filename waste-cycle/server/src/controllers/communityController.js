// server/src/controllers/communityController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; 

const postsCollection = db.collection('community_posts');

// --- [เพิ่ม] Helper Function (ลดโค้ดซ้ำ) ---
const getPostAndCheckOwnership = async (postId, userId) => {
  const doc = await postsCollection.doc(postId).get();

  if (!doc.exists) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  if (doc.data().userId !== userId) {
    const error = new Error('Unauthorized to modify this post');
    error.status = 403;
    throw error;
  }

  return doc;
};


// ดึงโพสต์ทั้งหมด
export const getAllPosts = asyncHandler(async (req, res, next) => {
  const { limit = 20, category } = req.query;
  
  let query = postsCollection.orderBy('createdAt', 'desc');
  if (category) query = query.where('category', '==', category);
  query = query.limit(parseInt(limit));
  
  const snapshot = await query.get();
  const posts = [];
  snapshot.forEach(doc => {
    posts.push({ id: doc.id, ...doc.data() });
  });
  
  res.json({ success: true, count: posts.length, data: posts });
});

// ดึงโพสต์ตาม ID
export const getPostById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const doc = await postsCollection.doc(id).get();
  
  if (!doc.exists) {
    const error = new Error('Post not found');
    error.status = 404;
    return next(error);
  }
  
  await postsCollection.doc(id).update({
    views: (doc.data().views || 0) + 1
  });
  
  res.json({
    success: true,
    data: { id: doc.id, ...doc.data(), views: (doc.data().views || 0) + 1 }
  });
});

// สร้างโพสต์ใหม่
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, category, tags, images } = req.body;
  
  if (!title || !content) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุหัวข้อและเนื้อหา' });
  }
  
  const { uid, email, displayName } = req.user;
  
  const postData = {
    title, content,
    category: category || 'general',
    tags: tags || [],
    images: images || [],
    userId: uid,
    author: {
      uid: uid,
      email: email,
      displayName: displayName || 'Anonymous'
    },
    likes: [], comments: [], views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await postsCollection.add(postData);
  
  res.status(201).json({
    success: true,
    message: 'สร้างโพสต์สำเร็จ', // 🚨 [แก้ไข]
    data: { id: docRef.id, ...postData }
  });
});

// อัพเดตโพสต์
export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  await getPostAndCheckOwnership(id, req.user.uid);
  
  const updateData = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  delete updateData.userId;
  delete updateData.author;
  delete updateData.createdAt;
  delete updateData.likes;
  delete updateData.comments;
  
  await postsCollection.doc(id).update(updateData);
  const updatedDoc = await postsCollection.doc(id).get();
  
  res.json({
    success: true,
    message: 'อัปเดตโพสต์สำเร็จ', // 🚨 [แก้ไข]
    data: { id: updatedDoc.id, ...updatedDoc.data() }
  });
});

// ลบโพสต์
export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  await getPostAndCheckOwnership(id, req.user.uid);
  
  await postsCollection.doc(id).delete();
  
  res.json({
    success: true,
    message: 'ลบโพสต์สำเร็จ' // 🚨 [แก้ไข]
  });
});

// กดไลค์โพสต์
export const likePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.uid;
  
  const doc = await postsCollection.doc(id).get();
  if (!doc.exists) {
    const error = new Error('Post not found');
    error.status = 404;
    return next(error);
  }
  
  const likes = doc.data().likes || [];
  const hasLiked = likes.includes(userId);
  
  if (hasLiked) {
    await postsCollection.doc(id).update({
      likes: likes.filter(uid => uid !== userId)
    });
  } else {
    await postsCollection.doc(id).update({
      likes: [...likes, userId]
    });
  }
  
  const updatedDoc = await postsCollection.doc(id).get();
  
  res.json({
    success: true,
    message: hasLiked ? 'ยกเลิกถูกใจโพสต์' : 'ถูกใจโพสต์สำเร็จ', // 🚨 [แก้ไข]
    data: { id: updatedDoc.id, likes: updatedDoc.data().likes }
  });
});

// แสดงความคิดเห็น
export const commentOnPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;
  const { uid, email, displayName } = req.user;
  
  if (!text) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุข้อความคอมเมนต์' });
  }
  
  const doc = await postsCollection.doc(id).get();
  if (!doc.exists) {
    const error = new Error('Post not found');
    error.status = 404;
    return next(error);
  }
  
  const comment = {
    id: Date.now().toString(),
    text,
    userId: uid,
    author: {
      uid: uid,
      email: email,
      displayName: displayName || 'Anonymous'
    },
    createdAt: new Date().toISOString()
  };
  
  const comments = doc.data().comments || [];
  comments.push(comment);
  
  await postsCollection.doc(id).update({ comments });
  
  res.json({
    success: true,
    message: 'เพิ่มคอมเมนต์สำเร็จ', // 🚨 [แก้ไข]
    data: comment
  });
});