import crypto from 'node:crypto';

export class Rc4Node {
    /**
     * @param {Buffer|Uint8Array} key - Variable length.
     * @param {Buffer|Uint8Array} [nonce] - Ignored (RC4 does not support IVs natively).
     */
    constructor(key, nonce) {
        this.algorithm = 'rc4';
        this.key = key;

        // RC4 does not use an IV/Nonce. We pass an empty string/buffer.
        // Note: Some legacy protocols constructed a key by hashing Key+IV,
        // but the primitive itself takes only a Key.
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, '');
    }

    /**
     * Encrypts a buffer.
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        return this.cipher.update(buffer);
    }
}