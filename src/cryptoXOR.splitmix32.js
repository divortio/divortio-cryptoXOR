/**
 * @fileoverview SplitMix32 Stream Cipher Engine.
 * * **Role:** High-speed obfuscation engine (NOT for high-security secrets).
 * * **Algorithm:** SplitMix32 (32-bit State).
 * * **Performance:** ~800 MB/s. Extreme throughput via simple arithmetic.
 * * **Security Warning:** 32-bit state is vulnerable to brute-force attacks in < 1 second.
 * Use only for obfuscation, testing, or ephemeral session tokens.
 * * @module CryptoXOR_SplitMix32
 * @author CryptoXOR Team
 * @license MIT
 */

import CryptoXORBase from './cryptoXOR.base.js';

/**
 * SplitMix32 Stream Cipher.
 * An extremely fast generator with a 32-bit internal state.
 * @class
 * @extends CryptoXORBase
 */
class SplitMix32 extends CryptoXORBase {

    /**
     * Initializes the SplitMix32 Engine.
     * @param {string|Uint8Array} key - The secret key.
     * @param {Uint8Array|function(): Uint8Array} [ivOrStrategy] - IV or Generator.
     */
    constructor(key, ivOrStrategy) {
        super(key, ivOrStrategy);

        // --- SEEDING (Collapse to 32-bit) ---
        // Collapse Key + IV into a single 32-bit integer seed.
        // This is the bottleneck of security (2^32 possibilities).

        // [V8] Hint 'h' as Int32 immediately
        let h = (1779033703 ^ (this.keyBytes.length + this.iv.length)) | 0;

        for (let i = 0; i < this.keyBytes.length; i++) {
            h = Math.imul(h ^ this.keyBytes[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        for (let i = 0; i < this.iv.length; i++) {
            h = Math.imul(h ^ this.iv[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        // [V8] Ensure state is SMI (Small Integer)
        /** @private @type {number} */
        this.state = h | 0;
    }

    /**
     * Generates the next 32-bit integer in the keystream.
     * @returns {number} Signed 32-bit integer.
     */
    next() {
        // [V8] Load state to register
        let z = (this.state + 0x9E3779B9) | 0;
        this.state = z;

        // Mixer Logic (MurmurHash3 Finalizer)
        z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
        z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
        return (z ^ (z >>> 16)) | 0;
    }

    /**
     * Encrypts/Decrypts a buffer using XOR.
     * * **Optimization:** Inlined mixer logic and 4x loop unrolling.
     * * @param {Uint8Array} input - The data to process.
     * @returns {Uint8Array} A new buffer containing the result.
     */
    process(input) {
        const output = new Uint8Array(input);

        // Alignment Optimization
        if (output.byteOffset % 4 !== 0) return this._processUnaligned(output);

        // [V8] Typed View
        const buf32 = new Uint32Array(output.buffer, output.byteOffset, output.byteLength >> 2);
        const len32 = buf32.length | 0;

        // [V8] Localize State
        let state = this.state | 0;
        let z = 0 | 0;
        let i = 0 | 0;

        // --- HOT LOOP (4x Unrolled) ---
        // [V8] BCE: Strict limit calculation
        const limit = (len32 - 4) | 0;
        const GOLDEN_RATIO = 0x9E3779B9 | 0;

        // We inline the mixer logic to avoid function call overhead
        while (i <= limit) {
            // Op 1
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            buf32[i] ^= (z ^ (z >>> 16));

            // Op 2
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            buf32[i + 1] ^= (z ^ (z >>> 16));

            // Op 3
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            buf32[i + 2] ^= (z ^ (z >>> 16));

            // Op 4
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            buf32[i + 3] ^= (z ^ (z >>> 16));

            i = (i + 4) | 0;
        }

        // Remainder Loop (Integer Blocks)
        while (i < len32) {
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            buf32[i] ^= (z ^ (z >>> 16));
            i = (i + 1) | 0;
        }

        // [V8] Commit State
        this.state = state;

        // Final Bytes (0-3 bytes)
        const remainder = (output.length & 3) | 0;
        if (remainder > 0) {
            state = (state + GOLDEN_RATIO) | 0;
            z = state;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);

            this.state = state; // Save state

            let r = (z ^ (z >>> 16));
            let offset = (output.length - remainder) | 0;
            while(offset < output.length) {
                output[offset] ^= (r & 0xFF);
                r >>>= 8;
                offset = (offset + 1) | 0;
            }
        }

        return output;
    }
}

export default SplitMix32;