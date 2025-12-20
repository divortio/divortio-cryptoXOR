import crypto from 'node:crypto';
// Single DES (Legacy 56-bit security).
// Key Size: 8 bytes.
// IV Size: 8 bytes.
export class DesNode {
    /**
     * @param {Buffer|Uint8Array} key - 8 bytes.
     * @param {Buffer|Uint8Array} nonce - 12 bytes (truncated to 8).
     */
    constructor(key, nonce) {
        // 'des' usually maps to 'des-cbc'
        this.algorithm = 'des';
        this.key = key;

        // DES block size is 8 bytes.
        // The benchmark provides a 12-byte nonce; we must truncate it.
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