import crypto from 'node:crypto';

export class Aes128CbcNode {
    /**
     * @param {Buffer|Uint8Array} key - 16 bytes (128-bit).
     * @param {Buffer|Uint8Array} nonce - 16 bytes (IV).
     */
    constructor(key, nonce) {
        // Explicitly use the standard name instead of the 'aes128' alias
        this.algorithm = 'aes-128-cbc';
        this.key = key;

        // AES-CBC requires a 16-byte IV.
        // If we receive a standard 12-byte nonce (common for GCM),
        // we pad it to 16 bytes to ensure compatibility.
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(iv.subarray(0, 16));
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