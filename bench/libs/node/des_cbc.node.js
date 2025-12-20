import crypto from 'node:crypto';
// DES in Cipher Block Chaining mode.
// Key Size: 8 bytes (56-bit effective).
// IV Size: 8 bytes.

export class DesCbcNode {
    /**
     * @param {Buffer|Uint8Array} key - 8 bytes.
     * @param {Buffer|Uint8Array} nonce - 12 bytes (truncated to 8).
     */
    constructor(key, nonce) {
        this.algorithm = 'des-cbc';
        this.key = key;

        // DES-CBC requires an 8-byte IV.
        // Benchmark provides 12 bytes; we truncate or pad.
        let iv = nonce;
        if (iv.length > 8) {
            iv = iv.slice(0, 8);
        } else if (iv.length < 8) {
            const padded = new Uint8Array(8);
            padded.set(iv);
            iv = padded;
        }
        this.nonce = iv;

        try {
            this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
        } catch (e) {
            throw new Error(`Algorithm '${this.algorithm}' failed. It may require the OpenSSL legacy provider.`);
        }
    }

    process(buffer) {
        return this.cipher.update(buffer);
    }
}