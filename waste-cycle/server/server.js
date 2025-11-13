// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 💡 FIX: แก้ไข Path ให้ชี้ไปที่โฟลเดอร์ src ทั้งหมด
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import farmRoutes from './src/routes/farmRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import matchingRoutes from './src/routes/matchingRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import fertilizerRoutes from './src/routes/fertilizerRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js'; 
import { rateLimitMiddleware } from './src/middleware/rateLimitMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware);

// Request logging
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/products', productRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/advisor', fertilizerRoutes);
app.use('/api/chats', chatRoutes); 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Waste-Cycle Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;