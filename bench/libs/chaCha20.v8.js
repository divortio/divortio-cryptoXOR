/**
 * @module FastChaCha20
 * @description A V8-optimized implementation of the ChaCha20 stream cipher.
 * Uses Int32Array views and unrolled loops for maximum throughput.
 */
class FastChaCha20 {
    constructor(keyBytes, nonceBytes, counter = 1) {
        if (keyBytes.length !== 32) throw new Error("Key must be 32 bytes");
        if (nonceBytes.length !== 12) throw new Error("Nonce must be 12 bytes");

        // Permanent buffers to avoid GC thrashing
        this.state = new Int32Array(16);
        this.work = new Int32Array(16);

        // Constants: "expand 32-byte k"
        this.state[0] = 0x61707865; this.state[1] = 0x3320646e;
        this.state[2] = 0x796b2d32; this.state[3] = 0x6b206574;

        // Key
        const kView = new DataView(keyBytes.buffer, keyBytes.byteOffset, keyBytes.byteLength);
        for (let i = 0; i < 8; i++) this.state[4 + i] = kView.getInt32(i * 4, true);

        // Counter & Nonce
        this.state[12] = counter;
        const nView = new DataView(nonceBytes.buffer, nonceBytes.byteOffset, nonceBytes.byteLength);
        for (let i = 0; i < 3; i++) this.state[13 + i] = nView.getInt32(i * 4, true);
    }

    process(input) {
        const len = input.length;
        const output = new Uint8Array(len);
        output.set(input);

        let offset = 0;
        const state = this.state;
        const work = this.work;

        // Process 64-byte blocks
        while (len - offset >= 64) {
            // Copy state to work
            for (let i = 0; i < 16; i++) work[i] = state[i];

            this._chachaCore(work);

            // Add state to work
            for (let i = 0; i < 16; i++) work[i] = (work[i] + state[i]) | 0;

            // Increment counter
            state[12] = (state[12] + 1) | 0;

            // XOR Data (Fast Path: 32-bit aligned)
            if ((output.byteOffset + offset) % 4 === 0) {
                const out32 = new Int32Array(output.buffer, output.byteOffset + offset, 16);
                out32[0] ^= work[0];   out32[1] ^= work[1];   out32[2] ^= work[2];   out32[3] ^= work[3];
                out32[4] ^= work[4];   out32[5] ^= work[5];   out32[6] ^= work[6];   out32[7] ^= work[7];
                out32[8] ^= work[8];   out32[9] ^= work[9];   out32[10] ^= work[10]; out32[11] ^= work[11];
                out32[12] ^= work[12]; out32[13] ^= work[13]; out32[14] ^= work[14]; out32[15] ^= work[15];
            } else {
                // Slow Path: Unaligned
                const workBytes = new Uint8Array(work.buffer);
                for (let k = 0; k < 64; k++) output[offset + k] ^= workBytes[k];
            }
            offset += 64;
        }

        // Handle Tail
        if (offset < len) {
            for (let i = 0; i < 16; i++) work[i] = state[i];
            this._chachaCore(work);
            for (let i = 0; i < 16; i++) work[i] = (work[i] + state[i]) | 0;
            const workBytes = new Uint8Array(work.buffer);
            for (let k = 0; k < (len - offset); k++) output[offset + k] ^= workBytes[k];
        }
        return output;
    }

