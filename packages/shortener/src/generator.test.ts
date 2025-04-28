/**
 * Tests for the URL shortcode generator
 */

import {
  generateShortcode,
  generateUniqueShortcode,
  isValidShortcode,
} from "./generator";
import { WORDLIST } from "./wordlist";

describe("URL Shortcode Generator", () => {
  describe("generateShortcode", () => {
    test("should return a string", () => {
      const result = generateShortcode("https://example.com");
      expect(typeof result).toBe("string");
    });

    test("should return a valid BIP39 word", () => {
      const result = generateShortcode("https://example.com");
      expect(WORDLIST.includes(result)).toBe(true);
    });

    test("should be deterministic for the same URL", () => {
      const url = "https://example.com";
      const result1 = generateShortcode(url);
      const result2 = generateShortcode(url);
      expect(result1).toBe(result2);
    });

    test("should generate different shortcodes for different URLs", () => {
      const result1 = generateShortcode("https://example.com");
      const result2 = generateShortcode("https://example.org");
      expect(result1).not.toBe(result2);
    });

    test("should use salt to generate different codes for the same URL", () => {
      const url = "https://example.com";
      const result1 = generateShortcode(url);
      const result2 = generateShortcode(url, "salt");
      expect(result1).not.toBe(result2);
    });
  });

  describe("generateUniqueShortcode", () => {
    test("should return a string", () => {
      const result = generateUniqueShortcode("https://example.com");
      expect(typeof result).toBe("string");
    });

    test("should not return a code that exists in the provided set", () => {
      // First, get the standard shortcode for the URL
      const standardCode = generateShortcode("https://example.com");

      // Then, try to generate a unique one with the standard code already in the set
      const existingCodes = new Set([standardCode]);
      const result = generateUniqueShortcode(
        "https://example.com",
        existingCodes
      );

      expect(existingCodes.has(result)).toBe(false);
    });

    test("should throw error if all possible codes are in use", () => {
      // Create a spy on the generateShortcode function to always return the same code
      const spy = jest.spyOn(global.Math, "abs").mockImplementation(() => 42);

      // This will make all calls to generateShortcode return the same word
      // Create a set with that word
      const testUrl = "https://example.com";
      const code = generateShortcode(testUrl);
      const existingCodes = new Set([code]);

      // Now, since our mock will keep returning the same code and we already have it
      // in our set, generateUniqueShortcode should eventually throw an error
      jest.spyOn(global, "Error");

      expect(() => {
        generateUniqueShortcode(testUrl, existingCodes);
      }).toThrow("Failed to generate a unique shortcode after many attempts");

      // Restore the original implementation
      spy.mockRestore();
    });
  });

  describe("isValidShortcode", () => {
    test("should return true for valid BIP39 words", () => {
      expect(isValidShortcode("abandon")).toBe(true);
      expect(isValidShortcode("zoo")).toBe(true);
    });

    test("should return false for invalid words", () => {
      expect(isValidShortcode("notaword")).toBe(false);
      expect(isValidShortcode("invalid123")).toBe(false);
    });

    test("should be case-insensitive", () => {
      expect(isValidShortcode("Abandon")).toBe(true);
      expect(isValidShortcode("ZOO")).toBe(true);
      expect(isValidShortcode("AbAnDoN")).toBe(true);
    });
  });
});
