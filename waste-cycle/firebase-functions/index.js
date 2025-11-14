// firebase-functions/index.js
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// (ถ้าใช้ V2 ให้ uncomment 2 บรรทัดล่าง และ comment V1)
// import { onDocumentCreated } from "firebase-functions/v2/firestore";
// import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
const db = admin.firestore();

// (ถ้าต้องการระบุโซน เช่น สิงคโปร์ ให้ uncomment บรรทัดล่าง)
// setGlobalOptions({ region: "asia-southeast1" });

/**
 * Trigger: ทำงานเมื่อมีข้อความใหม่ถูกสร้างใน subcollection 'messages'
 * (นี่คือ Syntax V1 - ใช้งานง่ายที่สุด)
 */
export const sendChatNotification = functions.firestore
  .document('/chat_rooms/{roomId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    
    // 1. ดึงข้อมูลข้อความที่เพิ่งถูกส่งมา
    const messageData = snap.data();
    if (!messageData) {
      console.log('ไม่พบข้อมูลข้อความ');
      return null;
    }
    
    const roomId = context.params.roomId;
    const senderId = messageData.senderId;
    const senderName = messageData.senderName || 'ผู้ใช้';
    const messageText = messageData.text || '';

    try {
      // 2. ดึงข้อมูล "ห้องแชต" เพื่อหาว่า "ผู้รับ" คือใคร
      const roomRef = db.collection('chat_rooms').doc(roomId);
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) {
        console.log(`ไม่พบห้องแชต: ${roomId}`);
        return null;
      }

      const roomData = roomDoc.data();
      
      // 3. หา ID ของผู้รับ (คนที่ "ไม่ใช่" ผู้ส่ง)
      const recipientId = roomData.participants.find(id => id !== senderId);
      
      if (!recipientId) {
        console.log('ไม่พบผู้รับ');
        return null;
      }

      // 4. สร้าง Notification data
      const notificationData = {
        userId: recipientId, // 👈 ส่งหาผู้รับ
        title: `คุณมีข้อความใหม่!`,
        message: `${senderName} (เรื่อง: ${roomData.postTitle || '...'}): "${messageText.substring(0, 50)}..."`,
        link: `/bookings`, // 👈 (หรือ /chat ถ้าคุณมีหน้ารวมแชต)
        type: 'chat',
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // 5. เขียนการแจ้งเตือนนี้ลงใน Collection "notifications"
      await db.collection('notifications').add(notificationData);
      
      console.log(`ส่งแจ้งเตือนแชตให้ ${recipientId} สำหรับห้อง ${roomId} สำเร็จ`);
      return null;

    } catch (error) {
      console.error('ผิดพลาด! ไม่สามารถส่งแจ้งเตือนแชตได้:', error);
      return null;
    }
  });

/*
// --- (ตัวอย่างถ้าใช้ V2 Syntax) ---
export const sendchatnotification_v2 = onDocumentCreated(
  "/chat_rooms/{roomId}/messages/{messageId}", 
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return;
    }
    const messageData = snap.data();
    // ... (Logic เหมือน V1) ...
  }
);
*/