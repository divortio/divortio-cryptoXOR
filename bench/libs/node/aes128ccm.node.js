// AES-CCM (Counter with CBC-MAC).
// Comparability: Direct competitor to GCM and Chaskey-EtM.

import crypto from 'node:crypto';

export class Aes128CcmNode {
    constructor(key, nonce) {
        this.algorithm = 'aes-128-ccm';
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