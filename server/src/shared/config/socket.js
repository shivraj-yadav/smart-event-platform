const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket Connected: ${socket.id}`);

    // Join user to personal room
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined personal room`);
    });

    // Join event room for real-time seat updates
    socket.on('join_event_room', (eventId) => {
      socket.join(`event_${eventId}`);
      logger.info(`Socket joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave_event_room', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.io Initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };