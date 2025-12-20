import crypto from 'node:crypto';

export class Rc4HmacMd5Node {
    /**
     * @param {Buffer|Uint8Array} key - 16 bytes.
     * @param {Buffer|Uint8Array} [nonce] - Ignored.
     */
    constructor(key, nonce) {
        this.algorithm = 'rc4-hmac-md5';
        this.key = key;

        // RC4 variants typically do not use an IV in this API.
        this.nonce = '';

        try {
            this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
        } catch (e) {
            throw new Error(`Algorithm '${this.algorithm}' failed to initialize. It may be missing in this Node.js version or requires the OpenSSL legacy provider.`);
        }
    }

    /**
     * Encrypts a buffer (and computes MD5 MAC internally).
     * @param {Buffer|Uint8Array} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        return this.cipher.update(buffer);
    }
}