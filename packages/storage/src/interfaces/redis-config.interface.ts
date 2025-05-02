/**
 * Interface for Redis connection options
 */
export interface RedisConfig {
  /**
   * Redis server host
   * @default "localhost"
   */
  host?: string;

  /**
   * Redis server port
   * @default 6379
   */
  port?: number;

  /**
   * Redis database index
   * @default 0
   */
  db?: number;

  /**
   * Redis password, if authentication is required
   */
  password?: string;

  /**
   * Enable TLS/SSL connection
   * @default false
   */
  tls?: boolean;

  /**
   * Connection timeout in milliseconds
   * @default 5000
   */
  connectionTimeout?: number;

  /**
   * Prefix for all keys to avoid collisions
   * @default "urlshortener:"
   */
  keyPrefix?: string;

  /**
   * Default TTL for URL entries in seconds
   * @default 86400 (24 hours)
   */
  defaultTtl?: number;
}
