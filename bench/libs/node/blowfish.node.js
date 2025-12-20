import crypto from 'node:crypto';

export class BlowfishNode {
    constructor(key, nonce) {
        this.algorithm = 'bf-cbc'; // Blowfish CBC
        this.key = key;

        // Blowfish has an 8-byte block size (64-bit).
        // IV must be 8 bytes.
        let iv = nonce;
        if (iv.length !== 8) {
            const padded = new Uint8Array(8);
            padded.set(iv.subarray(0, 8));
            iv = padded;
        }
        this.nonce = iv;

        // Note: Variable key length (up to 56 bytes). We typically use 16 (128-bit).
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    process(buffer) {
        return this.cipher.update(buffer);
    }
}