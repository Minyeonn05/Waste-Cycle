// server/src/controllers/chatController.js
import { db } from '../config/firebaseConfig.js';

// เราจะใช้ collection `wastes` เพื่อดึงข้อมูล post
const wastesCollection = db.collection('wastes');
const chatRoomsCollection = db.collection('chat_rooms');

/**
 * @desc    สร้างหรือดึงข้อมูลห้องแชต (Initiate Chat)
 * @route   POST /api/chat/initiate
 * @access  Private (ต้อง Login)
 */
export const initiateChat = async (req, res) => {
  try {
    const buyerId = req.user.uid; // ID ของผู้ซื้อ (จาก authMiddleware)
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    // 1. ค้นหา Post เพื่อเอา ID ผู้ขาย
    const postDoc = await wastesCollection.doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const postData = postDoc.data();
    const sellerId = postData.userId; // ID ของเจ้าของโพสต์ (ผู้ขาย)

    // 2. กันไม่ให้แชตกับตัวเอง
    if (buyerId === sellerId) {
      return res.status(400).json({ success: false, error: 'You cannot chat with yourself' });
    }

    // 3. สร้าง ID ห้องที่ไม่ซ้ำกัน
    const participants = [buyerId, sellerId].sort();
    const roomId = `${participants[0]}_${participants[1]}_${postId}`;

    const roomRef = chatRoomsCollection.doc(roomId);
    const roomDoc = await roomRef.get();

    // 4. ถ้าห้องยังไม่มี ให้สร้างใหม่
    if (!roomDoc.exists) {
      const newRoomData = {
        roomId: roomId,
        postId: postId,
        postTitle: postData.title, 
        participants: [buyerId, sellerId],
        participantInfo: {
          [buyerId]: { 
            displayName: req.user.displayName || req.user.email 
          },
          [sellerId]: { 
            displayName: postData.farmName || 'Seller' 
          }
        },
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastTimestamp: null,
      };

      await roomRef.set(newRoomData);

      return res.status(201).json({
        success: true,
        roomId: roomId,
        isNew: true
      });
    }

    // 5. ถ้าห้องมีอยู่แล้ว ก็ส่ง ID ห้องเดิมกลับไป
    return res.status(200).json({
      success: true,
      roomId: roomDoc.id,
      isNew: false
    });

  } catch (error) {
    console.error('Error initiating chat:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};