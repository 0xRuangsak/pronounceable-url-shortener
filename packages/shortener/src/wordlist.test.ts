/**
 * Test for the BIP39 wordlist
 *
 * Verifies that our wordlist contains the expected number of words (2048)
 */

import { WORDLIST } from "./wordlist";

describe("BIP39 Wordlist", () => {
  test("should contain exactly 2048 words", () => {
    expect(WORDLIST.length).toBe(2048);
  });

  test("should have expected words at specific positions", () => {
    // Check beginning, middle, and end of list
    expect(WORDLIST[0]).toBe("abandon");
    expect(WORDLIST[Math.floor(WORDLIST.length / 2)]).toBe("length");
    expect(WORDLIST[WORDLIST.length - 1]).toBe("zoo");
  });

  test("should have all words in lowercase", () => {
    WORDLIST.forEach((word) => {
      expect(word).toBe(word.toLowerCase());
    });
  });

  test("should not have duplicate words", () => {
    const uniqueWords = new Set(WORDLIST);
    expect(uniqueWords.size).toBe(WORDLIST.length);
  });
});
