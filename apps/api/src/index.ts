// apps/api/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { StorageProvider, RedisStorageProvider } from "@url-shortener/storage";
import { generateShortcode } from "@url-shortener/shortener";

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

    // Validate the storage provider is connected
    if (!storageProvider) {
      return res.status(500).json({ error: "Storage service unavailable" });
    }

    // Generate a unique shortcode
    let shortcode = "";
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    do {
      shortcode = generateShortcode(url, attempts > 0 ? `_${attempts}` : "");
      attempts++;
    } while (
      (await storageProvider.exists(shortcode)) &&
      attempts < MAX_ATTEMPTS
    );

    if (await storageProvider.exists(shortcode)) {
      return res
        .status(500)
        .json({ error: "Failed to generate a unique shortcode" });
    }

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

    // Validate the storage provider is connected
    if (!storageProvider) {
      return res.status(500).json({ error: "Storage service unavailable" });
    }

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
  // Check if Redis is connected
  const redisConnected = storageProvider !== undefined;

  return res.status(200).json({
    status: "OK",
    redis: redisConnected ? "connected" : "disconnected",
  });
});

// Initialize server
const initServer = async () => {
  try {
    // Initialize Redis storage provider with connection retry logic
    const maxRetries = 3;
    let connected = false;
    let retryCount = 0;

    while (!connected && retryCount < maxRetries) {
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
        connected = true;
        console.log("Connected to Redis");
      } catch (error) {
        retryCount++;
        console.error(
          `Failed to connect to Redis (attempt ${retryCount}/${maxRetries}):`,
          error
        );

        if (retryCount >= maxRetries) {
          console.error("Max retries reached, starting server without Redis");
          // We'll still start the server, but the health check will show Redis as disconnected
          // Storage-dependent operations will return appropriate errors
        } else {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    // Start server
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle process termination
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    function gracefulShutdown() {
      console.log("Received termination signal, shutting down gracefully...");
      server.close(async () => {
        try {
          if (storageProvider) {
            await storageProvider.disconnect();
            console.log("Disconnected from Redis");
          }
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
          process.exit(1);
        }
      });
    }
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

// Start server
initServer();

export default app; // Export for testing
