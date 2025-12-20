/**
 * @fileoverview Base class for Stream Ciphers (Pure).
 * **Role:** Handles Key normalization, IV resolution, and core process() contract.
 * **Note:** This base class contains NO Integrity/ECC logic.
 * @module CryptoXOR_Base
 */

import CryptoSeeds from './seeds.js';

export class CryptoXORBase {

    constructor(key, ivOrStrategy) {
        // --- 1. RESOLVE IV STRATEGY ---
        if (ivOrStrategy === undefined) {
            this.iv = CryptoSeeds.secure();
        } else if (typeof ivOrStrategy === 'function') {
            this.iv = ivOrStrategy();
        } else if (ivOrStrategy instanceof Uint8Array) {
            this.iv = ivOrStrategy;
        } else {
            throw new Error("CryptoXOR: Invalid IV argument. Expected Uint8Array or Function.");
        }

        if (this.iv.length !== 16) {
            throw new Error(`CryptoXOR: IV must be exactly 16 bytes. Received ${this.iv.length}.`);
        }

        // --- 2. NORMALIZE KEY ---
        this.keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;

        // Store for respawning instances
        this._storedKey = key;
    }

    // Abstract methods to be implemented by child
    next() { throw new Error("next() not implemented"); }
    process(input) { throw new Error("process() not implemented"); }

    _processUnaligned(output) {
        for (let i = 0; i < output.length; i++) {
            output[i] ^= (this.next() & 0xFF);
        }
        return output;
    }

    /**
     * Standard One-Shot Encryption (No Integrity).
     * Format: `[ IV (16B) | Ciphertext ]`
     */
    encrypt(input) {
        const sessionIV = CryptoSeeds.secure();
        // @ts-ignore
        const sessionCipher = new this.constructor(this._storedKey, sessionIV);

        const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
        const ciphertext = sessionCipher.process(bytes);

        const output = new Uint8Array(sessionIV.length + ciphertext.length);
        output.set(sessionIV, 0);
        output.set(ciphertext, sessionIV.length);

        return output;
    }

    /**
     * Standard One-Shot Decryption (No Integrity).
     */
    decrypt(input) {
        if (input.length < 16) throw new Error("CryptoXOR: Input too short. Missing IV.");

        const iv = input.slice(0, 16);
        const ciphertext = input.slice(16);

        // @ts-ignore
        const sessionCipher = new this.constructor(this._storedKey, iv);
        const decryptedBytes = sessionCipher.process(ciphertext);

        return new TextDecoder().decode(decryptedBytes);
    }
}

export default CryptoXORBase;