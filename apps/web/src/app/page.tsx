/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { ENDPOINTS } from "@/config/api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    shortcode: string;
    originalUrl: string;
    shortUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    // Check if URL has protocol
    let formattedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`;
    }

    // Try to create URL object to validate
    try {
      new URL(formattedUrl);
    } catch (err) {
      setError("Please enter a valid URL");
      return;
    }

    // Clear previous results and errors
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch(ENDPOINTS.SHORTEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to shorten URL");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Could not connect to the shortening service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);

        // Reset copied status after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">
          Pronounceable URL Shortener
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create short, memorable URLs that people can actually pronounce!
        </p>

        <div className="w-full max-w-lg mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="url"
              >
                Enter a URL to shorten
              </label>
              <input
                className={`w-full px-4 py-2 border rounded-md ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                id="url"
                type="text"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-500 text-xs italic mt-2">{error}</p>
              )}
            </div>
            <div className="flex items-center justify-center">
              <button
                className={`px-4 py-2 font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Shortening..." : "Shorten URL"}
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="w-full max-w-lg mx-auto mt-8">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
              <h2 className="text-xl font-bold text-center mb-4">
                Your shortened URL
              </h2>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-gray-700 text-sm font-bold mr-2">
                    Short URL:
                  </span>
                  <div className="flex-1 flex items-center">
                    href={result.shortUrl}
                    target=&quot;_blank&quot; rel=&quot;noopener
                    noreferrer&quot; className=&quot;text-blue-600
                    hover:underline break-all mr-2&quot;
                    <a>{result.shortUrl}</a>
                    <button
                      onClick={handleCopy}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
                      aria-label="Copy to clipboard"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex mb-2">
                  <span className="text-gray-700 text-sm font-bold mr-2">
                    Shortcode:
                  </span>
                  <span className="font-mono">{result.shortcode}</span>
                </div>

                <div className="flex">
                  <span className="text-gray-700 text-sm font-bold mr-2">
                    Original URL:
                  </span>
                  <span className="break-all">{result.originalUrl}</span>
                </div>
              </div>

              <div
                className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-4"
                role="alert"
              >
                <p>This URL will expire after 24 hours.</p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setUrl("");
                    setResult(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Shorten Another URL
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Memorable</h3>
              <p className="text-gray-600">
                Our shortcodes are real words that are easy to remember and
                share.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Temporary</h3>
              <p className="text-gray-600">
                Links automatically expire after 24 hours for privacy and
                security.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Simple</h3>
              <p className="text-gray-600">
                No accounts needed, just paste your URL and get a shortcode
                instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
