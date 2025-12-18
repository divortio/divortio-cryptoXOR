/**
 * @fileoverview Node.js Native AES-GMAC (Galois Message Authentication Code).
 * **Role:** Hardware-accelerated integrity.
 * **Engine:** OpenSSL (AES-NI instructions).
 * **Warning:** Requires a 12-byte IV. For benchmarking, we use a Zero IV.
 * IN PRODUCTION, REUSING NONCE+KEY IS FATAL.
 */
import crypto from 'node:crypto';

export class AesGmacNode {
    /**
     * @param {Uint8Array} key - Must be 32 bytes (256-bit).
     */
    constructor(key) {
        if (key.length !== 32) throw new Error("AES-GMAC: Key must be 32 bytes.");
        this.key = key;
        this.zeroIV = new Uint8Array(12); // Benchmarking only
    }

    /**
     * Processes message as AAD (Additional Authenticated Data).
     * @param {Uint8Array} message
     * @returns {Uint8Array} 16-byte Tag
     */
    update(message) {
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, this.zeroIV);

        // GMAC Trick: No plaintext, everything is AAD.
        cipher.setAAD(message);
        cipher.update(''); // Process zero bytes of plaintext
        cipher.final();    // Commit

        return cipher.getAuthTag();
    }
}