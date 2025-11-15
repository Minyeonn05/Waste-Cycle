import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import farmRoutes from './src/routes/farmRoutes.js';
import fertilizerRoutes from './src/routes/fertilizerRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';
import matchingRoutes from './src/routes/matchingRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import wasteRoutes from './src/routes/wasteRoutes.js';
import visualizationRoutes from './src/routes/visualizationRoutes.js';
import analyzeRoutes from './src/routes/analyzeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Waste-Cycle API is running...');
});

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/visualization', visualizationRoutes);
app.use('/api/analyze', analyzeRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});