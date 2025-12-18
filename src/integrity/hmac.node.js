/**
 * @fileoverview Node.js Native HMAC-SHA256 Wrapper.
 * **Role:** Benchmark Baseline.
 * **Engine:** OpenSSL (C++).
 */
import crypto from 'node:crypto';

export class HmacNode {
    /**
     * @param {Uint8Array} key - Any length (SHA256 hashes it if > blocksize).
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * Processes message and returns tag.
     * @param {Uint8Array} message
     * @returns {Uint8Array} 32-byte Tag (SHA256)
     */
    update(message) {
        // We create a fresh instance per message to match the "Stateless"
        // behavior of the pure JS primitives we wrote.
        return crypto.createHmac('sha256', this.key)
            .update(message)
            .digest();
    }
}