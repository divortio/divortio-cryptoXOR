/**
 * @fileoverview Middleware class adding Legacy ECC (Jenkins Lookup3) support.
 * @module CryptoXOR_Base_ECC
 */

import CryptoXORBase from './cryptoXOR.base.js';
import { ECC } from './cryptoXOR.ecc.js';

export class CryptoXORECC extends CryptoXORBase {

    /**
     * Overrides encrypt to support options.ecc
     * Format: `[ IV | (Optional Hash) | Ciphertext ]`
     */
    encrypt(input, options = {}) {
        if (!options.ecc) {
            return super.encrypt(input);
        }

        // ECC Enabled Logic
        const sessionIV = new Uint8Array(16); // We usually generate random here in Base, but we need manual control
        // Actually, easiest way is to replicate the Base logic but wrap the specific 'process' call

        // Re-implementing specific orchestration for ECC:
        const iv = import('./cryptoXOR.seeds.js').then(m => m.default.secure());
        // Note: Imports inside methods are bad for sync code.
        // Better to rely on the fact that ECC.encryptWithChecksum takes a cipher instance.

        // Let's copy the logic cleanly:
        const sessionIV_ECC = new Uint8Array(16);
        crypto.getRandomValues(sessionIV_ECC); // Or CryptoSeeds.secure() if available in scope

        // @ts-ignore
        const sessionCipher = new this.constructor(this._storedKey, sessionIV_ECC);
        const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;

        // Delegate to ECC module
        const ciphertext = ECC.encryptWithChecksum(sessionCipher, bytes);

        const output = new Uint8Array(sessionIV_ECC.length + ciphertext.length);
        output.set(sessionIV_ECC, 0);
        output.set(ciphertext, sessionIV_ECC.length);

        return output;
    }

    /**
     * Overrides decrypt to support options.ecc
     */
    decrypt(input, options = {}) {
        if (!options.ecc) {
            return super.decrypt(input);
        }

        if (input.length < 16) throw new Error("CryptoXOR: Input too short.");

        const iv = input.slice(0, 16);
        const ciphertext = input.slice(16);

        // @ts-ignore
        const sessionCipher = new this.constructor(this._storedKey, iv);

        const decryptedBytes = ECC.decryptWithChecksum(sessionCipher, ciphertext);

        return new TextDecoder().decode(decryptedBytes);
    }
}

export default CryptoXORECC;