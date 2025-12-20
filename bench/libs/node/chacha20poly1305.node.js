import crypto from 'node:crypto';

export class ChaCha20Poly1305Node {
    /**
     * @param {Buffer|Uint8Array} key - 32 bytes (256-bit).
     * @param {Buffer|Uint8Array} nonce - 12 bytes.
     */
    constructor(key, nonce) {
        this.algorithm = 'chacha20-poly1305';
        this.key = key;
        this.nonce = nonce;

        // Create the cipher instance
        // Auth Tag Length defaults to 16 bytes, which is standard.
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce, {
            authTagLength: 16
        });
    }

    /**
     * Encrypts a buffer.
     * Note: Like GCM, this returns the ciphertext.
     * The Poly1305 tag is computed internally as data flows through.
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        return this.cipher.update(buffer);
    }
}