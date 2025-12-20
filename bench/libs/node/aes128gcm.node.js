import crypto from 'node:crypto';

export class Aes128GcmNode {
    /**
     * @param {Buffer|Uint8Array} key - 16 bytes (128-bit).
     * @param {Buffer|Uint8Array} nonce - 12 bytes.
     */
    constructor(key, nonce) {
        this.algorithm = 'aes-128-gcm';
        this.key = key;

        // AES-GCM natively supports 12-byte nonces.
        this.nonce = nonce;

        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    process(buffer) {
        // Returns ciphertext. Tag is calculated internally during updates.
        return this.cipher.update(buffer);
    }
}