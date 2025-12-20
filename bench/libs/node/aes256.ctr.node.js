import crypto from 'node:crypto';

export class Aes256CtrNode {
    /**
     * @param {Buffer|Uint8Array} key - 32 bytes (256-bit).
     * @param {Buffer|Uint8Array} nonce - 12 bytes (padded to 16 internally).
     */
    constructor(key, nonce) {
        this.algorithm = 'aes-256-ctr';

        this.key = key;

        // AES-CTR requires a 16-byte IV (Counter Block).
        // If we receive a standard 12-byte nonce, we pad it.
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(iv); // Copy nonce to start
            // Bytes 12-15 remain 0 (Initial Counter)
            iv = padded;
        }
        this.nonce = iv;

        // Create the cipher instance
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    /**
     * Encrypts a buffer using Node's native OpenSSL bindings.
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        // crypto.update() processes the chunk via C++ bindings
        return this.cipher.update(buffer);
    }
}