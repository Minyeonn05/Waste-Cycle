// server/src/server.js
import dotenv from 'dotenv';
// 🚨 1. รัน dotenv.config() เป็นอย่างแรกสุด! 🚨
dotenv.config();

import express from 'express';
import cors from 'cors';
<<<<<<< Updated upstream
import errorHandler from './src/middleware/errorMiddleware.js';
=======
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import productRoutes from './routes/productRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import fertilizerRoutes from './routes/fertilizerRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';
>>>>>>> Stashed changes

// Import Routes
import wasteRoutes from './src/routes/wasteRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import fertilizerRoutes from './src/routes/fertilizerRoutes.js';
import matchingRoutes from './src/routes/matchingRoutes.js';
import farmRoutes from './src/routes/farmRoutes.js';
import productRoutes from './src/routes/productRoutes.js';

// 🚨 2. เพิ่ม import chatRoutes 🚨
import chatRoutes from './src/routes/chatRoutes.js'; 

// (ลบ dotenv.config() จากบรรทัดที่ 19 เดิม)

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... (Logging middleware - เหมือนเดิม) ...
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ... (Health check - เหมือนเดิม) ...
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Waste-Cycle API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/wastes', wasteRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/matching', matchingRoutes);

// 🚨 3. แก้ไข app.push เป็น app.use ครับ 🚨 (บรรทัดที่ 51 เดิม)
app.use('/api/farms', farmRoutes); 

app.use('/api/products', productRoutes);

// (บรรทัดที่ 53 เดิม)
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Waste-Cycle Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;