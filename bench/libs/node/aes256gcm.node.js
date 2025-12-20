import crypto from 'node:crypto';

export class Aes256GcmNode {
    constructor(key, nonce) {
        this.algorithm = 'aes-256-gcm';
        this.key = key;

        // AES-GCM natively supports 12-byte nonces (standard).
        // No padding required if length is 12.
        this.nonce = nonce;

        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    process(buffer) {
        // Note: For GCM, update() returns ciphertext.
        // The Auth Tag is only available after final(), but for
        // pure throughput benchmarking of the encryption stream,
        // calling update() repeatedly is the correct measurement.
        return this.cipher.update(buffer);
    }
}