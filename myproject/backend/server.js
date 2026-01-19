import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './utils/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friend.js';
import groupRoutes from './routes/group.js';
import expenseRoutes from './routes/expense.js';
import paymentRoutes from './routes/payment.js';
import scannerRoutes from './routes/scanner.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notification.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notification', notificationRoutes);

// Socket.io setup for real-time features
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join-room', (groupId) => {
    socket.join(`group-${groupId}`);
  });

  socket.on('leave-room', (groupId) => {
    socket.leave(`group-${groupId}`);
  });

  socket.on('send-message', (data) => {
    io.to(`group-${data.groupId}`).emit('receive-message', data);
  });

  socket.on('expense-added', (data) => {
    io.to(`group-${data.groupId}`).emit('expense-updated', data);
  });

  socket.on('payment-made', (data) => {
    io.to(`group-${data.groupId}`).emit('balance-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
