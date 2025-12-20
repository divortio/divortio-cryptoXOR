import crypto from 'node:crypto';

export class ChaCha20Node {
    constructor(key, nonce) {
        this.algorithm = 'chacha20';

        this.key = typeof key === 'string' ? Buffer.from(key) : key;

        let iv = typeof nonce === 'string' ? Buffer.from(nonce) : nonce;

        // FIX: Node.js (OpenSSL) 'chacha20' expects a 16-byte IV.
        // It maps this to the internal state as: [Counter (4 bytes)] + [Nonce (12 bytes)].
        // Since our benchmark uses a standard 12-byte Nonce, we prepend 4 zero bytes
        // to act as the initial Counter.
        if (iv.length === 12) {
            const counter = Buffer.alloc(4, 0);
            iv = Buffer.concat([counter, iv]);
        }

        this.nonce = iv;

        // Create the native cipher instance
        this.cipher = crypto.createCipheriv(this.algorithm, this.key, this.nonce);
    }

    /**
     * Encrypts a buffer using Node's native OpenSSL bindings.
     * @param {Buffer} buffer
     * @returns {Buffer}
     */
    process(buffer) {
        // crypto.update() processes the chunk via C++ bindings
        return this.cipher.update(buffer);
    }
}