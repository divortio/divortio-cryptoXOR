/**
 * @fileoverview Streaming SFC32 with Chunked Chaskey Integrity.
 * **Role:** Secure streaming for large files/network.
 * **Integrity:** Injects a 16-byte Chaskey Tag after every chunk.
 * **Chaining:** Tags are chained (Tag_N depends on Tag_N-1).
 * @module CryptoXOR_Stream_SFC32_Chaskey
 */

import { SFC32Chaskey } from './cryptoXOR.sfc32.chaskey.js';
import { Chaskey } from './integrity/chaskey.js';

// --- Internal Helper: Chunked Chaskey Transformer ---

const ChaskeyStream = {
    /**
     * Creates an INJECTOR stream.
     * Output: `[Block 1] [Tag 1] [Block 2] [Tag 2] ...`
     */
    createInjector(macKey, blockSize) {
        let buffer = new Uint8Array(0);
        let prevTag = new Uint8Array(16); // Chain seed
        const macEngine = new Chaskey(macKey);

        const concat = (a, b) => {
            const res = new Uint8Array(a.length + b.length);
            res.set(a); res.set(b, a.length);
            return res;
        };

        return new TransformStream({
            transform(chunk, controller) {
                buffer = concat(buffer, chunk);

                while (buffer.length >= blockSize) {
                    const block = buffer.subarray(0, blockSize);
                    buffer = buffer.subarray(blockSize);

                    // MAC( prevTag || Block )
                    const authData = concat(prevTag, block);
                    const tag = macEngine.update(authData);
                    prevTag = tag;

                    controller.enqueue(block);
                    controller.enqueue(tag);
                }
            },
            flush(controller) {
                if (buffer.length > 0) {
                    const authData = concat(prevTag, buffer);
                    const tag = macEngine.update(authData);
                    controller.enqueue(buffer);
                    controller.enqueue(tag);
                }
            }
        });
    },

    /**
     * Creates a VERIFIER stream.
     * Consumes `[Block][Tag]`, validates, strips Tag, emits `[Block]`.
     */
    createVerifier(macKey, blockSize) {
        let buffer = new Uint8Array(0);
        let prevTag = new Uint8Array(16);
        const macEngine = new Chaskey(macKey);
        const targetSize = blockSize + 16;

        const concat = (a, b) => {
            const res = new Uint8Array(a.length + b.length);
            res.set(a); res.set(b, a.length);
            return res;
        };

        return new TransformStream({
            transform(chunk, controller) {
                buffer = concat(buffer, chunk);

                while (buffer.length >= targetSize) {
                    const blockLen = blockSize;
                    const block = buffer.subarray(0, blockLen);
                    const tag = buffer.subarray(blockLen, targetSize);
                    buffer = buffer.subarray(targetSize);

                    const authData = concat(prevTag, block);
                    const expectedTag = macEngine.update(authData);

                    let diff = 0;
                    for(let i=0; i<16; i++) diff |= (tag[i] ^ expectedTag[i]);
                    if (diff !== 0) throw new Error("🚨 Stream Integrity Failure: Block corrupted.");

                    prevTag = tag;
                    controller.enqueue(block);
                }
            },
            flush(controller) {
                if (buffer.length > 0) {
                    if (buffer.length < 16) throw new Error("Stream Integrity Failure: Truncated stream.");
                    const dataLen = buffer.length - 16;
                    const block = buffer.subarray(0, dataLen);
                    const tag = buffer.subarray(dataLen);

                    const authData = concat(prevTag, block);
                    const expectedTag = macEngine.update(authData);

                    let diff = 0;
                    for(let i=0; i<16; i++) diff |= (tag[i] ^ expectedTag[i]);
                    if (diff !== 0) throw new Error("🚨 Stream Integrity Failure: Final block corrupted.");

                    controller.enqueue(block);
                }
            }
        });
    }
};

// --- Main Export ---

