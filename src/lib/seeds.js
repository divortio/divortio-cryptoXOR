/**
 * @fileoverview Universal Entropy Source for CryptoXOR.
 * * **Role:** Generates cryptographically strong pseudo-random data (CSPRNG)
 * for Initialization Vectors (IVs) and Key salts.
 * * **Compatibility:** Agnostic support for Node.js (via `node:crypto`)
 * and Modern Browsers (via `window.crypto.subtle`).
 * * @module CryptoXOR_Seeds
 * @author CryptoXOR Team
 * @license MIT
 */

/**
 * @typedef {Object} NodeCrypto
 * @property {function(number): Uint8Array} randomBytes - Node.js CSPRNG function.
 */

/**
 * @typedef {Object} WebCrypto
 * @property {function(ArrayBufferView): ArrayBufferView} getRandomValues - Browser CSPRNG function.
 */

// --- ENVIRONMENT DETECTION ---

// Detect Node.js environment
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

// Detect Web Crypto API
const isWebCrypto = typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function';

/** @type {NodeCrypto|null} */
let nodeCrypto = null;

if (isNode) {
    try {
        // Dynamic import for Node.js to avoid bundling issues in browsers
        // Using strict 'node:' protocol to ensure internal module usage
        // @ts-ignore
        nodeCrypto = await import('node:crypto');
    } catch (e) {
        // Fallback for older bundlers that dislike 'await import'
        // or environments where 'require' is polyfilled.
        try {
            // @ts-ignore
            nodeCrypto = require('crypto');
        } catch (e2) {
            console.warn("CryptoXOR: Node.js detected but 'crypto' module missing.");
        }
    }
}

/**
 * Static Utility Class for generating secure entropy.
 * Cannot be instantiated.
 */
class CryptoSeeds {

    /**
     * Prevent instantiation.
     * @private
     */
    constructor() {
        throw new Error("CryptoSeeds is a static utility and cannot be instantiated.");
    }

    /**
     * Generates a cryptographically secure Initialization Vector (IV) or random buffer.
     * * * **Node.js:** Uses `crypto.randomBytes()`.
     * * **Browser:** Uses `window.crypto.getRandomValues()`.
     * * **Fallback:** Throws error if no secure source is found (Fail-Safe).
     * * @param {number} [length=16] - The number of bytes to generate. Defaults to 16 bytes (128-bit).
     * @returns {Uint8Array} A populated buffer of secure random bytes.
     * @throws {Error} If no secure random number generator is accessible.
     */
    static secure(length = 16) {
        // 1. Input Validation
        if (length <= 0) {
            return new Uint8Array(0);
        }

        // 2. Browser / Web Standard Strategy
        if (isWebCrypto) {
            const buffer = new Uint8Array(length);
            crypto.getRandomValues(buffer);
            return buffer;
        }

        // 3. Node.js Strategy
        if (nodeCrypto && nodeCrypto.randomBytes) {
            // node:crypto returns a Buffer, we convert to Uint8Array for consistency
            const buffer = nodeCrypto.randomBytes(length);
            return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        }

        // 4. Fail-Safe (Do NOT fallback to Math.random)
        throw new Error("CryptoXOR Critical: No secure randomness source available. Context is insecure.");
    }

    /**
     * Generates a 32-bit unsigned integer seed (non-cryptographic use).
     * Useful for seeding non-secure variants like SplitMix32ECC for testing.
     * * @returns {number} A random 32-bit unsigned integer.
     */
    static random32() {
        // We still prefer CSPRNG for the source, even for a simple integer
        const bytes = CryptoSeeds.secure(4);
        const view = new DataView(bytes.buffer);
        return view.getUint32(0, true);
    }
}

export default CryptoSeeds;