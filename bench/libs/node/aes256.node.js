import crypto from 'node:crypto';

// Similar to the 128-bit version,
// 'aes256' in Node.js/OpenSSL is an alias for AES-256-CBC,
// which requires a 32-byte key and a 16-byte IV.

export class Aes256Node {
    /**
     * @param {Buffer|Uint8Array} key - 32 bytes (256-bit).
     * @param {Buffer|Uint8Array} nonce - 12 bytes (padded to 16 internally).
     */
    constructor(key, nonce) {
        // User requested standard 'aes256' (OpenSSL alias for AES-256-CBC)
        this.algorithm = 'aes256';
        this.key = key;

        // 'aes256' requires a 16-byte IV (Block Size).
        // We pad the standard 12-byte nonce to 16 bytes.
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