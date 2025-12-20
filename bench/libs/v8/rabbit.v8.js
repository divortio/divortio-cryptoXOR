/**
 * @module FastRabbit
 * @description A V8-optimized implementation of the Rabbit Stream Cipher (RFC 4503).
 * **Performance:** Uses TypedArrays for state and BigInt for the 64-bit g-function.
 * **Key:** 128-bit (16 bytes).
 * **IV:** 64-bit (8 bytes).
 */
export default class FastRabbit {
    /**
     * @param {Uint8Array} key - 16 bytes.
     * @param {Uint8Array} nonce - 8 bytes (IV).
     */
    constructor(key, nonce) {
        if (key.length !== 16) throw new Error("Rabbit: Key must be 16 bytes");

        // Rabbit uses 64-bit IV. If benchmark sends 12 bytes, we truncate/pad.
        let iv = nonce;
        if (nonce.length !== 8) {
            iv = new Uint8Array(8);
            iv.set(nonce.subarray(0, 8));
        }

        // State: 8 x 32-bit state variables (X), 8 x 32-bit counters (C)
        this.X = new Int32Array(8);
        this.C = new Int32Array(8);
        this.b = 0; // Carry bit

        // Master State (saved after key setup for fast IV re-init)
        this.mX = new Int32Array(8);
        this.mC = new Int32Array(8);
        this.mb = 0;

        // Key Setup
        this._setupKey(key);

        // IV Setup
        this._setupIV(iv);

        // Keystream Buffer (16 bytes per iteration)
        this.keystream = new Uint8Array(16);
        this.keystream32 = new Int32Array(this.keystream.buffer);
        this.pending = 0; // Bytes remaining in keystream buffer
    }

    _setupKey(key) {
        const k = new DataView(key.buffer, key.byteOffset, key.byteLength);
        const k0 = k.getUint16(0, true);   const k1 = k.getUint16(2, true);
        const k2 = k.getUint16(4, true);   const k3 = k.getUint16(6, true);
        const k4 = k.getUint16(8, true);   const k5 = k.getUint16(10, true);
        const k6 = k.getUint16(12, true);  const k7 = k.getUint16(14, true);

        // Initialize State (X) and Counters (C)
        const X = this.X;
        const C = this.C;

        X[0] = (k1 << 16) | k0;
        X[1] = (k6 << 16) | k5;
        X[2] = (k3 << 16) | k2;
        X[3] = (k0 << 16) | k7;
        X[4] = (k5 << 16) | k4;
        X[5] = (k2 << 16) | k1;
        X[6] = (k7 << 16) | k6;
        X[7] = (k4 << 16) | k3;

        C[0] = (k4 << 16) | k5;
        C[1] = (k1 << 16) | k0;
        C[2] = (k6 << 16) | k7;
        C[3] = (k3 << 16) | k2;
        C[4] = (k0 << 16) | k1;
        C[5] = (k5 << 16) | k4;
        C[6] = (k2 << 16) | k3;
        C[7] = (k7 << 16) | k6;

        this.b = 0;

        // Iterate 4 times
        for (let i = 0; i < 4; i++) this._nextState();

        // Re-initialize counters
        for (let i = 0; i < 8; i++) {
            C[i] ^= X[(i + 4) & 7];
        }

        // Save Master State
        this.mX.set(X);
        this.mC.set(C);
        this.mb = this.b;
    }

    _setupIV(ivBytes) {
        // Restore Master State
        this.X.set(this.mX);
        this.C.set(this.mC);
        this.b = this.mb;

        // Parse IV (64-bit)
        const v = new DataView(ivBytes.buffer, ivBytes.byteOffset, ivBytes.byteLength);
        const iv0 = v.getUint32(0, true);
        const iv1 = v.getUint32(4, true);

        // Extract 16-bit chunks
        const i0 = iv0 & 0xFFFF;
        const i1 = iv0 >>> 16;
        const i2 = iv1 & 0xFFFF;
        const i3 = iv1 >>> 16;

        // Modify Counters
        const C = this.C;
        C[0] ^= iv0;
        C[1] ^= (i3 << 16) | i1;
        C[2] ^= iv1;
        C[3] ^= (i2 << 16) | i0;
        C[4] ^= iv0;
        C[5] ^= (i3 << 16) | i1;
        C[6] ^= iv1;
        C[7] ^= (i2 << 16) | i0;

        // Iterate 4 times
        for (let i = 0; i < 4; i++) this._nextState();
    }

