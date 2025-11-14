// server/src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // 🚨 [แก้ไข] แปลข้อความ Error ทั้งหมดเป็นภาษาไทย
  console.error('พบ Error:', err.name, err.message);
  console.error(err.stack);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  // --- จัดการ Firebase Auth Errors ---
  if (err.code) {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        statusCode = 401; // Unauthorized
        message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        break;
      case 'auth/email-already-exists':
      case 'auth/email-already-in-use':
        statusCode = 409; // Conflict
        message = 'อีเมลนี้มีผู้ใช้งานแล้ว';
        break;
      case 'auth/invalid-email':
        statusCode = 400; // Bad Request
        message = 'รูปแบบอีเมลไม่ถูกต้อง';
        break;
      case 'auth/weak-password':
        statusCode = 400; // Bad Request
        message = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        break;
      case 'auth/id-token-expired':
        statusCode = 401; // Unauthorized
        message = 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่';
        break;
      case 'auth/invalid-token':
        statusCode = 401; // Unauthorized
        message = 'Token ไม่ถูกต้อง';
        break;
    }
  }

  // --- จัดการ Transaction/Not Found Errors (ที่เราโยนเอง) ---
  // (แปลงจากภาษาอังกฤษที่เรา throw มา)
  if (message.includes('not found')) {
    statusCode = 404;
    if (message.includes('User')) message = 'ไม่พบผู้ใช้งาน';
    else if (message.includes('Product')) message = 'ไม่พบสินค้า';
    else if (message.includes('Farm')) message = 'ไม่พบฟาร์ม';
    else if (message.includes('Post')) message = 'ไม่พบโพสต์';
    else if (message.includes('Booking')) message = 'ไม่พบการจอง';
    else if (message.includes('Matching request')) message = 'ไม่พบคำขอจับคู่';
    else if (message.includes('Offer')) message = 'ไม่พบข้อเสนอ';
    else message = 'ไม่พบข้อมูลที่ร้องขอ';
  }
  
  if (message.includes('Unauthorized')) {
    statusCode = 403; // Forbidden
    message = 'คุณไม่มีสิทธิ์ดำเนินการนี้';
  }
  if (message.includes('Cannot book your own product')) {
    statusCode = 400;
    message = 'ไม่สามารถจองสินค้าของตัวเองได้';
  }
  if (message.includes('Insufficient quantity')) {
    statusCode = 400;
    message = 'สินค้ามีไม่เพียงพอ';
  }
  if (message.includes('is not available')) {
    statusCode = 400;
    message = 'สินค้าไม่พร้อมจำหน่าย';
  }


  res.status(statusCode).json({
    success: false,
    error: message, // 👈 ส่งข้อความภาษาไทยกลับไป
    code: err.code || null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;