// firebase-functions/index.js
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import { logger } from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

// Set region to Singapore
setGlobalOptions({ region: "asia-southeast1" });

/**
 * --- FIX: Rewritten to V2 ESM syntax and to match the server's data model ---
 * * Trigger: Runs when a new message is created in any chat room.
 * Path: /chats/{roomId}/messages/{messageId}
 */
export const sendChatNotification = onDocumentCreated(
  "/chats/{roomId}/messages/{messageId}",
  async (event) => {
    
    // 1. Get the new message data
    const messageData = event.data?.data();
    if (!messageData) {
      logger.log("No message data found.");
      return null;
    }

    const { roomId } = event.params;
    const { senderId, text } = messageData;

    try {
      // 2. Get the chat room to find the recipient
      const roomRef = db.collection("chats").doc(roomId);
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) {
        logger.error(`Chat room not found: ${roomId}`);
        return null;
      }

      const roomData = roomDoc.data();
      const { buyerId, sellerId, productId } = roomData;

      // 3. Determine the recipient (the user who is NOT the sender)
      const recipientId = senderId === buyerId ? sellerId : buyerId;
      if (!recipientId) {
        logger.error("Could not determine recipient ID.");
        return null;
      }

      // 4. Get the sender's name from the 'users' collection
      const senderDoc = await db.collection("users").doc(senderId).get();
      const senderName = senderDoc.exists ? senderDoc.data().name : "ผู้ใช้";

      // 5. Get the post title from the 'products' collection
      let postTitle = "โพสต์ของคุณ";
      if (productId) {
        const productDoc = await db.collection("products").doc(productId).get();
        if (productDoc.exists) {
          postTitle = productDoc.data().title;
        }
      }

      // 6. Create the notification payload
      const notificationData = {
        userId: recipientId, // Send to the recipient
        type: "chat",
        title: `มีข้อความใหม่จาก ${senderName}`,
        message: `(เรื่อง: ${postTitle.substring(0, 30)}...): "${text.substring(0, 50)}..."`,
        link: `/chat`, // Link to the chat page
        read: false,
        createdAt: new Date().toISOString(),
      };

      // 7. Write the notification to the 'notifications' collection
      await db.collection("notifications").add(notificationData);
      
      logger.log(`Chat notification sent to ${recipientId} for room ${roomId}`);
      return null;

    } catch (error) {
      logger.error("Error sending chat notification:", error);
      return null;
    }
  }
);