    /**
     * Rabbit g-function: g(u) = (u^2 ^ (u^2 >> 32)) mod 2^32
     * Implemented using BigInt to handle the 64-bit square correctly in V8.
     */
    _g(u) {
        // Treat u as unsigned 32-bit
        const U = BigInt(u >>> 0);
        const Sq = U * U;
        // XOR low 32 bits with high 32 bits
        return Number((Sq ^ (Sq >> 32n)) & 0xFFFFFFFFn) | 0;
    }

    _nextState() {
        const X = this.X;
        const C = this.C;

        // Update Counters
        // Constants A0..A7
        const A = [
            0x4D34D34D, 0xD34D34D3, 0x34D34D34, 0x4D34D34D,
            0xD34D34D3, 0x34D34D34, 0x4D34D34D, 0xD34D34D3
        ];

        let b = this.b;
        for (let i = 0; i < 8; i++) {
            // C[i] + A[i] + b (using 64-bit float logic or BigInt to catch carry)
            const sum = (C[i] >>> 0) + (A[i] >>> 0) + b;
            b = Math.floor(sum / 4294967296); // Calculate new carry
            C[i] = sum | 0;
        }
        this.b = b;

        // Calculate G values
        const G = new Int32Array(8);
        for (let i = 0; i < 8; i++) {
            G[i] = this._g((X[i] + C[i]) | 0);
        }

        // Update State (X)
        // Rotations: <<< 16, <<< 8
        const rot16 = (v) => (v << 16) | (v >>> 16);
        const rot8  = (v) => (v << 8)  | (v >>> 24);

        X[0] = (G[0] + rot16(G[7]) + rot16(G[6])) | 0;
        X[1] = (G[1] + rot8(G[0])  + G[7])        | 0;
        X[2] = (G[2] + rot16(G[1]) + rot16(G[0])) | 0;
        X[3] = (G[3] + rot8(G[2])  + G[1])        | 0;
        X[4] = (G[4] + rot16(G[3]) + rot16(G[2])) | 0;
        X[5] = (G[5] + rot8(G[4])  + G[3])        | 0;
        X[6] = (G[6] + rot16(G[5]) + rot16(G[4])) | 0;
        X[7] = (G[7] + rot8(G[6])  + G[5])        | 0;
    }

    process(input) {
        const output = new Uint8Array(input);
        const len = output.length;
        let offset = 0;

        // Use any pending keystream bytes
        while (this.pending > 0 && offset < len) {
            output[offset] ^= this.keystream[16 - this.pending];
            this.pending--;
            offset++;
        }

        // Fast Path: Process aligned 16-byte blocks
        if (offset === 0 && (len & 15) === 0 && (output.byteOffset % 4 === 0)) {
            // We can operate on Int32Array directly
            const out32 = new Int32Array(output.buffer, output.byteOffset, len >> 2);
            const X = this.X;

            for (let i = 0; i < out32.length; i += 4) {
                this._nextState();
                // Extract 128 bits (4 ints)
                // s[0] = x0 ^ (x5 >>> 16) ^ (x3 <<< 16)
                out32[i]   ^= X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
                out32[i+1] ^= X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
                out32[i+2] ^= X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
                out32[i+3] ^= X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);
            }
            return output;
        }

        // Standard Path
        while (offset < len) {
            if (this.pending === 0) {
                this._nextState();
                const X = this.X;
                const k32 = this.keystream32;

                // Generate 16 bytes of keystream
                k32[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
                k32[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
                k32[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
                k32[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

                this.pending = 16;
            }

            const take = Math.min(this.pending, len - offset);
            for (let i = 0; i < take; i++) {
                output[offset++] ^= this.keystream[16 - this.pending + i];
            }
            this.pending -= take;
        }

        return output;
    }
}