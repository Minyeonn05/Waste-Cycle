// server/src/controllers/chatController.js
import { db } from '../config/firebaseConfig.js';

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
      success: true,
      roomId: roomDoc.id,
      isNew: false
    });

  } catch (error) {
    console.error('Initiate chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate chat session'
    });
  }
};