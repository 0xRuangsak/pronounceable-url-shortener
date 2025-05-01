// src/__tests__/providers/redis-storage.provider.test.ts

import { StorageProvider } from "../../interfaces/storage-provider.interface";
import { RedisConfig } from "../../interfaces/redis-config.interface";
import { RedisStorageProvider } from "../../providers/redis-storage.provider";

// Mock Redis client
jest.mock("ioredis", () => {
  const mockRedisInstance = {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn(),
    expire: jest.fn().mockResolvedValue(1), // Add the expire method
    exists: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue("OK"),
    on: jest.fn(),
  };

  // Return a constructor function that returns the mock instance
  return jest.fn(() => mockRedisInstance);
});

describe("RedisStorageProvider", () => {
  let storageProvider: StorageProvider;
  let mockRedis: any;

  const testConfig: RedisConfig = {
    host: "localhost",
    port: 6379,
    keyPrefix: "test:",
    defaultTtl: 86400,
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Get the mock Redis constructor
    const MockRedis = require("ioredis");

    // Create a new instance for each test
    storageProvider = new RedisStorageProvider(testConfig);
    await storageProvider.connect();

    // Get reference to the mocked Redis instance
    // This is the instance returned by the constructor
    mockRedis = MockRedis.mock.results[0].value;
  });

  afterEach(async () => {
    await storageProvider.disconnect();
  });

  describe("connect", () => {
    it("should establish a connection to Redis", async () => {
      const newProvider = new RedisStorageProvider(testConfig);
      await expect(newProvider.connect()).resolves.not.toThrow();
      await newProvider.disconnect();
    });

    it("should handle connection errors", async () => {
      // Force the Redis constructor to throw
      const MockRedis = require("ioredis");
      MockRedis.mockImplementationOnce(() => {
        throw new Error("Connection failed");
      });

      const newProvider = new RedisStorageProvider(testConfig);
      await expect(newProvider.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("storeUrl", () => {
    it("should store a URL with the default TTL", async () => {
      const shortcode = "abc123";
      const originalUrl = "https://example.com/long/url";

      await storageProvider.storeUrl(shortcode, originalUrl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}${shortcode}`,
        originalUrl
      );
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}${shortcode}`,
        testConfig.defaultTtl
      );
    });

    it("should store a URL with a custom TTL", async () => {
      const shortcode = "custom123";
      const originalUrl = "https://example.com/custom/ttl";
      const ttl = 3600; // 1 hour

      await storageProvider.storeUrl(shortcode, originalUrl, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}${shortcode}`,
        originalUrl
      );
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}${shortcode}`,
        ttl
      );
    });

    it("should handle errors when storing URLs", async () => {
      mockRedis.set.mockRejectedValueOnce(new Error("Storage error"));

      await expect(
        storageProvider.storeUrl("error", "https://example.com/error")
      ).rejects.toThrow("Storage error");
    });
  });

  describe("getUrl", () => {
    it("should retrieve a stored URL", async () => {
      const shortcode = "get123";
      const originalUrl = "https://example.com/get/url";

      mockRedis.get.mockResolvedValueOnce(originalUrl);

      const result = await storageProvider.getUrl(shortcode);

      expect(mockRedis.get).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}${shortcode}`
      );
      expect(result).toBe(originalUrl);
    });

    it("should return null for non-existent shortcodes", async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await storageProvider.getUrl("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors when retrieving URLs", async () => {
      mockRedis.get.mockRejectedValueOnce(new Error("Retrieval error"));

      await expect(storageProvider.getUrl("error")).rejects.toThrow(
        "Retrieval error"
      );
    });
  });

  describe("exists", () => {
    it("should return true for existing shortcodes", async () => {
      mockRedis.exists.mockResolvedValueOnce(1);

      const result = await storageProvider.exists("exists123");

      expect(mockRedis.exists).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}exists123`
      );
      expect(result).toBe(true);
    });

    it("should return false for non-existent shortcodes", async () => {
      mockRedis.exists.mockResolvedValueOnce(0);

      const result = await storageProvider.exists("nonexistent");

      expect(result).toBe(false);
    });

    it("should handle errors when checking existence", async () => {
      mockRedis.exists.mockRejectedValueOnce(new Error("Exists error"));

      await expect(storageProvider.exists("error")).rejects.toThrow(
        "Exists error"
      );
    });
  });

  describe("deleteUrl", () => {
    it("should delete existing shortcodes", async () => {
      mockRedis.del.mockResolvedValueOnce(1);

      const result = await storageProvider.deleteUrl("delete123");

      expect(mockRedis.del).toHaveBeenCalledWith(
        `${testConfig.keyPrefix}delete123`
      );
      expect(result).toBe(true);
    });

    it("should return false when deleting non-existent shortcodes", async () => {
      mockRedis.del.mockResolvedValueOnce(0);

      const result = await storageProvider.deleteUrl("nonexistent");

      expect(result).toBe(false);
    });

    it("should handle errors when deleting URLs", async () => {
      mockRedis.del.mockRejectedValueOnce(new Error("Delete error"));

      await expect(storageProvider.deleteUrl("error")).rejects.toThrow(
        "Delete error"
      );
    });
  });

  describe("disconnect", () => {
    it("should close the Redis connection", async () => {
      await storageProvider.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it("should handle errors when disconnecting", async () => {
      mockRedis.quit.mockRejectedValueOnce(new Error("Disconnect error"));

      await expect(storageProvider.disconnect()).rejects.toThrow(
        "Disconnect error"
      );
    });
  });
});
