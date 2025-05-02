import { StorageProvider } from "../../interfaces/storage-provider.interface";

/**
 * Mock implementation of StorageProvider for testing
 */
class MockStorageProvider implements StorageProvider {
  private storage: Map<string, string> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    // Clear all timeouts to prevent memory leaks
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  async storeUrl(
    shortcode: string,
    originalUrl: string,
    ttlSeconds: number = 86400
  ): Promise<boolean> {
    if (!this.isConnected) throw new Error("Not connected to storage");

    this.storage.set(shortcode, originalUrl);

    // Clear any existing timeout for this shortcode
    if (this.timeouts.has(shortcode)) {
      clearTimeout(this.timeouts.get(shortcode)!);
    }

    // Set up TTL if specified
    if (ttlSeconds > 0) {
      const timeout = setTimeout(() => {
        this.storage.delete(shortcode);
        this.timeouts.delete(shortcode);
      }, ttlSeconds * 1000);

      this.timeouts.set(shortcode, timeout);
    }

    return true;
  }

  async getUrl(shortcode: string): Promise<string | null> {
    if (!this.isConnected) throw new Error("Not connected to storage");
    return this.storage.get(shortcode) || null;
  }

  async exists(shortcode: string): Promise<boolean> {
    if (!this.isConnected) throw new Error("Not connected to storage");
    return this.storage.has(shortcode);
  }

  async deleteUrl(shortcode: string): Promise<boolean> {
    if (!this.isConnected) throw new Error("Not connected to storage");

    if (!this.storage.has(shortcode)) return false;

    this.storage.delete(shortcode);

    if (this.timeouts.has(shortcode)) {
      clearTimeout(this.timeouts.get(shortcode)!);
      this.timeouts.delete(shortcode);
    }

    return true;
  }
}

describe("StorageProvider Interface", () => {
  let storageProvider: StorageProvider;

  beforeEach(async () => {
    storageProvider = new MockStorageProvider();
    await storageProvider.connect();
  });

  afterEach(async () => {
    await storageProvider.disconnect();
  });

  it("should store and retrieve a URL", async () => {
    const shortcode = "test123";
    const originalUrl = "https://example.com/very/long/url";

    await expect(
      storageProvider.storeUrl(shortcode, originalUrl)
    ).resolves.toBe(true);
    await expect(storageProvider.getUrl(shortcode)).resolves.toBe(originalUrl);
  });

  it("should check if a shortcode exists", async () => {
    const shortcode = "abc123";
    const originalUrl = "https://example.com/another/url";

    await expect(storageProvider.exists(shortcode)).resolves.toBe(false);
    await storageProvider.storeUrl(shortcode, originalUrl);
    await expect(storageProvider.exists(shortcode)).resolves.toBe(true);
  });

  it("should delete a URL", async () => {
    const shortcode = "delete123";
    const originalUrl = "https://example.com/to/be/deleted";

    await storageProvider.storeUrl(shortcode, originalUrl);
    await expect(storageProvider.exists(shortcode)).resolves.toBe(true);
    await expect(storageProvider.deleteUrl(shortcode)).resolves.toBe(true);
    await expect(storageProvider.exists(shortcode)).resolves.toBe(false);
    await expect(storageProvider.getUrl(shortcode)).resolves.toBe(null);
  });

  it("should handle TTL expiration", async () => {
    const shortcode = "expire123";
    const originalUrl = "https://example.com/will/expire";

    // Store URL with 0.1 second TTL
    await storageProvider.storeUrl(shortcode, originalUrl, 0.1);
    await expect(storageProvider.exists(shortcode)).resolves.toBe(true);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    await expect(storageProvider.exists(shortcode)).resolves.toBe(false);
    await expect(storageProvider.getUrl(shortcode)).resolves.toBe(null);
  });

  it("should return false when deleting non-existent URL", async () => {
    await expect(storageProvider.deleteUrl("nonexistent")).resolves.toBe(false);
  });

  it("should return null when getting non-existent URL", async () => {
    await expect(storageProvider.getUrl("nonexistent")).resolves.toBe(null);
  });
});
