// AES-256-CCM (Counter with CBC-MAC).
// Comparability: High-security authenticated encryption. Slower than GCM.

import crypto from 'node:crypto';

export class Aes256CcmNode {
    /**
     * @param {Buffer|Uint8Array} key - 32 bytes (256-bit).
     * @param {Buffer|Uint8Array} nonce - 7 to 13 bytes (12 is standard).
     */
    constructor(key, nonce) {
        this.algorithm = 'aes-256-ccm';
        this.key = key;

        // CCM requires a nonce length between 7 and 13 bytes.
        // 12 bytes is standard.
        this.nonce = nonce;

        // CCM requires 'authTagLength' to be specified (usually 16).
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce, {
            authTagLength: 16
        });
    }

    process(buffer) {
        // CCM encrypts via update(). Tag is generated at final().
        return this.cipher.update(buffer);
    }
}