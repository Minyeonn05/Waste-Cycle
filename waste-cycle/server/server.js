// server/src/server.js
import dotenv from 'dotenv';
dotenv.config();
// 🚨 1. รัน dotenv.config() เป็นอย่างแรกสุด! 🚨

import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorMiddleware.js';

// Import Routes
import wasteRoutes from './routes/wasteRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import fertilizerRoutes from './routes/fertilizerRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import productRoutes from './routes/productRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; 

// 🚨 2. ลบ dotenv.config(); (บรรทัดที่ 19 เดิม) ออกจากตรงนี้ 🚨
// (เพราะเราย้ายไปไว้ข้างบนสุดแล้ว)

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
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
app.use('/api/farms', farmRoutes); 
app.use('/api/products', productRoutes);
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