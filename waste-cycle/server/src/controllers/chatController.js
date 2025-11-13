// server/src/controllers/chatController.js
import { db } from '../config/firebaseConfig.js';

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const chatRoomsCollection = db.collection('chat_rooms');
const wastesCollection = db.collection('wastes');

// สร้างหรือดึงห้องแชต
export const initiateChat = async (req, res) => {
  try {
    const buyerId = req.user.uid; // ID ของผู้ซื้อ (คนที่กดแชต)
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    // 1. ค้นหาข้อมูลโพสต์เพื่อหา ID ผู้ขาย
    const postDoc = await wastesCollection.doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    const postData = postDoc.data();
    const sellerId = postData.userId;

    if (buyerId === sellerId) {
       return res.status(400).json({ success: false, error: 'Cannot chat with yourself' });
    }

    // 2. สร้าง ID ห้องแชตแบบเฉพาะตัว (เช่น buyerID_sellerID_postID)
    // การเรียงลำดับ ID ช่วยให้ค้นหาห้องเดิมเจอง่ายขึ้น
    const participants = [buyerId, sellerId].sort();
    const roomId = `${participants[0]}_${participants[1]}_${postId}`;
    
    const roomRef = chatRoomsCollection.doc(roomId);
    const roomDoc = await roomRef.get();

    // 3. ถ้าห้องยังไม่มี ให้สร้างใหม่
    if (!roomDoc.exists) {
      const newRoomData = {
        roomId: roomId,
        postId: postId,
        postTitle: postData.title,
        participants: [buyerId, sellerId],
        participantInfo: {
          [buyerId]: { displayName: req.user.displayName || req.user.email },
          [sellerId]: { displayName: postData.farmName || 'Seller' }
        },
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastTimestamp: null
      };
      
      await roomRef.set(newRoomData);
      
      return res.status(201).json({
        success: true,
        roomId: roomId,
        isNew: true
      });
    }

    // 4. ถ้าห้องมีอยู่แล้ว ก็ส่ง ID ห้องเดิมกลับไป
    return res.json({
=======
const chatsCollection = db.collection('chats');
const messagesCollection = db.collection('messages');
const usersCollection = db.collection('users');

/**
 * สร้างหรือดึง chat room
 * POST /api/chats
 */
export const createOrGetChatRoom = async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    const buyerId = req.user.uid;

    // Validation
    if (!productId || !sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and Seller ID are required'
      });
    }

=======
const chatsCollection = db.collection('chats');
const messagesCollection = db.collection('messages');
const usersCollection = db.collection('users');

/**
 * สร้างหรือดึง chat room
 * POST /api/chats
 */
export const createOrGetChatRoom = async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    const buyerId = req.user.uid;

    // Validation
    if (!productId || !sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and Seller ID are required'
      });
    }

>>>>>>> Stashed changes
    // ห้ามแชทกับตัวเอง
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot chat with yourself'
      });
    }

    // สร้าง unique chat ID
    const chatId = [buyerId, sellerId, productId].sort().join('_');

    // ตรวจสอบว่ามี chat อยู่แล้วหรือไม่
    const chatDoc = await chatsCollection.doc(chatId).get();

    if (chatDoc.exists) {
      // มี chat แล้ว ส่งกลับไป
      return res.json({
        success: true,
        data: {
          id: chatDoc.id,
          ...chatDoc.data()
        }
      });
    }

    // ดึงข้อมูล product และ users
    const [productDoc, buyerDoc, sellerDoc] = await Promise.all([
      db.collection('products').doc(productId).get(),
      usersCollection.doc(buyerId).get(),
      usersCollection.doc(sellerId).get()
    ]);

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!buyerDoc.exists || !sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const productData = productDoc.data();
    const buyerData = buyerDoc.data();
    const sellerData = sellerDoc.data();

    // สร้าง chat room ใหม่
    const chatData = {
      productId,
      product: {
        name: productData.name,
        type: productData.type,
        price: productData.price,
        images: productData.images?.[0] || null
      },
      buyerId,
      buyer: {
        uid: buyerId,
        displayName: buyerData.displayName,
        photoURL: buyerData.photoURL,
        email: buyerData.email
      },
      sellerId,
      seller: {
        uid: sellerId,
        displayName: sellerData.displayName,
        photoURL: sellerData.photoURL,
        email: sellerData.email
      },
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: {
        [buyerId]: 0,
        [sellerId]: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await chatsCollection.doc(chatId).set(chatData);

    res.status(201).json({
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      success: true,
      message: 'Chat room created',
      data: {
        id: chatId,
        ...chatData
      }
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat room'
    });
  }
};

