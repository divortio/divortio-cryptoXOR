/**
 * @fileoverview SFC32ECC (Small Fast Counter) Stream Cipher Engine.
 * **Role:** The primary cryptographic engine for the library.
 * **Algorithm:** 128-bit Non-Linear State (SFC32ECC).
 * **Security:** Resists Z3/SAT solvers via mixed arithmetic (ADD/XOR/ROT).
 * **Performance:** Optimized for V8 JIT with Int32 hinting and 4x loop unrolling.
 * @module CryptoXOR_SFC32
 */


import CryptoXORECC from "./lib/base.ecc.js";


/**
 * @class
 * @extends {CryptoXORECC}
 */
class SFC32ECC extends CryptoXORECC {

    /**
     * Initializes the SFC32ECC Engine.
     * @param {string|Uint8Array} key - The secret key.
     * @param {Uint8Array|function(): Uint8Array} [ivOrStrategy] - IV or Generator.
     */
    constructor(key, ivOrStrategy) {
        super(key, ivOrStrategy);

        // --- SEEDING (SFC32ECC Specific Mix) ---
        // [V8] Hint 'h' as Int32 immediately to avoid Double allocation
        let h = (1779033703 ^ (this.keyBytes.length + this.iv.length)) | 0;

        // Mix Key
        for (let i = 0; i < this.keyBytes.length; i++) {
            h = Math.imul(h ^ this.keyBytes[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        // Mix IV
        for (let i = 0; i < this.iv.length; i++) {
            h = Math.imul(h ^ this.iv[i], 3432918353);
            h = (h << 13) | (h >>> 19);
        }

        // [V8] CRITICAL: Force return type to Signed Int32 (| 0).
        // If we use (>>> 0), V8 treats large numbers as Doubles.
        // Since our 'next()' function uses signed math, passing Doubles
        // causes an expensive "Representation Change" Deopt on first run.
        const getSeed32 = () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^ (h >>> 16)) | 0;
        };

        // --- INITIALIZE STATE (128-bit) ---
        // [V8] All state is now monomorphic Signed Int32.
        /** @private @type {number} */
        this.a = getSeed32();
        /** @private @type {number} */
        this.b = getSeed32();
        /** @private @type {number} */
        this.c = getSeed32();
        /** @private @type {number} */
        this.d = getSeed32();

        // --- WARM-UP ---
        // Discard first 20 rounds to mix state thoroughly and prevent low-bias attacks.
        for (let i = 0; i < 20; i++) this.next();
    }

    /**
     * Generates the next 32-bit integer in the keystream.
     * *Non-Linear Mix of Addition and XOR.*
     * @returns {number} Signed 32-bit integer.
     */
    next() {
        const a = this.a, b = this.b, c = this.c, d = this.d;

        // [V8] The "| 0" hints tell the JIT these are safe integer ops
        const t = (a + b | 0) + d | 0;

        this.d = (d + 1) | 0;
        this.a = b ^ (b >>> 9);
        this.b = (c + (c << 3)) | 0;
        this.c = (c << 21) | (c >>> 11);
        this.c = (this.c + t) | 0;

        return t | 0;
    }

    /**
     * Encrypts/Decrypts a buffer using XOR.
     * **Optimization:** Uses 4x Loop Unrolling, Pipelining, and Int32 Hinting.
     * @param {Uint8Array} input - The data to process.
     * @returns {Uint8Array} A new buffer containing the result.
     */
    process(input) {
        // [V8] Fast Allocation. Copying is unavoidable for safety.
        // We use constructor rather than slice() for consistency with Node Buffers.
        const output = new Uint8Array(input);

        // Alignment Check (V8 optimization)
        if (output.byteOffset % 4 !== 0) return this._processUnaligned(output);

        // [V8] Create a view directly on the memory.
        // Using '>> 2' (div 4) is faster than '/ 4'.
        const buf32 = new Uint32Array(output.buffer, output.byteOffset, output.byteLength >> 2);
        const len32 = buf32.length | 0; // [V8] Hint length as Int32

        // [V8] Localize state to registers (Stack Allocation)
        // Accessing 'this.a' repeatedly requires heap lookups.
        let a = this.a | 0;
        let b = this.b | 0;
        let c = this.c | 0;
        let d = this.d | 0;

        let t = 0 | 0;
        let i = 0 | 0; // [V8] Hint 'i' as SMI (Small Integer)

        // --- HOT LOOP (4x Unrolled) ---
        // [V8] Bounds Check Elimination (BCE):
        // By calculating 'limit' strictly, V8 can prove buf32[i+3] exists.
        const limit = (len32 - 4) | 0;

        while (i <= limit) {
            // Unroll 1
            t = (a + b | 0) + d | 0;
            buf32[i] ^= t;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;

            // Unroll 2
            t = (a + b | 0) + d | 0;
            buf32[i + 1] ^= t;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;

            // Unroll 3
            t = (a + b | 0) + d | 0;
            buf32[i + 2] ^= t;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;

            // Unroll 4
            t = (a + b | 0) + d | 0;
            buf32[i + 3] ^= t;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;

            i = (i + 4) | 0;
        }

        // Process remaining 32-bit blocks
        while (i < len32) {
            t = (a + b | 0) + d | 0;
            buf32[i] ^= t;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            i = (i + 1) | 0;
        }

        // [V8] Write Registers back to Heap
        this.a = a; this.b = b; this.c = c; this.d = d;

        // Process final bytes (remainder 0-3 bytes)
        const remainder = (output.length & 3) | 0;

        if (remainder > 0) {
            t = (a + b | 0) + d | 0;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;

            // Save state (since we advanced it)
            this.a = a; this.b = b; this.c = c; this.d = d;

            let r = t;
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

export default SFC32ECC;