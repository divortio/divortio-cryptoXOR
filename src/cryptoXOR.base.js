/**
 * @fileoverview Base class for the CryptoXOR cipher suite.
 * Provides unified logic for Key normalization, IV resolution, and
 * optional ECC verification wrappers.
 * @module CryptoXOR_Base
 */

import CryptoSeeds from './cryptoXOR.seeds.js';
import { ECC } from './cryptoXOR.ecc.js';

/**
 * @typedef {Object} CipherOptions
 * @property {boolean} [ecc=false] - If true, appends/verifies a 32-bit FNV-1a checksum.
 */

/**
 * @typedef {Object} EncryptOptions
 * @property {boolean} [ecc=false] - If true, appends a 4-byte checksum to the payload.
 */

/**
 * @typedef {Object} DecryptOptions
 * @property {boolean} [ecc=false] - If true, extracts and verifies the 4-byte checksum.
 * @throws {Error} If checksum verification fails.
 */

/**
 * Abstract Base Class for Stream Ciphers.
 * Handles state initialization, IV strategies, and common utility methods.
 * @class
 */
class CryptoXORBase {

    /**
     * Initializes the Base Cipher.
     * @param {string|Uint8Array} key - The secret key. Strings are UTF-8 encoded.
     * @param {Uint8Array|function(): Uint8Array} [ivOrStrategy] -
     * A specific 16-byte IV, a generation function, or undefined (defaults to secure random).
     * @throws {Error} If the IV is not exactly 16 bytes.
     */
    constructor(key, ivOrStrategy) {
        // --- 1. RESOLVE IV STRATEGY ---
        if (ivOrStrategy === undefined) {
            this.iv = CryptoSeeds.secure();
        } else if (typeof ivOrStrategy === 'function') {
            this.iv = ivOrStrategy();
        } else if (ivOrStrategy instanceof Uint8Array) {
            this.iv = ivOrStrategy;
        } else {
            throw new Error("CryptoXOR: Invalid IV argument. Expected Uint8Array or Function.");
        }

        if (this.iv.length !== 16) {
            throw new Error(`CryptoXOR: IV must be exactly 16 bytes. Received ${this.iv.length}.`);
        }

        // --- 2. NORMALIZE KEY ---
        /** @type {Uint8Array} */
        this.keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;

        /** * Store original key for spawning session instances (encrypt/decrypt helpers).
         * @protected
         * @type {string|Uint8Array}
         */
        this._storedKey = key;
    }

    /**
     * Generates the next byte/word of the keystream.
     * Must be implemented by the child class (SFC32, Xoshiro, etc).
     * @abstract
     * @returns {number} The next 32-bit integer from the generator.
     */
    next() {
        throw new Error("CryptoXOR: next() must be implemented by the subclass.");
    }

    /**
     * Process a buffer of data.
     * Must be implemented by the child class for optimization.
     * @abstract
     * @param {Uint8Array} input
     * @returns {Uint8Array}
     */
    process(input) {
        throw new Error("CryptoXOR: process() must be implemented by the subclass.");
    }

    /**
     * Fallback processor for unaligned buffers.
     * Used when memory does not align to 4-byte boundaries.
     * @protected
     * @param {Uint8Array} output - The buffer to modify in-place.
     * @returns {Uint8Array} The processed buffer.
     */
    _processUnaligned(output) {
        for (let i = 0; i < output.length; i++) {
            // next() returns a 32-bit int; we mask to 8 bits
            output[i] ^= (this.next() & 0xFF);
        }
        return output;
    }

    /**
     * One-shot encryption helper.
     * Creates a fresh cipher instance, processes data, and prepends the IV.
     * **Format:** `[ IV (16 bytes) | (Optional Checksum 4 bytes) | Ciphertext ]`
     * @param {string|Uint8Array} input - The plaintext data.
     * @param {EncryptOptions} [options] - Configuration options.
     * @returns {Uint8Array} The encrypted payload containing the IV header.
     */
    encrypt(input, options = {}) {
        // 1. Prepare Session
        // Always generate a fresh, secure IV for one-shot operations
        const sessionIV = CryptoSeeds.secure();

        // @ts-ignore - 'constructor' refers to the Child Class (e.g. SFC32)
        const sessionCipher = new this.constructor(this._storedKey, sessionIV);

        // Normalize Input
        const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;

        let ciphertext;

        // 2. Handle ECC Logic
        if (options.ecc) {
            // Delegate to ECC module (Appends hash, then encrypts)
            // We pass 'sessionCipher' which holds the logic (SFC32) and state
            ciphertext = ECC.encryptWithChecksum(sessionCipher, bytes);
        } else {
            // Standard Processing
            ciphertext = sessionCipher.process(bytes);
        }

        // 3. Pack Output: [ IV | Ciphertext ]
        const output = new Uint8Array(sessionIV.length + ciphertext.length);
        output.set(sessionIV, 0);
        output.set(ciphertext, sessionIV.length);

        return output;
    }

    /**
     * One-shot decryption helper.
     * Extracts IV, initializes cipher, and decrypts (verifying ecc if requested).
     * @param {Uint8Array} input - The raw encrypted payload (must start with 16-byte IV).
     * @param {DecryptOptions} [options] - Configuration options.
     * @returns {string} The UTF-8 decoded plaintext.
     * @throws {Error} If input is too short or ECC check fails.
     */
    decrypt(input, options = {}) {
        if (input.length < 16) {
            throw new Error("CryptoXOR: Input too short. Missing IV.");
        }

        // 1. Parse Header
        const iv = input.slice(0, 16);
        const ciphertext = input.slice(16);

        // 2. Initialize Session
        // @ts-ignore
        const sessionCipher = new this.constructor(this._storedKey, iv);

        let decryptedBytes;

        // 3. Process & Verify
        if (options.ecc) {
            // Decrypts, extracts hash, compares, and returns ONLY data
            decryptedBytes = ECC.decryptWithChecksum(sessionCipher, ciphertext);
        } else {
            // Standard Decryption
            decryptedBytes = sessionCipher.process(ciphertext);
        }

        return new TextDecoder().decode(decryptedBytes);
    }
}

export default CryptoXORBase;