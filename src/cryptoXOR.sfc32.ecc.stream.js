/**
 * @fileoverview Streaming Wrapper for SFC32ECC Cipher.
 * **Role:** Transforms Node.js/Web Streams using the SFC32ECC engine.
 * **Performance:** Implements "Zero-Copy Fast Path" to bypass buffer allocation
 * for aligned chunks (99% of network traffic).
 * **Features:** Native support for Pipeline ECC (Chunked Hashing).
 * @module CryptoXOR_Stream_SFC32
 */

import SFC32ECC from './cryptoXOR.sfc32.ecc.js';
import { StreamECC } from './lib/ecc.stream.js';

/**
 * @typedef {Object} StreamOptions
 * @property {Uint8Array|function(): Uint8Array} [iv] - Manual IV strategy.
 * @property {number} [eccBlockSize] - If > 0, enables chunked ecc checks (e.g., 65536).
 */

/**
 * @typedef {Object} PipelineResult
 * @property {ReadableStream} readable - The output stream.
 * @property {WritableStream} writable - The input stream.
 */


class SFC32ECCStream {

    /**
     * Creates an ENCRYPTION stream pipeline.
     * **Pipeline:** `[Write] -> (ECCInjector?) -> [Cipher] -> [Read]`
     * @param {string|Uint8Array} key - Secret Key.
     * @param {StreamOptions} [options] - Configuration.
     * @returns {TransformStream|PipelineResult} The writable/readable pair.
     */
    static createEncryptStream(key, options = {}) {
        // 1. Initialize Engine
        const cipher = new SFC32ECC(key, options.iv);
        /** @type {Uint8Array} */
        const iv = cipher.iv;

        // [V8] Monomorphic state for buffer (always Uint8Array)
        /** @type {Uint8Array} */
        let pendingBuffer = new Uint8Array(0);

        const cipherStream = new TransformStream({
            start(controller) {
                // Header: Always write IV first
                controller.enqueue(iv);
            },

            /**
             * @param {Uint8Array} chunk
             * @param {TransformStreamDefaultController} controller
             */
            transform(chunk, controller) {
                // [V8] Localize length access to register (SMI)
                const chunkLen = chunk.length | 0;
                const pendingLen = pendingBuffer.length | 0;

                // --- 1. OPTIMIZATION: ZERO-COPY FAST PATH ---
                // If we have no leftovers and the new chunk is aligned (divisible by 4),
                // send it DIRECTLY to the cipher.
                // Result: 0 allocations, 0 copies.
                if (pendingLen === 0) {
                    const remainder = chunkLen & 3; // Modulo 4

                    if (remainder === 0) {
                        // Perfectly aligned. Pass through.
                        if (chunkLen > 0) controller.enqueue(cipher.process(chunk));
                        return;
                    }
                }

                // --- 2. SLOW PATH: Realignment & Concatenation ---
                // We only reach here if we have a tail from before, or an unaligned chunk.

                // Combine: pending + chunk
                // [Memory] Only allocate if strictly necessary
                let data;
                if (pendingLen === 0) {
                    data = chunk;
                } else {
                    data = SFC32ECCStream._concat(pendingBuffer, chunk);
                    pendingBuffer = new Uint8Array(0); // Release old reference immediately
                }

                const dataLen = data.length | 0;
                const remainder = dataLen & 3;
                const processableLen = (dataLen - remainder) | 0;

                // Extract the workable block
                if (processableLen > 0) {
                    // [V8] .subarray() creates a View (Cheap), not a Copy (Expensive).
                    // cipher.process will handle the allocation/encryption of this view.
                    const cleanBlock = data.subarray(0, processableLen);
                    controller.enqueue(cipher.process(cleanBlock));
                }

                // Save the tail (0-3 bytes)
                // [Memory] We MUST copy here to persist data across chunks.
                // Using new Uint8Array(view) forces the copy.
                if (remainder > 0) {
                    pendingBuffer = new Uint8Array(data.subarray(processableLen));
                }
            },

            flush(controller) {
                // Process any leftover bytes (Final Block)
                if (pendingBuffer.length > 0) {
                    controller.enqueue(cipher.process(pendingBuffer));
                }
            }
        });

        // 3. Optional Pipeline: Chunked ECC
        if (options.eccBlockSize && options.eccBlockSize > 0) {
            const injector = StreamECC.createInjector(options.eccBlockSize);

            // Connect: Injector -> Cipher
            // User writes to Injector (which hashes), then Injector pipes to Cipher (which encrypts)
            const { readable, writable } = new TransformStream();
            injector.readable.pipeThrough(cipherStream).pipeTo(writable);

            // Expose: Write to Injector, Read from Cipher
            return { readable, writable: injector.writable };
        }

        // Standard: Just the cipher
        return cipherStream;
    }

