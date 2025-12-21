import crypto from 'node:crypto';

export class Aes256CbcNode {
    /**
     * @param {Buffer|Uint8Array} key - 32 bytes (256-bit).
     * @param {Buffer|Uint8Array} nonce - 16 bytes (IV).
     */
    constructor(key, nonce) {
        // Explicitly use the standard name instead of the 'aes256' alias
        this.algorithm = 'aes-256-cbc';
        this.key = key;

        // AES-CBC requires a 16-byte IV.
        // We pad/truncate if necessary to match the block size.
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