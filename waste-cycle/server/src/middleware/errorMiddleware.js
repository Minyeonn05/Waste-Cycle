// server/src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // ตรวจสอบว่ามี status code ส่งมากับ error มั้ย, ถ้าไม่มีให้เป็น 500 (Internal Server Error)
  const statusCode = err.status || 500;

  // Log error เก็บไว้ดู (สำคัญมากตอน dev)
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // ส่ง JSON ตอบกลับไปหา Client
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    
    // เราจะส่ง stack trace กลับไปก็ต่อเมื่ออยู่ในโหมด development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;