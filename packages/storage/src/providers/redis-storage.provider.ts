// src/providers/redis-storage.provider.ts

import { StorageProvider } from "../interfaces/storage-provider.interface";
import { RedisConfig } from "../interfaces/redis-config.interface";
import Redis from "ioredis";

/**
 * Redis implementation of the StorageProvider interface
 */
export class RedisStorageProvider implements StorageProvider {
  private redis: Redis | null = null;
  private readonly config: RedisConfig;

  /**
   * Creates a new Redis storage provider
   * @param config Redis configuration options
   */
  constructor(config: RedisConfig) {
    this.config = {
      host: config.host || "localhost",
      port: config.port || 6379,
      db: config.db || 0,
      password: config.password,
      tls: config.tls || false,
      connectionTimeout: config.connectionTimeout || 5000,
      keyPrefix: config.keyPrefix || "urlshortener:",
      defaultTtl: config.defaultTtl || 86400, // 24 hours
    };
  }

  /**
   * Connects to the Redis server
   */
  async connect(): Promise<void> {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
        password: this.config.password,
        tls: this.config.tls ? {} : undefined,
        connectTimeout: this.config.connectionTimeout,
      });

      // Set up error handler
      this.redis.on("error", (err) => {
        console.error("Redis connection error:", err);
      });
    } catch (error) {
      // Rethrow any connection errors
      throw error;
    }
  }

  /**
   * Disconnects from the Redis server
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Stores a URL with an associated shortcode
   * @param shortcode The generated shortcode for the URL
   * @param originalUrl The original URL to be shortened
   * @param ttlSeconds Time-to-live in seconds (default: from config)
   * @returns Promise resolving to boolean indicating success
   */
  async storeUrl(
    shortcode: string,
    originalUrl: string,
    ttlSeconds?: number
  ): Promise<boolean> {
    if (!this.redis) {
      throw new Error("Not connected to Redis");
    }

    const key = `${this.config.keyPrefix}${shortcode}`;

    // Make sure ttl is a number by using nullish coalescing
    const ttl = ttlSeconds ?? this.config.defaultTtl ?? 86400;

    // Use the proper Redis command signature
    const result = await this.redis.set(key, originalUrl);

    if (result === "OK") {
      // Set expiration - ttl is guaranteed to be a number now
      await this.redis.expire(key, ttl);
    }

    return result === "OK";
  }

  /**
   * Retrieves the original URL associated with a shortcode
   * @param shortcode The shortcode to look up
   * @returns Promise resolving to the original URL or null if not found
   */
  async getUrl(shortcode: string): Promise<string | null> {
    if (!this.redis) {
      throw new Error("Not connected to Redis");
    }

    const key = `${this.config.keyPrefix}${shortcode}`;
    return await this.redis.get(key);
  }

  /**
   * Checks if a shortcode exists in the storage
   * @param shortcode The shortcode to check
   * @returns Promise resolving to boolean indicating if shortcode exists
   */
  async exists(shortcode: string): Promise<boolean> {
    if (!this.redis) {
      throw new Error("Not connected to Redis");
    }

    const key = `${this.config.keyPrefix}${shortcode}`;
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * Deletes a URL mapping from storage
   * @param shortcode The shortcode to delete
   * @returns Promise resolving to boolean indicating success
   */
  async deleteUrl(shortcode: string): Promise<boolean> {
    if (!this.redis) {
      throw new Error("Not connected to Redis");
    }

    const key = `${this.config.keyPrefix}${shortcode}`;
    const result = await this.redis.del(key);
    return result === 1;
  }
}
