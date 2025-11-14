// server/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import errorHandler from './src/middleware/errorMiddleware.js'; 

// Import Routes ทั้งหมด
import wasteRoutes from './src/routes/wasteRoutes.js'; 
import communityRoutes from './src/routes/communityRoutes.js'; 
import userRoutes from './src/routes/userRoutes.js'; 
import authRoutes from './src/routes/authRoutes.js'; 
import bookingRoutes from './src/routes/bookingRoutes.js'; 
import fertilizerRoutes from './src/routes/fertilizerRoutes.js'; 
import matchingRoutes from './src/routes/matchingRoutes.js'; 
import farmRoutes from './src/routes/farmRoutes.js'; 
import productRoutes from './src/routes/productRoutes.js'; 
import chatRoutes from './src/routes/chatRoutes.js'; 

// Routes ใหม่จาก API (ตามรูป)
import analyzeRoutes from './src/routes/analyzeRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';
import visualizationRoutes from './src/routes/visualizationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

// Route ใหม่สำหรับ Notification
import notificationRoutes from './src/routes/notificationRoutes.js';


const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Waste-Cycle API is running',
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------
// 🚀 API Routes (เชื่อมต่อทั้งหมด)
// ---------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// (API เดิม)
app.use('/api/wastes', wasteRoutes); // (ตัวนี้อาจจะ link ไปที่ productRoutes)
app.use('/api/products', productRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/farms', farmRoutes); 
app.use('/api/chat', chatRoutes); 

// (API ใหม่ตามรูป)
app.use('/api/analyze', analyzeRoutes);       // API-18
app.use('/api/market', marketRoutes);         // API-19, 20
app.use('/api/visualization', visualizationRoutes); // API-21
app.use('/api/admin', adminRoutes);           // API-22, 23, 24, 25

// (API ใหม่สำหรับแจ้งเตือน)
app.use('/api/notifications', notificationRoutes);


// 404 handler (ถ้าไม่เจอ Route ไหนเลย)
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling middleware (ตัวจัดการ Error กลาง)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Waste-Cycle Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;