/**
 * ดึงรายการ chats ของผู้ใช้
 * GET /api/chats
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.uid;

    // ดึง chats ที่เป็น buyer หรือ seller
    const [buyerChats, sellerChats] = await Promise.all([
      chatsCollection.where('buyerId', '==', userId).orderBy('updatedAt', 'desc').get(),
      chatsCollection.where('sellerId', '==', userId).orderBy('updatedAt', 'desc').get()
    ]);

    const chats = [];
    const chatIds = new Set();

    // รวม chats โดยไม่ซ้ำ
    [...buyerChats.docs, ...sellerChats.docs].forEach(doc => {
      if (!chatIds.has(doc.id)) {
        chatIds.add(doc.id);
        const data = doc.data();
        chats.push({
          id: doc.id,
          ...data,
          unreadCount: data.unreadCount?.[userId] || 0,
          otherUser: userId === data.buyerId ? data.seller : data.buyer
        });
      }
    });

    // เรียงตาม updatedAt
    chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    console.error('Initiate chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate chat session'
=======
=======
>>>>>>> Stashed changes
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
    });
  }
};

/**
 * ดึงข้อมูล chat room
 * GET /api/chats/:chatId
 */
export const getChatRoom = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';

    const chatDoc = await chatsCollection.doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const chatData = chatDoc.data();

    // ตรวจสอบสิทธิ์ (เฉพาะคนในแชทหรือ admin)
    if (userRole !== 'admin' && 
        chatData.buyerId !== userId && 
        chatData.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this chat'
      });
    }

    res.json({
      success: true,
      data: {
        id: chatDoc.id,
        ...chatData
      }
    });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat room'
    });
  }
};

/**
 * ส่งข้อความ
 * POST /api/chats/:chatId/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, imageUrl, type = 'text' } = req.body;
    const senderId = req.user.uid;

    // Validation
    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Message text or image is required'
      });
    }

    // ตรวจสอบ chat room
    const chatDoc = await chatsCollection.doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const chatData = chatDoc.data();

    // ตรวจสอบว่าเป็นคนในแชทหรือไม่
    if (chatData.buyerId !== senderId && chatData.sellerId !== senderId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to send message in this chat'
      });
    }

    // กำหนด receiverId
    const receiverId = senderId === chatData.buyerId ? chatData.sellerId : chatData.buyerId;

    // สร้างข้อความ
    const messageData = {
      chatId,
      senderId,
      receiverId,
      type, // text, image
      text: text || '',
      imageUrl: imageUrl || null,
      status: 'sent', // sent, delivered, read
      createdAt: new Date().toISOString()
    };

    const messageRef = await messagesCollection.add(messageData);

    // อัปเดต chat room
    const newUnreadCount = {
      ...chatData.unreadCount,
      [receiverId]: (chatData.unreadCount?.[receiverId] || 0) + 1
    };

    await chatsCollection.doc(chatId).update({
      lastMessage: text || '📷 Image',
      lastMessageAt: messageData.createdAt,
      unreadCount: newUnreadCount,
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: {
        id: messageRef.id,
        ...messageData
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

/**
 * ดึงข้อความในแชท
 * GET /api/chats/:chatId/messages
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';

    // ตรวจสอบ chat room
    const chatDoc = await chatsCollection.doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const chatData = chatDoc.data();

    // ตรวจสอบสิทธิ์
    if (userRole !== 'admin' && 
        chatData.buyerId !== userId && 
        chatData.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this chat'
      });
    }

    // ดึงข้อความ
    const messagesSnapshot = await messagesCollection
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // เรียงใหม่จากเก่า -> ใหม่
    messages.reverse();

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

/**
 * ทำเครื่องหมายว่าอ่านแล้ว
 * PUT /api/chats/:chatId/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;

    const chatDoc = await chatsCollection.doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const chatData = chatDoc.data();

    // ตรวจสอบสิทธิ์
    if (chatData.buyerId !== userId && chatData.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // รีเซ็ต unread count
    const newUnreadCount = {
      ...chatData.unreadCount,
      [userId]: 0
    };

    await chatsCollection.doc(chatId).update({
      unreadCount: newUnreadCount,
      updatedAt: new Date().toISOString()
    });

    // อัปเดตสถานะข้อความเป็น 'read'
    const unreadMessages = await messagesCollection
      .where('chatId', '==', chatId)
      .where('receiverId', '==', userId)
      .where('status', '!=', 'read')
      .get();

    const batch = db.batch();
    unreadMessages.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'read' });
    });
    await batch.commit();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as read'
    });
  }
};

/**
 * ลบแชท (Admin only หรือทั้ง 2 ฝ่ายยินยอม)
 * DELETE /api/chats/:chatId
 */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'user';

    const chatDoc = await chatsCollection.doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const chatData = chatDoc.data();

    // เฉพาะ admin หรือคนในแชท
    if (userRole !== 'admin' && 
        chatData.buyerId !== userId && 
        chatData.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this chat'
      });
    }

    // ลบข้อความทั้งหมดในแชท
    const messagesSnapshot = await messagesCollection
      .where('chatId', '==', chatId)
      .get();

    const batch = db.batch();
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // ลบ chat room
    await chatsCollection.doc(chatId).delete();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat'
    });
  }
};

/**
 * ⭐ ดึงแชททั้งหมด (Admin only)
 * GET /api/chats/admin/all
 */
export const getAllChats = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const snapshot = await chatsCollection
      .orderBy('updatedAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const chats = [];
    snapshot.forEach(doc => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    });
  }
};