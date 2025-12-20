import crypto from 'node:crypto';
// In Node.js (OpenSSL),the string 'aes128' is an alias that technically maps to CBC mode (Cipher Block Chaining)
// and thus requires a 16-byte IV.
// I have handled the IV padding to ensure
// it works interchangeably with your 12-byte nonces.

export class Aes128Node {
    /**
     * @param {Buffer|Uint8Array} key - 16 bytes (128-bit).
     * @param {Buffer|Uint8Array} nonce - 12 bytes (padded to 16 internally).
     */
    constructor(key, nonce) {
        // User requested standard 'aes128' (OpenSSL alias for AES-128-CBC)
        this.algorithm = 'aes128';
        this.key = key;

        // 'aes128' requires a 16-byte IV (Block Size).
        // If we receive a standard 12-byte nonce (common for Poly1305/GCM),
        // we must pad it to 16 bytes to avoid OpenSSL errors.
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(iv);
            iv = padded;
        }
        this.nonce = iv;

        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    /**
     * Encrypts a buffer.
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        return this.cipher.update(buffer);
    }
}