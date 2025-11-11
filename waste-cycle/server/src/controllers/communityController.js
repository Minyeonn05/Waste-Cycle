// server/src/controllers/communityController.js
import { db } from '../config/firebaseConfig.js';

const postsCollection = db.collection('community_posts');

// ดึงโพสต์ทั้งหมด
export const getAllPosts = async (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    
    let query = postsCollection.orderBy('createdAt', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const posts = [];
    
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

// ดึงโพสต์ตาม ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await postsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // เพิ่มยอดวิว
    await postsCollection.doc(id).update({
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
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
};

// สร้างโพสต์ใหม่
export const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags,
      images
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }
    
    const userId = req.user.uid;
    const userEmail = req.user.email;
    
    const postData = {
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      images: images || [],
      userId,
      author: {
        uid: userId,
        email: userEmail,
        displayName: req.user.displayName || 'Anonymous'
      },
      likes: [],
      comments: [],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await postsCollection.add(postData);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: docRef.id,
        ...postData
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
};

// อัพเดตโพสต์
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await postsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this post'
      });
    }
    
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
      message: 'Post updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
};

// ลบโพสต์
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await postsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this post'
      });
    }
    
    await postsCollection.doc(id).delete();
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};

// กดไลค์โพสต์
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await postsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    const likes = doc.data().likes || [];
    const hasLiked = likes.includes(userId);
    
    if (hasLiked) {
      // Unlike
      await postsCollection.doc(id).update({
        likes: likes.filter(uid => uid !== userId)
      });
    } else {
      // Like
      await postsCollection.doc(id).update({
        likes: [...likes, userId]
      });
    }
    
    const updatedDoc = await postsCollection.doc(id).get();
    
    res.json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      data: {
        id: updatedDoc.id,
        likes: updatedDoc.data().likes
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like/unlike post'
    });
  }
};

// แสดงความคิดเห็น
export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.uid;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }
    
    const doc = await postsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    const comment = {
      id: Date.now().toString(),
      text,
      userId,
      author: {
        uid: userId,
        email: req.user.email,
        displayName: req.user.displayName || 'Anonymous'
      },
      createdAt: new Date().toISOString()
    };
    
    const comments = doc.data().comments || [];
    comments.push(comment);
    
    await postsCollection.doc(id).update({ comments });
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Comment on post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
};