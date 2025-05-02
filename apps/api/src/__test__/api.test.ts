// apps/api/src/__test__/api.test.ts

import request from "supertest";

// Create a mock version of the StorageProvider interface
interface MockStorageProvider {
  connect: jest.Mock;
  disconnect: jest.Mock;
  storeUrl: jest.Mock;
  getUrl: jest.Mock;
  exists: jest.Mock;
  deleteUrl: jest.Mock;
}

// Mock the storage provider
const mockStorageProvider: MockStorageProvider = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  storeUrl: jest.fn().mockResolvedValue(true),
  getUrl: jest.fn(),
  exists: jest.fn().mockResolvedValue(false),
  deleteUrl: jest.fn().mockResolvedValue(true),
};

// Mock the shortener package with __esModule flag
jest.mock(
  "@url-shortener/shortener",
  () => ({
    __esModule: true,
    generateShortcode: jest.fn().mockImplementation(() => "testcode"),
  }),
  { virtual: true }
);

// Mock the storage package
jest.mock(
  "@url-shortener/storage",
  () => ({
    __esModule: true,
    RedisStorageProvider: jest.fn(() => mockStorageProvider),
    StorageProvider: {},
  }),
  { virtual: true }
);

// Mock environment variables
process.env.PORT = "3001";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";

// Import app after mocking dependencies
let app: any;

describe("URL Shortener API", () => {
  beforeAll(async () => {
    // Clear module cache to ensure mocks are applied
    jest.resetModules();

    // Directly patch the generateShortcode function to make sure it works
    const shortenerModule = require("@url-shortener/shortener");
    shortenerModule.generateShortcode = jest.fn().mockReturnValue("testcode");

    // Dynamically import the app after mocks are set up
    const appModule = await import("../index");
    app = appModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/shorten", () => {
    it("should shorten a URL with http protocol", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({ url: "http://example.com" })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("shortcode", "testcode");
      expect(response.body).toHaveProperty("originalUrl", "http://example.com");
      expect(response.body).toHaveProperty("shortUrl");
      expect(mockStorageProvider.storeUrl).toHaveBeenCalledWith(
        "testcode",
        "http://example.com"
      );
    });

    it("should return 400 if URL is not provided", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({})
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toHaveProperty("error", "URL is required");
      expect(mockStorageProvider.storeUrl).not.toHaveBeenCalled();
    });

    it("should handle storage errors gracefully", async () => {
      mockStorageProvider.storeUrl.mockRejectedValueOnce(
        new Error("Storage error")
      );

      const response = await request(app)
        .post("/api/shorten")
        .send({ url: "https://example.com" })
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toHaveProperty("error", "Failed to shorten URL");
    });
  });

  describe("GET /:shortcode", () => {
    it("should redirect to the original URL", async () => {
      mockStorageProvider.getUrl.mockResolvedValueOnce("https://example.com");

      const response = await request(app).get("/testcode").expect(302);

      expect(response.header.location).toBe("https://example.com");
      expect(mockStorageProvider.getUrl).toHaveBeenCalledWith("testcode");
    });

    it("should return 404 if shortcode is not found", async () => {
      mockStorageProvider.getUrl.mockResolvedValueOnce(null);

      const response = await request(app)
        .get("/nonexistent")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Short URL not found");
    });

    it("should handle storage errors gracefully", async () => {
      mockStorageProvider.getUrl.mockRejectedValueOnce(
        new Error("Storage error")
      );

      const response = await request(app)
        .get("/testcode")
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toHaveProperty("error", "Failed to redirect");
    });
  });

  describe("GET /api/health", () => {
    it("should return 200 OK", async () => {
      const response = await request(app)
        .get("/api/health")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("status", "OK");
    });
  });

  // Stop server after tests to prevent hanging
  afterAll(async () => {
    // Try to close any servers that might be open
    if (app && app.server && typeof app.server.close === "function") {
      app.server.close();
    }

    // Force Jest to exit after tests
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
});
