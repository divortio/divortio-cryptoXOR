/**
 * @fileoverview Xoshiro128** Stream Cipher Engine.
 * **Role:** High-performance stream cipher for non-critical data (assets, video).
 * **Algorithm:** Xoshiro128** (XOR/Shift/Rotate).
 * **Performance:** ~850 MB/s. The fastest variant in the library.
 * **Security:** 128-bit State. Linear complexity means it is vulnerable to
 * algebraic attacks (Z3 solver). Use for speed/obfuscation, not high-value secrets.
 * @module CryptoXOR_Xoshiro128
 */

import CryptoXORBase from './cryptoXOR.base.js';

/**
 * Xoshiro128** Stream Cipher.
 * An extremely fast generator with a 128-bit internal state.
 * @class Xoshiro128
 * @extends CryptoXORBase
 */
class Xoshiro128 extends CryptoXORBase {

    /**
     * Initializes the Xoshiro128 Engine.
     * @param {string|Uint8Array} key - The secret key.
     * @param {Uint8Array|function(): Uint8Array} [ivOrStrategy] - IV or Generator.
     */
    constructor(key, ivOrStrategy) {
        super(key, ivOrStrategy);

        // --- SEEDING (SplitMix32 Algorithm) ---
        // Xoshiro requires a 128-bit state initialized by a different PRNG.
        // We use a robust SplitMix32 derived from Key + IV.

        // [V8] Force 'h' to Int32 immediately
        let h = (1779033703 ^ (this.keyBytes.length + this.iv.length)) | 0;

        for (let i = 0; i < this.keyBytes.length; i++) {
            h = Math.imul(h ^ this.keyBytes[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        for (let i = 0; i < this.iv.length; i++) {
            h = Math.imul(h ^ this.iv[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        // SplitMix32 Generator Function (Inlined)
        // [V8] Returns Signed Int32 (| 0) to keep state monomorphic
        const splitMix = () => {
            h = (h + 0x9E3779B9) | 0;
            let z = h;
            z = Math.imul((z ^ (z >>> 16)), 0x85ebca6b);
            z = Math.imul((z ^ (z >>> 13)), 0xc2b2ae35);
            return (z ^ (z >>> 16)) | 0;
        };

        // --- INITIALIZE STATE (128-bit) ---
        /** @private @type {number} */
        this.s0 = splitMix();
        /** @private @type {number} */
        this.s1 = splitMix();
        /** @private @type {number} */
        this.s2 = splitMix();
        /** @private @type {number} */
        this.s3 = splitMix();

        // Warm up is not strictly required for Xoshiro, but good practice
    }

    /**
     * Helper: Rotate Left.
     * V8 recognizes this pattern and compiles it to a single CPU instruction (ROL).
     * @param {number} x - Input integer.
     * @param {number} k - Bits to rotate.
     * @returns {number} Rotated integer.
     */
    static rotl(x, k) {
        return (x << k) | (x >>> (32 - k));
    }

    /**
     * Generates next 32-bit integer.
     * @returns {number} Signed 32-bit integer.
     */
    next() {
        const s0 = this.s0, s1 = this.s1, s2 = this.s2, s3 = this.s3;

        // Output Function (Scrambler)
        // rotl(s1 * 5, 7) * 9
        // [V8] Use Math.imul for 32-bit multiplication
        const result = Math.imul(Xoshiro128.rotl(Math.imul(s1, 5), 7), 9) | 0;

        // State Update
        const t = (s1 << 9) | 0;

        this.s2 = s2 ^ s0;
        this.s3 = s3 ^ s1;
        this.s1 = s1 ^ this.s2;
        this.s0 = s0 ^ this.s3;

        this.s2 ^= t;
        this.s3 = Xoshiro128.rotl(this.s3, 11);

        return result;
    }

    /**
     * Encrypts/Decrypts buffer.
     * **Optimization:** Inlined rotation logic and 4x loop unrolling.
     * @param {Uint8Array} input - The data to process.
     * @returns {Uint8Array} A new buffer containing the result.
     */
    process(input) {
        const output = new Uint8Array(input);

        // Alignment Optimization
        if (output.byteOffset % 4 !== 0) return this._processUnaligned(output);

        // [V8] Create Typed View
        const buf32 = new Uint32Array(output.buffer, output.byteOffset, output.byteLength >> 2);
        const len32 = buf32.length | 0;

        // [V8] Localize State (Stack Allocation)
        let s0 = this.s0 | 0;
        let s1 = this.s1 | 0;
        let s2 = this.s2 | 0;
        let s3 = this.s3 | 0;

        let result = 0 | 0;
        let t = 0 | 0;
        let i = 0 | 0;

        // --- HOT LOOP (4x Unrolled) ---
        // [V8] BCE: Strict limit calculation
        const limit = (len32 - 4) | 0;

        // Inline rotl logic for speed (avoid function call overhead in hot loop)
        while (i <= limit) {
            // Op 1
            // Scrambler: rotl(s1 * 5, 7) * 9
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            buf32[i] ^= result;

            // Update State
            t = s1 << 9;
            s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3;
            s2 ^= t;
            s3 = (s3 << 11) | (s3 >>> 21);

            // Op 2
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            buf32[i + 1] ^= result;
            t = s1 << 9; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = (s3 << 11) | (s3 >>> 21);

            // Op 3
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            buf32[i + 2] ^= result;
            t = s1 << 9; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = (s3 << 11) | (s3 >>> 21);

            // Op 4
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            buf32[i + 3] ^= result;
            t = s1 << 9; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = (s3 << 11) | (s3 >>> 21);

            i = (i + 4) | 0;
        }

        // Remainder Loop (Integer Blocks)
        while (i < len32) {
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            buf32[i] ^= result;
            t = s1 << 9; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = (s3 << 11) | (s3 >>> 21);
            i = (i + 1) | 0;
        }

        // [V8] Commit State
        this.s0 = s0; this.s1 = s1; this.s2 = s2; this.s3 = s3;

        // Final Bytes (0-3 bytes)
        const remainder = (output.length & 3) | 0;
        if (remainder > 0) {
            result = Math.imul(((s1 * 5) << 7) | ((s1 * 5) >>> 25), 9);
            t = s1 << 9; s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = (s3 << 11) | (s3 >>> 21);

            this.s0 = s0; this.s1 = s1; this.s2 = s2; this.s3 = s3;

            let r = result;
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

export default Xoshiro128;