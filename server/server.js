require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/shared/config/db');
const { connectRedis } = require('./src/shared/config/redis');
const { initializeSocket } = require('./src/shared/config/socket');
const logger = require('./src/shared/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    connectRedis();

    // Create HTTP Server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);

    // Start Server
    httpServer.listen(PORT, () => {
      logger.info(`
      ================================================
      🚀 Server running on port ${PORT}
      📍 Environment: ${process.env.NODE_ENV}
      🌐 API URL: http://localhost:${PORT}/api/v1
      ❤️  Health: http://localhost:${PORT}/health
      ================================================
      `);
    });

    // Graceful Shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();