// server/src/controllers/chatController.js
import { db } from '../config/firebaseConfig.js';
import asyncHandler from '../middleware/asyncHandler.js'; 

const wastesCollection = db.collection('wastes');
const chatRoomsCollection = db.collection('chat_rooms');

export const initiateChat = asyncHandler(async (req, res, next) => {
  const buyerId = req.user.uid; 
  const { postId } = req.body;

  if (!postId) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'กรุณาระบุ ID ของโพสต์' });
  }

  const postDoc = await wastesCollection.doc(postId).get();
  if (!postDoc.exists) {
    const error = new Error('Post not found'); // 👈 errorMiddleware จะแปลเป็นไทย
    error.status = 404;
    return next(error);
  }

  const postData = postDoc.data();
  const sellerId = postData.userId; 

  if (buyerId === sellerId) {
    // 🚨 [แก้ไข]
    return res.status(400).json({ success: false, error: 'คุณไม่สามารถแชตกับตัวเองได้' });
  }

  const participants = [buyerId, sellerId].sort();
  const roomId = `${participants[0]}_${participants[1]}_${postId}`;

  const roomRef = chatRoomsCollection.doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
    const newRoomData = {
      roomId: roomId,
      postId: postId,
      postTitle: postData.title, 
      participants: [buyerId, sellerId],
      participantInfo: {
        [buyerId]: { displayName: req.user.displayName || req.user.email },
        [sellerId]: { displayName: postData.farmName || 'ผู้ขาย' } // 🚨 [แก้ไข]
      },
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastTimestamp: null,
    };

    await roomRef.set(newRoomData);
    return res.status(201).json({ success: true, roomId: roomId, isNew: true });
  }

  return res.status(200).json({ success: true, roomId: roomDoc.id, isNew: false });
});