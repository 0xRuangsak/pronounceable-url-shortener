/**
 * Test for the BIP39 wordlist
 *
 * Verifies that our wordlist contains the expected number of words (2048)
 */

import { WORDLIST } from "./wordlist";

// Simple test to verify the wordlist length
console.log(`Wordlist length: ${WORDLIST.length}`);
console.log(`Is correct BIP39 length (2048): ${WORDLIST.length === 2048}`);

// Output a few sample words to verify content
console.log("Sample words:");
console.log(`First word: ${WORDLIST[0]}`);
console.log(`Middle word: ${WORDLIST[Math.floor(WORDLIST.length / 2)]}`);
console.log(`Last word: ${WORDLIST[WORDLIST.length - 1]}`);
