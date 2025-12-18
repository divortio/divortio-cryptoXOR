/**
 * @fileoverview Chaskey-12 Message Authentication Code.
 * **Optimized:** 32-bit ARX (Add-Rotate-XOR) for V8.
 * **Security:** 128-bit Key, 128-bit Block, 128-bit Tag.
 */

export class Chaskey {
    /**
     * @param {Uint8Array} key - 16 bytes (128-bit).
     */
    constructor(key) {
        if (key.length !== 16) throw new Error("Chaskey: Key must be 16 bytes.");

        // Read Key as 4x 32-bit integers (Little Endian)
        const view = new DataView(key.buffer, key.byteOffset, key.byteLength);
        this.k0 = view.getUint32(0, true);
        this.k1 = view.getUint32(4, true);
        this.k2 = view.getUint32(8, true);
        this.k3 = view.getUint32(12, true);

        // Pre-compute Subkeys for finalization (K1, K2)
        // This prevents timing attacks during the final block processing.
        this._generateSubkeys();
    }

    _generateSubkeys() {
        // Timestwo function logic over GF(2^128)
        let top = (this.k3 & 0x80000000) | 0;
        let k1_0 = (this.k0 << 1) | (this.k1 >>> 31);
        let k1_1 = (this.k1 << 1) | (this.k2 >>> 31);
        let k1_2 = (this.k2 << 1) | (this.k3 >>> 31);
        let k1_3 = (this.k3 << 1);
        if (top !== 0) k1_0 ^= 0x87; // Polynomial reduction

        this.K1 = [k1_0 >>> 0, k1_1 >>> 0, k1_2 >>> 0, k1_3 >>> 0];

        top = (k1_3 & 0x80000000) | 0;
        let k2_0 = (k1_0 << 1) | (k1_1 >>> 31);
        let k2_1 = (k1_1 << 1) | (k1_2 >>> 31);
        let k2_2 = (k1_2 << 1) | (k1_3 >>> 31);
        let k2_3 = (k1_3 << 1);
        if (top !== 0) k2_0 ^= 0x87;

        this.K2 = [k2_0 >>> 0, k2_1 >>> 0, k2_2 >>> 0, k2_3 >>> 0];
    }

    /**
     * Processes message and returns tag.
     * @param {Uint8Array} message
     * @returns {Uint8Array} 16-byte Tag
     */
    update(message) {
        // State initialization (v = k)
        let v0 = this.k0, v1 = this.k1, v2 = this.k2, v3 = this.k3;

        const len = message.length;
        const remainder = len & 15;
        const alignedLen = len - remainder;

        // --- Process Full 128-bit Blocks ---
        const view = new DataView(message.buffer, message.byteOffset, message.byteLength);

        for (let i = 0; i < alignedLen; i += 16) {
            // XOR message block into state
            v0 ^= view.getUint32(i, true);
            v1 ^= view.getUint32(i + 4, true);
            v2 ^= view.getUint32(i + 8, true);
            v3 ^= view.getUint32(i + 12, true);

            // 12 Rounds of Chaskey Permutation
            for (let r = 0; r < 12; r++) {
                v0 = (v0 + v1) | 0;
                v1 = (v1 << 5) | (v1 >>> 27); // ROTL 5
                v1 ^= v0;
                v0 = (v0 << 16) | (v0 >>> 16); // ROTL 16

                v2 = (v2 + v3) | 0;
                v3 = (v3 << 8) | (v3 >>> 24); // ROTL 8
                v3 ^= v2;

                v0 = (v0 + v3) | 0;
                v3 = (v3 << 13) | (v3 >>> 19); // ROTL 13
                v3 ^= v0;

                v2 = (v2 + v1) | 0;
                v1 = (v1 << 7) | (v1 >>> 25); // ROTL 7
                v1 ^= v2;
                v2 = (v2 << 16) | (v2 >>> 16); // ROTL 16
            }
        }

        // --- Handle Final Block ---
        // If message is aligned multiple of 16, XOR K1. Else, pad and XOR K2.
        if (remainder === 0 && len > 0) { // Spec edge case: empty message uses K2
            v0 ^= this.K1[0]; v1 ^= this.K1[1]; v2 ^= this.K1[2]; v3 ^= this.K1[3];
        } else {
            // Create padded block
            const lastBlock = new Uint8Array(16);
            if (remainder > 0) {
                lastBlock.set(message.subarray(alignedLen));
            }
            lastBlock[remainder] = 0x01; // Padding bit

            const lbView = new DataView(lastBlock.buffer);
            v0 ^= lbView.getUint32(0, true);
            v1 ^= lbView.getUint32(4, true);
            v2 ^= lbView.getUint32(8, true);
            v3 ^= lbView.getUint32(12, true);

            // XOR K2
            v0 ^= this.K2[0]; v1 ^= this.K2[1]; v2 ^= this.K2[2]; v3 ^= this.K2[3];
        }

        // Final Permutation (12 rounds)
        for (let r = 0; r < 12; r++) {
            v0 = (v0 + v1) | 0; v1 = (v1 << 5) | (v1 >>> 27); v1 ^= v0; v0 = (v0 << 16) | (v0 >>> 16);
            v2 = (v2 + v3) | 0; v3 = (v3 << 8) | (v3 >>> 24); v3 ^= v2;
            v0 = (v0 + v3) | 0; v3 = (v3 << 13) | (v3 >>> 19); v3 ^= v0;
            v2 = (v2 + v1) | 0; v1 = (v1 << 7) | (v1 >>> 25); v1 ^= v2; v2 = (v2 << 16) | (v2 >>> 16);
        }

        // Whitening (XOR Key)
        v0 ^= this.k0; v1 ^= this.k1; v2 ^= this.k2; v3 ^= this.k3;

        // Output
        const tag = new Uint8Array(16);
        const tagView = new DataView(tag.buffer);
        tagView.setUint32(0, v0, true);
        tagView.setUint32(4, v1, true);
        tagView.setUint32(8, v2, true);
        tagView.setUint32(12, v3, true);
        return tag;
    }
}