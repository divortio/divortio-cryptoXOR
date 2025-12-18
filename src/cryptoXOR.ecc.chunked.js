/**
 * @fileoverview Chunked ECC Module for Streams.
 * **Role:** Provides "Rolling ECC" for infinite streams.
 * **Mechanism:** Splits streams into fixed-size blocks (e.g., 64KB).
 * **Algorithm:** Jenkins Lookup3 (32-bit). Fast block processing.
 * **Security:** Uses "Chain Hash" (Previous Block Hash becomes Seed for Next Block).
 * @module CryptoXOR_ECC_Chunked
 * @author CryptoXOR Team
 * @license MIT
 */

// --- Lookup3 Implementation (Duplicated to allow V8 Inlining) ---
function lookup3(k, init) {
    let len = k.length | 0;
    let offset = 0;

    let a = (0xdeadbeef + len + init) | 0;
    let b = (0xdeadbeef + len + init) | 0;
    let c = (0xdeadbeef + len + init) | 0;

    while (len > 12) {
        a = (a + (k[offset] | (k[offset+1] << 8) | (k[offset+2] << 16) | (k[offset+3] << 24))) | 0;
        b = (b + (k[offset+4] | (k[offset+5] << 8) | (k[offset+6] << 16) | (k[offset+7] << 24))) | 0;
        c = (c + (k[offset+8] | (k[offset+9] << 8) | (k[offset+10] << 16) | (k[offset+11] << 24))) | 0;

        a = (a - c) | 0; a ^= (c << 4) | (c >>> 28); c = (c + b) | 0;
        b = (b - a) | 0; b ^= (a << 6) | (a >>> 26); a = (a + c) | 0;
        c = (c - b) | 0; c ^= (b << 8) | (b >>> 24); b = (b + a) | 0;
        a = (a - c) | 0; a ^= (c << 16) | (c >>> 16); c = (c + b) | 0;
        b = (b - a) | 0; b ^= (a << 19) | (a >>> 13); a = (a + c) | 0;
        c = (c - b) | 0; c ^= (b << 4) | (b >>> 28); b = (b + a) | 0;

        len = (len - 12) | 0;
        offset = (offset + 12) | 0;
    }

    if (len > 0) {
        switch (len) {
            case 12: c = (c + (k[offset+11] << 24)) | 0;
            case 11: c = (c + (k[offset+10] << 16)) | 0;
            case 10: c = (c + (k[offset+9] << 8)) | 0;
            case  9: c = (c + k[offset+8]) | 0;
            case  8: b = (b + (k[offset+7] << 24)) | 0;
            case  7: b = (b + (k[offset+6] << 16)) | 0;
            case  6: b = (b + (k[offset+5] << 8)) | 0;
            case  5: b = (b + k[offset+4]) | 0;
            case  4: a = (a + (k[offset+3] << 24)) | 0;
            case  3: a = (a + (k[offset+2] << 16)) | 0;
            case  2: a = (a + (k[offset+1] << 8)) | 0;
            case  1: a = (a + k[offset]) | 0;
        }

        c ^= b; c = (c - ((b << 14) | (b >>> 18))) | 0;
        a ^= c; a = (a - ((c << 11) | (c >>> 21))) | 0;
        b ^= a; b = (b - ((a << 25) | (a >>> 7))) | 0;
        c ^= b; c = (c - ((b << 16) | (b >>> 16))) | 0;
        a ^= c; a = (a - ((c << 4) | (c >>> 28))) | 0;
        b ^= a; b = (b - ((a << 14) | (a >>> 18))) | 0;
        c ^= b; c = (c - ((b << 24) | (b >>> 8))) | 0;
    }

    return c >>> 0;
}

export const ChunkedECC = {

    /**
     * Creates an INJECTOR stream (Sender Side).
     * @param {number} blockSize
     * @returns {TransformStream}
     */
    createInjector(blockSize) {
        let buffer = new Uint8Array(0);
        let prevHash = 0; // Seed chain

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

                    // Hash It (Chained with prevHash)
                    const hash = lookup3(block, prevHash);
                    prevHash = hash;

                    controller.enqueue(block);

                    const hashBytes = new Uint8Array(4);
                    new DataView(hashBytes.buffer).setUint32(0, hash, true);
                    controller.enqueue(hashBytes);
                }
            },

            flush(controller) {
                if (buffer.length > 0) {
                    const hash = lookup3(buffer, prevHash);
                    controller.enqueue(buffer);

                    const hashBytes = new Uint8Array(4);
                    new DataView(hashBytes.buffer).setUint32(0, hash, true);
                    controller.enqueue(hashBytes);
                }
            }
        });
    },

    /**
     * Creates a VERIFIER stream (Receiver Side).
     * @param {number} blockSize
     * @returns {TransformStream}
     */
    createVerifier(blockSize) {
        let buffer = new Uint8Array(0);
        let prevHash = 0;
        const targetSize = (blockSize + 4) | 0;

        const concat = (a, b) => {
            const res = new Uint8Array(a.length + b.length);
            res.set(a); res.set(b, a.length);
            return res;
        };

        return new TransformStream({
            transform(chunk, controller) {
                buffer = concat(buffer, chunk);

                while (buffer.length >= targetSize) {
                    const blockLen = (targetSize - 4) | 0;

                    const data = buffer.subarray(0, blockLen);
                    const hashBytes = buffer.subarray(blockLen, targetSize);

                    buffer = buffer.subarray(targetSize);

                    const expectedHash = new DataView(hashBytes.buffer, hashBytes.byteOffset, 4).getUint32(0, true);

                    // Validate (Chain)
                    const actualHash = lookup3(data, prevHash);

                    if (expectedHash !== actualHash) {
                        throw new Error("🚨 CryptoXOR Stream ECC Failure: Block corrupted.");
                    }

                    prevHash = actualHash;
                    controller.enqueue(data);
                }
            },

            flush(controller) {
                if (buffer.length > 0) {
                    if (buffer.length < 4) throw new Error("CryptoXOR Stream ECC: Stream truncated.");

                    const dataLen = (buffer.length - 4) | 0;
                    const data = buffer.subarray(0, dataLen);
                    const hashBytes = buffer.subarray(dataLen);

                    const expectedHash = new DataView(hashBytes.buffer, hashBytes.byteOffset, 4).getUint32(0, true);
                    const actualHash = lookup3(data, prevHash);

                    if (expectedHash !== actualHash) {
                        throw new Error("🚨 CryptoXOR Stream ECC Failure: Final block corrupted.");
                    }

                    controller.enqueue(data);
                }
            }
        });
    }
};