    /**
     * Creates a DECRYPTION stream pipeline.
     * * **Pipeline:** `[Write] -> [Cipher] -> (ECCVerifier?) -> [Read]`
     * @param {string|Uint8Array} key - Secret Key.
     * @param {StreamOptions} [options] - Configuration.
     * @returns {TransformStream|PipelineResult} The writable/readable pair.
     */
    static createDecryptStream(key, options = {}) {
        /** @type {SFC32ECC|null} */
        let cipher = null;
        /** @type {Uint8Array|null} */
        let headBuffer = new Uint8Array(0);
        /** @type {Uint8Array} */
        let pendingBuffer = new Uint8Array(0);

        const cipherStream = new TransformStream({
            /**
             * @param {Uint8Array} chunk
             * @param {TransformStreamDefaultController} controller
             */
            transform(chunk, controller) {
                // --- PHASE A: Header Parsing (Cold Path) ---
                if (!cipher) {
                    // We need to accumulate at least 16 bytes for the IV
                    headBuffer = SFC32ECCStream._concat(headBuffer, chunk);

                    if (headBuffer.length >= 16) {
                        const iv = headBuffer.slice(0, 16);
                        cipher = new SFC32ECC(key, iv);

                        // Remaining data is the first body chunk
                        chunk = headBuffer.slice(16);
                        headBuffer = null; // GC
                    } else {
                        return; // Buffer and wait for next chunk
                    }
                }

                if (chunk.length === 0) return;

                // --- PHASE B: Decryption Body (Hot Path) ---
                const chunkLen = chunk.length | 0;
                const pendingLen = pendingBuffer.length | 0;

                // [Optimization] Same Zero-Copy Fast Path as Encryption
                if (pendingLen === 0) {
                    const remainder = chunkLen & 3;
                    if (remainder === 0) {
                        if (chunkLen > 0) controller.enqueue(cipher.process(chunk));
                        return;
                    }
                }

                // Slow Path (Re-alignment)
                let data;
                if (pendingLen === 0) {
                    data = chunk;
                } else {
                    data = SFC32ECCStream._concat(pendingBuffer, chunk);
                    pendingBuffer = new Uint8Array(0);
                }

                const dataLen = data.length | 0;
                const remainder = dataLen & 3;
                const processableLen = (dataLen - remainder) | 0;

                if (processableLen > 0) {
                    const cleanBlock = data.subarray(0, processableLen);
                    controller.enqueue(cipher.process(cleanBlock));
                }

                if (remainder > 0) {
                    pendingBuffer = new Uint8Array(data.subarray(processableLen));
                }
            },

            flush(controller) {
                if (pendingBuffer.length > 0 && cipher) {
                    controller.enqueue(cipher.process(pendingBuffer));
                }
            }
        });

        // 2. Optional Pipeline: Chunked ECC
        if (options.integrityBlockSize && options.integrityBlockSize > 0) {
            const verifier = StreamECC.createVerifier(options.integrityBlockSize);

            // Connect: Cipher -> Verifier
            // Cipher decrypts -> Pipes to Verifier (checks hash & strips it) -> Output
            const { readable, writable } = new TransformStream();
            cipherStream.readable.pipeThrough(verifier).pipeTo(writable);

            // Expose: Write to Cipher, Read from Verifier
            return { readable, writable: cipherStream.writable };
        }

        return cipherStream;
    }

    /** * Helper: Fast Buffer Concatenation.
     * [V8] Optimized to avoid calling if not needed.
     * @param {Uint8Array} a
     * @param {Uint8Array} b
     * @returns {Uint8Array}
     */
    static _concat(a, b) {
        if (!a || a.length === 0) return b;
        if (!b || b.length === 0) return a;

        // Hard Allocation: Avoid unless strictly necessary
        const res = new Uint8Array(a.length + b.length);
        res.set(a);
        res.set(b, a.length);
        return res;
    }
}

export default SFC32ECCStream;