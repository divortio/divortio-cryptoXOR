/**
 * @fileoverview SFC32 Cipher with Chaskey Integrity.
 * **Variant:** Standalone (Extends CryptoXORBase directly).
 * **Cipher:** SFC32 (128-bit State).
 * **Integrity:** Chaskey-12 (128-bit MAC).
 * **Architecture:** Encrypt-then-MAC (EtM).
 * @module CryptoXOR_SFC32_Chaskey
 */

import CryptoXORBase from './lib/base.js';
import { Chaskey } from './integrity/chaskey.js';
import CryptoSeeds from './lib/seeds.js';
// Used solely for KDF (Key Derivation), not inheritance
import SFC32 from './cryptoXOR.sfc32.js';

export class SFC32Chaskey extends CryptoXORBase {

    /**
     * Initializes the SFC32 Engine with Integrated Chaskey MAC.
     * @param {string|Uint8Array} key - Master Key.
     * @param {Uint8Array|function(): Uint8Array} [ivOrStrategy] - IV or Generator.
     */
    constructor(key, ivOrStrategy) {
        super(key, ivOrStrategy);

        // --- 1. KEY DERIVATION ---
        // Derive independent keys for Cipher and MAC to prevent interaction faults.
        this.macKey = SFC32Chaskey.deriveMacKey(this.keyBytes);

        // --- 2. SFC32 SEEDING ---
        // (Replicated from SFC32 for standalone performance)
        // [V8] Hint 'h' as Int32 immediately
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

        const getSeed32 = () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^ (h >>> 16)) | 0;
        };

        // --- 3. INITIALIZE STATE (128-bit) ---
        this.a = getSeed32();
        this.b = getSeed32();
        this.c = getSeed32();
        this.d = getSeed32();

        // Warm-up (20 rounds)
        for (let i = 0; i < 20; i++) this.next();
    }

    /**
     * Static helper to derive a MAC key from a Master Key.
     * Exposed so the Stream class can use it without instantiating a full cipher.
     * @param {Uint8Array} masterKey
     * @returns {Uint8Array} 16-byte MAC Key
     */
    static deriveMacKey(masterKey) {
        // Use SFC32 with Zero-IV as a KDF
        const kdf = new SFC32(masterKey, new Uint8Array(16));
        const derived = new Uint8Array(16);
        // We use the 'process' method on a zero buffer or 'next' calls?
        // SFC32.stream() isn't on the class instance in all versions,
        // but 'process' is. Let's use 'process' on 16 null bytes to generate keystream.
        // Or better: manually call next().

        // Actually, CryptoXORBase children usually implement a 'stream' or 'process' method.
        // To be safe and standard:
        const zeros = new Uint8Array(16);
        return kdf.process(zeros);
    }

    /**
     * Generates next 32-bit integer (Standard SFC32).
     * @returns {number}
     */
    next() {
        const a = this.a, b = this.b, c = this.c, d = this.d;
        const t = (a + b | 0) + d | 0;
        this.d = (d + 1) | 0;
        this.a = b ^ (b >>> 9);
        this.b = (c + (c << 3)) | 0;
        this.c = (c << 21) | (c >>> 11);
        this.c = (this.c + t) | 0;
        return t | 0;
    }

    /**
     * Fast Process Block (Standard SFC32 Optimized).
     * @param {Uint8Array} input
     * @returns {Uint8Array}
     */
    process(input) {
        const output = new Uint8Array(input);
        if (output.byteOffset % 4 !== 0) return this._processUnaligned(output);

        const buf32 = new Uint32Array(output.buffer, output.byteOffset, output.byteLength >> 2);
        const len32 = buf32.length | 0;

        let a = this.a | 0, b = this.b | 0, c = this.c | 0, d = this.d | 0;
        let t = 0 | 0, i = 0 | 0;
        const limit = (len32 - 4) | 0;

        while (i <= limit) {
            t = (a + b | 0) + d | 0; buf32[i] ^= t; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            t = (a + b | 0) + d | 0; buf32[i+1] ^= t; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            t = (a + b | 0) + d | 0; buf32[i+2] ^= t; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            t = (a + b | 0) + d | 0; buf32[i+3] ^= t; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            i = (i + 4) | 0;
        }

        while (i < len32) {
            t = (a + b | 0) + d | 0; buf32[i] ^= t; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            i = (i + 1) | 0;
        }

        this.a = a; this.b = b; this.c = c; this.d = d;

        const remainder = (output.length & 3) | 0;
        if (remainder > 0) {
            t = (a + b | 0) + d | 0; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
            this.a = a; this.b = b; this.c = c; this.d = d;
            let r = t;
            let offset = (output.length - remainder) | 0;
            while(offset < output.length) {
                output[offset] ^= (r & 0xFF); r >>>= 8; offset = (offset + 1) | 0;
            }
        }
        return output;
    }

    /**
     * Authenticated Encryption (One-Shot).
     * **Format:** `[ IV (16B) | Tag (16B) | Ciphertext (N) ]`
     * @param {string|Uint8Array} input
     * @returns {Uint8Array}
     */
    encrypt(input) {
        // 1. Prepare Session (Random IV)
        const sessionIV = CryptoSeeds.secure(16);
        // Self-instantiate
        const sessionCipher = new SFC32Chaskey(this._storedKey, sessionIV);
        const plaintext = typeof input === 'string' ? new TextEncoder().encode(input) : input;

        // 2. Encrypt (Stream Cipher)
        const ciphertext = sessionCipher.process(plaintext);

        // 3. Authenticate (Encrypt-then-MAC)
        const mac = new Chaskey(this.macKey);

        const authData = new Uint8Array(sessionIV.length + ciphertext.length);
        authData.set(sessionIV, 0);
        authData.set(ciphertext, sessionIV.length);

        const tag = mac.update(authData);

        // 4. Pack Output
        const output = new Uint8Array(32 + ciphertext.length);
        output.set(sessionIV, 0);   // 0..15
        output.set(tag, 16);        // 16..31
        output.set(ciphertext, 32); // 32..end

        return output;
    }

    /**
     * Authenticated Decryption (One-Shot).
     * @param {Uint8Array} input
     * @returns {string} UTF-8 Plaintext
     */
    decrypt(input) {
        if (input.length < 32) throw new Error("CryptoXOR: Input too short (min 32 bytes).");

        // 1. Unpack
        const iv = input.subarray(0, 16);
        const tag = input.subarray(16, 32);
        const ciphertext = input.subarray(32);

        // 2. Verify Integrity First (Fail-Fast)
        const mac = new Chaskey(this.macKey);

        const authData = new Uint8Array(iv.length + ciphertext.length);
        authData.set(iv, 0);
        authData.set(ciphertext, iv.length);

        const expectedTag = mac.update(authData);

        // Constant-time comparison
        let diff = 0;
        for(let i=0; i<16; i++) diff |= (tag[i] ^ expectedTag[i]);
        if (diff !== 0) throw new Error("🚨 Integrity Failure: Payload has been tampered with.");

        // 3. Decrypt
        const sessionCipher = new SFC32Chaskey(this._storedKey, iv);
        const decrypted = sessionCipher.process(ciphertext);

        return new TextDecoder().decode(decrypted);
    }
}