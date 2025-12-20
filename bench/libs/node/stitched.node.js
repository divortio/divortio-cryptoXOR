import crypto from 'node:crypto';
/*
Supports aes-128-cbc-hmac-sha1,
aes-256-cbc-hmac-sha1,
etc. Note: These algorithms often require specific key lengths (Encryption Key + HMAC Key concatenated).
However, Node.js crypto usually handles the key derivation or accepts a standard key length depending on the OpenSSL version.
This wrapper attempts to use them directly.
*
*/


export class StitchedCipherNode {
    /**
     * @param {string} algorithm - e.g., 'aes-128-cbc-hmac-sha1'
     * @param {Buffer|Uint8Array} key - Key bytes.
     * @param {Buffer|Uint8Array} nonce - IV bytes.
     */
    constructor(algorithm, key, nonce) {
        this.algorithm = algorithm;
        this.key = key;

        // Ensure IV is 16 bytes (CBC mode requirement)
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(iv.subarray(0, 16));
            iv = padded;
        }
        this.nonce = iv;

        try {
            this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
        } catch (e) {
            throw new Error(`Algorithm '${this.algorithm}' not supported or key length mismatch.`);
        }
    }

    process(buffer) {
        return this.cipher.update(buffer);
    }
}