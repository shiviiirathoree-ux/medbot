const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { initializeSocket } = require('./src/socket/chat.socket');
const reminderService = require('./src/services/reminder.service');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');
const doctorRoutes = require('./src/routes/doctor.routes');
const medicineRoutes = require('./src/routes/medicine.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const diseaseRoutes = require('./src/routes/disease.routes');
const healthRoutes = require('./src/routes/health.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const emergencyRoutes = require('./src/routes/emergency.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket handlers
initializeSocket(io);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(globalLimiter);
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Attach io to request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Healthcare Chatbot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

// Start reminder cron jobs
reminderService.startReminderJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Healthcare Chatbot Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
