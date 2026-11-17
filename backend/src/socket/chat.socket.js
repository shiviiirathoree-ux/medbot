const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const connectedUsers = new Map(); // userId -> socketId

exports.initializeSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name avatar');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    logger.info(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Notify user is online
    socket.emit('connected', { message: 'Connected to HealthBot', userId, socketId: socket.id });

    // Handle chat message via socket (real-time alternative to REST)
    socket.on('send_message', async (data) => {
      try {
        const { message, sessionId, language = 'en' } = data;
        if (!message?.trim()) return;

        socket.emit('typing', { isTyping: true });

        const aiService = require('../services/ai.service');
        let session = sessionId
          ? await ChatHistory.findOne({ sessionId, user: userId })
          : null;

        if (!session) {
          session = await ChatHistory.create({
            user: userId, sessionId: uuidv4(), language,
            messages: [], title: message.slice(0, 50),
          });
        }

        const history = session.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        const response = await aiService.getHealthResponse(message, history, socket.user);

        session.messages.push({ role: 'user', content: message, language });
        session.messages.push({ role: 'assistant', content: response, language });
        await session.save();

        socket.emit('typing', { isTyping: false });
        socket.emit('receive_message', {
          sessionId: session.sessionId, message: response,
          timestamp: new Date(), role: 'assistant',
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to process message' });
        logger.error(`Socket message error: ${error.message}`);
      }
    });

    // Typing indicator
    socket.on('typing_start', () => socket.broadcast.to(`user_${userId}`).emit('user_typing', { userId }));
    socket.on('typing_stop', () => socket.broadcast.to(`user_${userId}`).emit('user_stopped_typing', { userId }));

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      logger.info(`Socket disconnected: ${socket.user.name}`);
    });
  });

  logger.info('✅ Socket.io initialized');
};

exports.getConnectedUsers = () => connectedUsers;
