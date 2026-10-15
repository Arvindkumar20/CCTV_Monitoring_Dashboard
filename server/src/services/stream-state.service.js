// backend/services/stream-state.service.js

import Redis from "ioredis";

/**
 * StreamStateService - Distributed state management using Redis
 * Enables horizontal scaling across multiple server instances
 */
export class StreamStateService {
  constructor(options = {}) {
    this.redis = new Redis({
      host: options.host || process.env.REDIS_HOST || "localhost",
      port: options.port || process.env.REDIS_PORT || 6379,
      password: options.password || process.env.REDIS_PASSWORD,
      db: options.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.keyPrefix = options.keyPrefix || "camera:stream:";
    this.lockPrefix = "camera:lock:";
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.redis.on("connect", () => {
      console.log("✅ Redis connected");
    });

    this.redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
    });
  }

  /**
   * Get stream state
   */
  async getStreamState(cameraId) {
    const data = await this.redis.hgetall(`${this.keyPrefix}${cameraId}`);
    return Object.keys(data).length > 0 ? data : null;
  }

  /**
   * Set stream state
   */
  async setStreamState(cameraId, state) {
    const key = `${this.keyPrefix}${cameraId}`;
    const flatState = {};
    
    for (const [k, v] of Object.entries(state)) {
      flatState[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
    }

    await this.redis.hset(key, flatState);
    await this.redis.expire(key, 3600); // 1 hour TTL
  }

  /**
   * Delete stream state
   */
  async deleteStreamState(cameraId) {
    await this.redis.del(`${this.keyPrefix}${cameraId}`);
  }

  /**
   * Get all active streams
   */
  async getAllActiveStreams() {
    const keys = await this.redis.keys(`${this.keyPrefix}*`);
    const streams = [];

    for (const key of keys) {
      const cameraId = key.replace(this.keyPrefix, "");
      const state = await this.getStreamState(cameraId);
      if (state) {
        streams.push({ cameraId, ...state });
      }
    }

    return streams;
  }

  /**
   * Acquire lock for stream operation (prevents duplicate starts)
   */
  async acquireLock(cameraId, ttl = 30000) {
    const lockKey = `${this.lockPrefix}${cameraId}`;
    const lockValue = `${process.pid}-${Date.now()}`;
    
    const acquired = await this.redis.set(lockKey, lockValue, "PX", ttl, "NX");
    
    if (acquired) {
      return {
        release: async () => {
          const currentValue = await this.redis.get(lockKey);
          if (currentValue === lockValue) {
            await this.redis.del(lockKey);
          }
        },
      };
    }
    
    return null;
  }

  /**
   * Check if stream is active (any server)
   */
  async isStreamActive(cameraId) {
    const state = await this.getStreamState(cameraId);
    return state && state.status === "running";
  }

  /**
   * Get stream owner (which server is running it)
   */
  async getStreamOwner(cameraId) {
    const state = await this.getStreamState(cameraId);
    return state?.serverId || null;
  }

  /**
   * Register server
   */
  async registerServer(serverId, info) {
    await this.redis.hset(
      `camera:server:${serverId}`,
      {
        ...info,
        lastHeartbeat: Date.now(),
      }
    );
    await this.redis.expire(`camera:server:${serverId}`, 60);
  }

  /**
   * Get all registered servers
   */
  async getServers() {
    const keys = await this.redis.keys("camera:server:*");
    const servers = [];

    for (const key of keys) {
      const serverId = key.replace("camera:server:", "");
      const info = await this.redis.hgetall(key);
      servers.push({ serverId, ...info });
    }

    return servers;
  }

  /**
   * Close connection
   */
  async close() {
    await this.redis.quit();
  }
}

export default StreamStateService;