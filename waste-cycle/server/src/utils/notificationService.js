// server/src/utils/notificationService.js
import { db } from '../config/firebaseConfig.js';

const notificationsCollection = db.collection('notifications');

/**
 * สร้างการแจ้งเตือนใหม่ใน Firestore
 * @param {string} userId - ID ของผู้ใช้ที่จะรับการแจ้งเตือน
 * @param {string} title - หัวข้อสั้นๆ
 * @param {string} message - ข้อความ
 * @param {string} [link] - (Optional) ลิงก์ในแอปที่จะพาไป (เช่น /bookings/123)
 * @param {string} [type] - (Optional) ประเภท (booking, match, admin)
 */
export const createNotification = async (userId, title, message, link = null, type = 'info') => {
  try {
    if (!userId) {
      throw new Error('User ID is required to create a notification');
    }

    const notificationData = {
      userId,     // ID ของคนที่จะเห็น
      title,      // หัวข้อ
      message,    // ข้อความ
      link,       // ลิงก์ (ถ้ามี)
      type,       // ประเภท
      read: false, // สถานะ "ยังไม่อ่าน"
      createdAt: new Date().toISOString()
    };

    await notificationsCollection.add(notificationData);
    console.log(`Notification created for user ${userId}: ${title}`);

  } catch (error) {
    // เราไม่ต้องการให้การแจ้งเตือนที่ล้มเหลว มาทำให้ API หลักล่ม
    console.error('Error creating notification:', error.message);
  }
};