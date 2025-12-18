/**
 * @fileoverview Atomic ECC Module.
 * **Role:** Provides "Hash-then-Encrypt" tamper detection for in-memory buffers.
 * **Algorithm:** Jenkins Lookup3 (32-bit). Selected for extremely high throughput (600MB/s+) on blocks.
 * **Overhead:** Adds exactly 4 bytes to the ciphertext payload.
 * @module CryptoXOR_ecc
 * @author CryptoXOR Team
 * @license MIT
 */

/**
 * @typedef {Object} CipherInterface
 * @property {function(Uint8Array): Uint8Array} process
 */

/**
 * Jenkins Lookup3 Hash (Optimized for JS).
 * Processes data in 12-byte chunks.
 * @param {Uint8Array} k - Input data.
 * @param {number} init - Seed value.
 * @returns {number} Unsigned 32-bit hash (State C).
 */
function lookup3(k, init) {
    let len = k.length | 0;
    let offset = 0;

    let a = (0xdeadbeef + len + init) | 0;
    let b = (0xdeadbeef + len + init) | 0;
    let c = (0xdeadbeef + len + init) | 0; // init2 is 0 for 32-bit mode

    // 1. Process 12-byte blocks
    while (len > 12) {
        a = (a + (k[offset] | (k[offset+1] << 8) | (k[offset+2] << 16) | (k[offset+3] << 24))) | 0;
        b = (b + (k[offset+4] | (k[offset+5] << 8) | (k[offset+6] << 16) | (k[offset+7] << 24))) | 0;
        c = (c + (k[offset+8] | (k[offset+9] << 8) | (k[offset+10] << 16) | (k[offset+11] << 24))) | 0;

        // Mix
        a = (a - c) | 0; a ^= (c << 4) | (c >>> 28); c = (c + b) | 0;
        b = (b - a) | 0; b ^= (a << 6) | (a >>> 26); a = (a + c) | 0;
        c = (c - b) | 0; c ^= (b << 8) | (b >>> 24); b = (b + a) | 0;
        a = (a - c) | 0; a ^= (c << 16) | (c >>> 16); c = (c + b) | 0;
        b = (b - a) | 0; b ^= (a << 19) | (a >>> 13); a = (a + c) | 0;
        c = (c - b) | 0; c ^= (b << 4) | (b >>> 28); b = (b + a) | 0;

        len = (len - 12) | 0;
        offset = (offset + 12) | 0;
    }

    // 2. Handle Tail
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

        // Final Mix
        c ^= b; c = (c - ((b << 14) | (b >>> 18))) | 0;
        a ^= c; a = (a - ((c << 11) | (c >>> 21))) | 0;
        b ^= a; b = (b - ((a << 25) | (a >>> 7))) | 0;
        c ^= b; c = (c - ((b << 16) | (b >>> 16))) | 0;
        a ^= c; a = (a - ((c << 4) | (c >>> 28))) | 0;
        b ^= a; b = (b - ((a << 14) | (a >>> 18))) | 0;
        c ^= b; c = (c - ((b << 24) | (b >>> 8))) | 0;
    }

    // Return C (Best mixed state) as Unsigned 32-bit
    return c >>> 0;
}

export const ECC = {

    /**
     * Encrypts data and embeds a checksum *inside* the encryption envelope.
     * @param {CipherInterface} cipherInstance
     * @param {Uint8Array} dataBytes
     * @returns {Uint8Array}
     */
    encryptWithChecksum(cipherInstance, dataBytes) {
        // 1. Calculate Hash (Lookup3)
        const hash = lookup3(dataBytes, 0);

        // 2. Create Payload: [ Data ... | Hash (4 bytes) ]
        const payloadLen = (dataBytes.length + 4) | 0;
        const payload = new Uint8Array(payloadLen);

        payload.set(dataBytes, 0);

        // Append 32-bit Hash (Little Endian)
        const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        view.setUint32(dataBytes.length, hash, true);

        return cipherInstance.process(payload);
    },

    /**
     * Decrypts, extracts checksum, and verifies ECC.
     * @param {CipherInterface} cipherInstance
     * @param {Uint8Array} ciphertext
     * @returns {Uint8Array}
     */
    decryptWithChecksum(cipherInstance, ciphertext) {
        if (ciphertext.length < 4) {
            throw new Error("CryptoXOR ECC: Data too short.");
        }

        const decryptedWrapper = cipherInstance.process(ciphertext);

        // Split
        const dataLen = (decryptedWrapper.length - 4) | 0;
        const data = decryptedWrapper.subarray(0, dataLen);

        const view = new DataView(decryptedWrapper.buffer, decryptedWrapper.byteOffset, decryptedWrapper.byteLength);
        const expectedHash = view.getUint32(dataLen, true);

        // Verify (Lookup3)
        const actualHash = lookup3(data, 0);

        if (actualHash !== expectedHash) {
            throw new Error("🚨 CryptoXOR ECC Failure: Data tampered or key incorrect.");
        }

        return data;
    }
};