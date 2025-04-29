// File: packages/storage/src/interfaces/storage-provider.interface.ts

/**
 * Interface defining the contract for URL shortener storage providers
 */
export interface StorageProvider {
  /**
   * Stores a URL with an associated shortcode
   * @param shortcode The generated shortcode for the URL
   * @param originalUrl The original URL to be shortened
   * @param ttlSeconds Time-to-live in seconds (default: 24 hours)
   * @returns Promise resolving to boolean indicating success
   */
  storeUrl(
    shortcode: string,
    originalUrl: string,
    ttlSeconds?: number
  ): Promise<boolean>;

  /**
   * Retrieves the original URL associated with a shortcode
   * @param shortcode The shortcode to look up
   * @returns Promise resolving to the original URL or null if not found
   */
  getUrl(shortcode: string): Promise<string | null>;

  /**
   * Checks if a shortcode exists in the storage
   * @param shortcode The shortcode to check
   * @returns Promise resolving to boolean indicating if shortcode exists
   */
  exists(shortcode: string): Promise<boolean>;

  /**
   * Deletes a URL mapping from storage
   * @param shortcode The shortcode to delete
   * @returns Promise resolving to boolean indicating success
   */
  deleteUrl(shortcode: string): Promise<boolean>;

  /**
   * Connects to the storage backend
   * @returns Promise resolving when connection is established
   */
  connect(): Promise<void>;

  /**
   * Disconnects from the storage backend
   * @returns Promise resolving when disconnection is complete
   */
  disconnect(): Promise<void>;
}
