const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Initialize Redis client
const initRedis = async () => {
  try {
    const redisConfig = {
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
      },
    };

    // Add password if provided
    if (process.env.REDIS_PASS) {
      redisConfig.password = process.env.REDIS_PASS;
    }

    redisClient = redis.createClient(redisConfig);

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
      isRedisConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.log('⚠️  Redis disconnected');
      isRedisConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.log('⚠️  Continuing without Redis caching...');
    return null;
  }
};

// Get cached data
const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

// Set cache with TTL
const setCache = async (key, value, ttl = 60) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

// Delete cache
const delCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
};

// Clear all cache (pattern-based)
const clearCache = async (pattern = '*') => {
  if (!isRedisConnected || !redisClient) {
    return false;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis CLEAR error:', error);
    return false;
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  clearCache,
  getClient: () => redisClient,
};
