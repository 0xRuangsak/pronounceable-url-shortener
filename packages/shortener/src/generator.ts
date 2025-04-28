/**
 * BIP39-based URL shortcode generator
 */
import { WORDLIST } from "./wordlist";

/**
 * Generate a shortcode by hashing the input URL
 * @param url The URL to be shortened
 * @param salt Optional salt to add variation (can be used to handle collisions)
 * @returns A deterministic shortcode based on the input URL
 */
export function generateShortcode(url: string, salt: string = ""): string {
  const hash = hashString(url + salt);
  const index = Math.abs(hash) % WORDLIST.length;
  return WORDLIST[index];
}

/**
 * Generate a unique shortcode that doesn't exist in the provided set
 * @param url The URL to be shortened
 * @param existingCodes Set of codes that are already in use
 * @returns A new unique shortcode
 */
export function generateUniqueShortcode(
  url: string,
  existingCodes: Set<string> = new Set()
): string {
  // Safety check to prevent infinite loops
  if (existingCodes.size >= WORDLIST.length) {
    throw new Error("All possible shortcodes are already in use");
  }

  // Try with different salt values until we find a unique shortcode
  let salt = "";
  let attempt = 0;
  let shortcode: string;

  do {
    shortcode = generateShortcode(url, salt);
    // If we get a collision, change the salt and try again
    attempt++;
    salt = `_${attempt}`;
  } while (existingCodes.has(shortcode) && attempt < WORDLIST.length);

  // If we've tried too many times, there might be an issue with our hashing
  if (existingCodes.has(shortcode)) {
    throw new Error(
      "Failed to generate a unique shortcode after many attempts"
    );
  }

  return shortcode;
}

/**
 * Check if a word is a valid BIP39 word
 * @param word The word to check
 * @returns True if the word is in the BIP39 wordlist
 */
export function isValidShortcode(word: string): boolean {
  return WORDLIST.includes(word.toLowerCase());
}

/**
 * Simple string hashing function
 * @param str String to hash
 * @returns A numeric hash value
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
