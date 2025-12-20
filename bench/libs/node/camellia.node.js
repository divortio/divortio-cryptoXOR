import crypto from 'node:crypto';

export class CamelliaNode {
    /**
     * @param {string} bits - '128' or '256'
     * @param {Buffer|Uint8Array} key
     * @param {Buffer|Uint8Array} nonce
     */
    constructor(bits, key, nonce) {
        this.algorithm = `camellia-${bits}-cbc`;
        this.key = key;

        // Camellia-CBC requires 16-byte IV
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(iv.subarray(0, 16));
            iv = padded;
        }
        this.nonce = iv;

        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    process(buffer) {
        return this.cipher.update(buffer);
    }
}