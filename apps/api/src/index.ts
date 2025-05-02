import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { StorageProvider, RedisStorageProvider } from "@url-shortener/storage";
import { generateUniqueShortcode } from "@url-shortener/shortener";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Initialize storage provider
let storageProvider: StorageProvider;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON requests

// Routes
// Shorten URL
app.post("/api/shorten", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Generate unique shortcode
    const shortcode = await generateUniqueShortcode(
      url,
      async (code) => await storageProvider.exists(code)
    );

    // Store URL with 24-hour expiration
    await storageProvider.storeUrl(shortcode, url);

    // Return shortcode
    return res.status(201).json({
      shortcode,
      originalUrl: url,
      shortUrl: `${req.protocol}://${req.get("host")}/${shortcode}`,
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    return res.status(500).json({ error: "Failed to shorten URL" });
  }
});

// Redirect to original URL
app.get("/:shortcode", async (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;

    // Get original URL
    const originalUrl = await storageProvider.getUrl(shortcode);

    if (!originalUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Redirect to original URL
    return res.redirect(originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ error: "Failed to redirect" });
  }
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  return res.status(200).json({ status: "OK" });
});

// Initialize server
const initServer = async () => {
  try {
    // Initialize Redis storage provider
    storageProvider = new RedisStorageProvider({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_KEY_PREFIX || "urlshortener:",
      defaultTtl: parseInt(process.env.DEFAULT_TTL || "86400"),
    });

    // Connect to Redis
    await storageProvider.connect();
    console.log("Connected to Redis");

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  try {
    await storageProvider.disconnect();
    console.log("Disconnected from Redis");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start server
initServer();

export default app; // Export for testing