export class SFC32ChaskeyStream extends SFC32Chaskey {

    /**
     * Creates an Authenticated ENCRYPTION stream.
     * Pipeline: `Input -> Encrypt -> MAC Inject -> Output`
     */
    static createEncryptStream(key, options = {}) {
        const blockSize = options.integrityBlockSize || (64 * 1024);

        // 1. Create Standalone Cipher (which derives MAC key)
        // We use the cipher instance logic to handle IVs and Encryption
        const cipher = new SFC32Chaskey(key, options.iv);
        const iv = cipher.iv;
        const macKey = cipher.macKey;

        let pending = new Uint8Array(0);

        const cipherStream = new TransformStream({
            start(controller) { controller.enqueue(iv); },
            transform(chunk, controller) {
                // Zero-Copy Fast Path
                if (pending.length === 0 && (chunk.length & 3) === 0) {
                    if (chunk.length > 0) controller.enqueue(cipher.process(chunk));
                    return;
                }
                // Slow Path
                const combined = new Uint8Array(pending.length + chunk.length);
                combined.set(pending); combined.set(chunk, pending.length);
                const rem = combined.length & 3;
                const procLen = combined.length - rem;
                if (procLen > 0) {
                    controller.enqueue(cipher.process(combined.subarray(0, procLen)));
                }
                pending = (rem > 0) ? combined.slice(procLen) : new Uint8Array(0);
            },
            flush(controller) {
                if (pending.length > 0) controller.enqueue(cipher.process(pending));
            }
        });

        // 2. Inject MACs
        const injector = ChaskeyStream.createInjector(macKey, blockSize);
        const { readable, writable } = new TransformStream();

        cipherStream.readable.pipeThrough(injector).pipeTo(writable);

        return {
            writable: cipherStream.writable,
            readable: readable
        };
    }

    /**
     * Creates an Authenticated DECRYPTION stream.
     * Pipeline: `Input -> MAC Verify -> Decrypt -> Output`
     */
    static createDecryptStream(key, options = {}) {
        // Derive MAC key statically or via temporary instance
        const macKey = SFC32Chaskey.deriveMacKey(typeof key === 'string' ? new TextEncoder().encode(key) : key);
        const blockSize = options.integrityBlockSize || (64 * 1024);

        // 1. Verifier (First in chain)
        const verifier = ChaskeyStream.createVerifier(macKey, blockSize);

        // 2. Cipher Stream
        let cipher = null;
        let head = new Uint8Array(0);
        let pending = new Uint8Array(0);

        const cipherStream = new TransformStream({
            transform(chunk, controller) {
                if (!cipher) {
                    const combined = new Uint8Array(head.length + chunk.length);
                    combined.set(head); combined.set(chunk, head.length);
                    head = combined;
                    if (head.length >= 16) {
                        const iv = head.slice(0, 16);
                        cipher = new SFC32Chaskey(key, iv); // iv is used here
                        chunk = head.slice(16);
                        head = null;
                    } else return;
                }
                if (chunk.length === 0) return;

                // Zero-Copy Fast Path
                if (pending.length === 0 && (chunk.length & 3) === 0) {
                    controller.enqueue(cipher.process(chunk));
                    return;
                }
                // Slow Path
                const combined = new Uint8Array(pending.length + chunk.length);
                combined.set(pending); combined.set(chunk, pending.length);
                const rem = combined.length & 3;
                const procLen = combined.length - rem;
                if (procLen > 0) {
                    controller.enqueue(cipher.process(combined.subarray(0, procLen)));
                }
                pending = (rem > 0) ? combined.slice(procLen) : new Uint8Array(0);
            },
            flush(controller) {
                if (pending.length > 0 && cipher) controller.enqueue(cipher.process(pending));
            }
        });

        const { readable, writable } = new TransformStream();
        verifier.readable.pipeThrough(cipherStream).pipeTo(writable);

        return {
            writable: verifier.writable,
            readable: readable
        };
    }
}