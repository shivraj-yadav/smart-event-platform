const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis Connected Successfully');
    });

    redisClient.on('error', (err) => {
      logger.error(`❌ Redis Error: ${err.message}`);
    });

    redisClient.on('reconnecting', () => {
      logger.warn('⚠️ Redis Reconnecting...');
    });

    return redisClient;

  } catch (error) {
    logger.error(`❌ Redis Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };