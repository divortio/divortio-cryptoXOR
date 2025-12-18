/**
 * @fileoverview Node.js Native Poly1305 (via ChaCha20-Poly1305).
 * **Role:** Compare V8 math vs C++ optimized assembly.
 * **Engine:** OpenSSL.
 */
import crypto from 'node:crypto';

export class Poly1305Node {
    /**
     * @param {Uint8Array} key - Must be 32 bytes.
     */
    constructor(key) {
        if (key.length !== 32) throw new Error("Poly1305: Key must be 32 bytes.");
        this.key = key;
        this.zeroIV = new Uint8Array(12);
    }

    /**
     * Processes message as AAD.
     * @param {Uint8Array} message
     * @returns {Uint8Array} 16-byte Tag
     */
    update(message) {
        // Poly1305 is usually coupled with ChaCha20 in OpenSSL
        const cipher = crypto.createCipheriv('chacha20-poly1305', this.key, this.zeroIV, {
            authTagLength: 16
        });

        cipher.setAAD(message);
        cipher.update('');
        cipher.final();

        return cipher.getAuthTag();
    }
}