    _chachaCore(x) {
        // 10 Loops of 2 rounds = 20 Rounds (Unrolled for V8 pipelining)
        for (let i = 0; i < 10; i++) {
            x[0] = (x[0] + x[4]) | 0; x[12] = (x[12] ^ x[0]); x[12] = (x[12] << 16) | (x[12] >>> 16);
            x[8] = (x[8] + x[12]) | 0; x[4]  = (x[4]  ^ x[8]); x[4]  = (x[4]  << 12) | (x[4]  >>> 20);
            x[0] = (x[0] + x[4]) | 0; x[12] = (x[12] ^ x[0]); x[12] = (x[12] << 8)  | (x[12] >>> 24);
            x[8] = (x[8] + x[12]) | 0; x[4]  = (x[4]  ^ x[8]); x[4]  = (x[4]  << 7)  | (x[4]  >>> 25);
            x[1] = (x[1] + x[5]) | 0; x[13] = (x[13] ^ x[1]); x[13] = (x[13] << 16) | (x[13] >>> 16);
            x[9] = (x[9] + x[13]) | 0; x[5]  = (x[5]  ^ x[9]); x[5]  = (x[5]  << 12) | (x[5]  >>> 20);
            x[1] = (x[1] + x[5]) | 0; x[13] = (x[13] ^ x[1]); x[13] = (x[13] << 8)  | (x[13] >>> 24);
            x[9] = (x[9] + x[13]) | 0; x[5]  = (x[5]  ^ x[9]); x[5]  = (x[5]  << 7)  | (x[5]  >>> 25);
            x[2] = (x[2] + x[6]) | 0; x[14] = (x[14] ^ x[2]); x[14] = (x[14] << 16) | (x[14] >>> 16);
            x[10]= (x[10]+ x[14])| 0; x[6]  = (x[6]  ^ x[10]);x[6]  = (x[6]  << 12) | (x[6]  >>> 20);
            x[2] = (x[2] + x[6]) | 0; x[14] = (x[14] ^ x[2]); x[14] = (x[14] << 8)  | (x[14] >>> 24);
            x[10]= (x[10]+ x[14])| 0; x[6]  = (x[6]  ^ x[10]);x[6]  = (x[6]  << 7)  | (x[6]  >>> 25);
            x[3] = (x[3] + x[7]) | 0; x[15] = (x[15] ^ x[3]); x[15] = (x[15] << 16) | (x[15] >>> 16);
            x[11]= (x[11]+ x[15])| 0; x[7]  = (x[7]  ^ x[11]);x[7]  = (x[7]  << 12) | (x[7]  >>> 20);
            x[3] = (x[3] + x[7]) | 0; x[15] = (x[15] ^ x[3]); x[15] = (x[15] << 8)  | (x[15] >>> 24);
            x[11]= (x[11]+ x[15])| 0; x[7]  = (x[7]  ^ x[11]);x[7]  = (x[7]  << 7)  | (x[7]  >>> 25);
            x[0] = (x[0] + x[5]) | 0; x[15] = (x[15] ^ x[0]); x[15] = (x[15] << 16) | (x[15] >>> 16);
            x[10]= (x[10]+ x[15])| 0; x[5]  = (x[5]  ^ x[10]);x[5]  = (x[5]  << 12) | (x[5]  >>> 20);
            x[0] = (x[0] + x[5]) | 0; x[15] = (x[15] ^ x[0]); x[15] = (x[15] << 8)  | (x[15] >>> 24);
            x[10]= (x[10]+ x[15])| 0; x[5]  = (x[5]  ^ x[10]);x[5]  = (x[5]  << 7)  | (x[5]  >>> 25);
            x[1] = (x[1] + x[6]) | 0; x[12] = (x[12] ^ x[1]); x[12] = (x[12] << 16) | (x[12] >>> 16);
            x[11]= (x[11]+ x[12])| 0; x[6]  = (x[6]  ^ x[11]);x[6]  = (x[6]  << 12) | (x[6]  >>> 20);
            x[1] = (x[1] + x[6]) | 0; x[12] = (x[12] ^ x[1]); x[12] = (x[12] << 8)  | (x[12] >>> 24);
            x[11]= (x[11]+ x[12])| 0; x[6]  = (x[6]  ^ x[11]);x[6]  = (x[6]  << 7)  | (x[6]  >>> 25);
            x[2] = (x[2] + x[7]) | 0; x[13] = (x[13] ^ x[2]); x[13] = (x[13] << 16) | (x[13] >>> 16);
            x[8] = (x[8] + x[13]) | 0; x[7]  = (x[7]  ^ x[8]); x[7]  = (x[7]  << 12) | (x[7]  >>> 20);
            x[2] = (x[2] + x[7]) | 0; x[13] = (x[13] ^ x[2]); x[13] = (x[13] << 8)  | (x[13] >>> 24);
            x[8] = (x[8] + x[13]) | 0; x[7]  = (x[7]  ^ x[8]); x[7]  = (x[7]  << 7)  | (x[7]  >>> 25);
            x[3] = (x[3] + x[4]) | 0; x[14] = (x[14] ^ x[3]); x[14] = (x[14] << 16) | (x[14] >>> 16);
            x[9] = (x[9] + x[14]) | 0; x[4]  = (x[4]  ^ x[9]); x[4]  = (x[4]  << 12) | (x[4]  >>> 20);
            x[3] = (x[3] + x[4]) | 0; x[14] = (x[14] ^ x[3]); x[14] = (x[14] << 8)  | (x[14] >>> 24);
            x[9] = (x[9] + x[14]) | 0; x[4]  = (x[4]  ^ x[9]); x[4]  = (x[4]  << 7)  | (x[4]  >>> 25);
        }
    }
}

export default FastChaCha20;