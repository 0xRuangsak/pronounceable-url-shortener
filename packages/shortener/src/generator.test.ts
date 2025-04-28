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
      const result = generateShortcode();
      expect(typeof result).toBe("string");
    });

    test("should return a valid BIP39 word", () => {
      const result = generateShortcode();
      expect(WORDLIST.includes(result)).toBe(true);
    });

    test("should produce different results on multiple calls", () => {
      // This test could theoretically fail with a very small probability
      // if we randomly get the same word twice
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateShortcode());
      }
      // Should have at least 2 different results after 10 calls
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("generateUniqueShortcode", () => {
    test("should return a string", () => {
      const result = generateUniqueShortcode();
      expect(typeof result).toBe("string");
    });

    test("should not return a code that exists in the provided set", () => {
      const existingCodes = new Set(["abandon", "ability", "able"]);
      const result = generateUniqueShortcode(existingCodes);
      expect(existingCodes.has(result)).toBe(false);
    });

    test("should throw error if all possible codes are in use", () => {
      // Mock the WORDLIST to only have a few items
      const originalWordlist = [...WORDLIST];
      // @ts-ignore - Mocking private property
      WORDLIST.length = 3;

      // Create a set with all possible words
      const existingCodes = new Set(["abandon", "ability", "able"]);

      // Should throw an error when trying to generate a unique code
      expect(() => generateUniqueShortcode(existingCodes)).toThrow(
        "All possible shortcodes are already in use"
      );

      // Restore the original wordlist
      // @ts-ignore - Restoring private property
      WORDLIST.length = originalWordlist.length;
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
