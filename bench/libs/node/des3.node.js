import crypto from 'node:crypto';
// Triple DES (EDE3 mode).
// Key Size: 24 bytes (192 bits).
// IV Size: 8 bytes.

export class Des3Node {
    /**
     * @param {Buffer|Uint8Array} key - 24 bytes.
     * @param {Buffer|Uint8Array} nonce - 12 bytes (truncated to 8).
     */
    constructor(key, nonce) {
        // 'des3' usually maps to 'des-ede3-cbc'
        this.algorithm = 'des3';
        this.key = key;

        // 3DES block size is also 8 bytes.
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