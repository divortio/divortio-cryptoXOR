/**
 * @module FastSalsa20
 * @description V8-optimized Salsa20 stream cipher.
 * Very similar to ChaCha20 but with different diffusion mechanics.
 */
export default class FastSalsa20 {
    constructor(keyBytes, nonceBytes, counter = 0) {
        if (keyBytes.length !== 32) throw new Error("Key must be 32 bytes");
        if (nonceBytes.length !== 8) throw new Error("Salsa20 Nonce must be 8 bytes");

        // State: 16 x 32-bit integers
        this.state = new Int32Array(16);
        this.work = new Int32Array(16);

        // Constants "expand 32-byte k"
        this.state[0] = 0x61707865; this.state[5] = 0x3320646e;
        this.state[10] = 0x796b2d32; this.state[15] = 0x6b206574;

        // Key
        const kView = new DataView(keyBytes.buffer, keyBytes.byteOffset, keyBytes.byteLength);
        this.state[1] = kView.getInt32(0, true);
        this.state[2] = kView.getInt32(4, true);
        this.state[3] = kView.getInt32(8, true);
        this.state[4] = kView.getInt32(12, true);
        this.state[11] = kView.getInt32(16, true);
        this.state[12] = kView.getInt32(20, true);
        this.state[13] = kView.getInt32(24, true);
        this.state[14] = kView.getInt32(28, true);

        // Nonce & Counter
        const nView = new DataView(nonceBytes.buffer, nonceBytes.byteOffset, nonceBytes.byteLength);
        this.state[6] = nView.getInt32(0, true);
        this.state[7] = nView.getInt32(4, true);
        this.state[8] = counter; // Lo
        this.state[9] = 0;       // Hi
    }

    process(input) {
        const len = input.length;
        const output = new Uint8Array(len);
        output.set(input);

        let offset = 0;
        const state = this.state;
        const work = this.work;

        while (len - offset >= 64) {
            for (let i = 0; i < 16; i++) work[i] = state[i];

            this._salsa20Core(work);

            for (let i = 0; i < 16; i++) work[i] = (work[i] + state[i]) | 0;

            // Increment Counter
            state[8] = (state[8] + 1) | 0;
            if (state[8] === 0) state[9] = (state[9] + 1) | 0;

            // XOR Block
            if ((output.byteOffset + offset) % 4 === 0) {
                const out32 = new Int32Array(output.buffer, output.byteOffset + offset, 16);
                for (let i = 0; i < 16; i++) out32[i] ^= work[i];
            } else {
                const workBytes = new Uint8Array(work.buffer);
                for (let k = 0; k < 64; k++) output[offset + k] ^= workBytes[k];
            }
            offset += 64;
        }

        // Handle Tail
        if (offset < len) {
            for (let i = 0; i < 16; i++) work[i] = state[i];
            this._salsa20Core(work);
            for (let i = 0; i < 16; i++) work[i] = (work[i] + state[i]) | 0;

            const workBytes = new Uint8Array(work.buffer);
            for (let k = 0; k < (len - offset); k++) output[offset + k] ^= workBytes[k];
        }
        return output;
    }

    _salsa20Core(x) {
        // 10 loops of 2 rounds (20 rounds total)
        for (let i = 0; i < 10; i++) {
            // Column Rounds
            x[4] ^= this._rotl(x[0] + x[12], 7);
            x[8] ^= this._rotl(x[4] + x[0], 9);
            x[12] ^= this._rotl(x[8] + x[4], 13);
            x[0] ^= this._rotl(x[12] + x[8], 18);

            x[9] ^= this._rotl(x[5] + x[1], 7);
            x[13] ^= this._rotl(x[9] + x[5], 9);
            x[1] ^= this._rotl(x[13] + x[9], 13);
            x[5] ^= this._rotl(x[1] + x[13], 18);

            x[14] ^= this._rotl(x[10] + x[6], 7);
            x[2] ^= this._rotl(x[14] + x[10], 9);
            x[6] ^= this._rotl(x[2] + x[14], 13);
            x[10] ^= this._rotl(x[6] + x[2], 18);

            x[3] ^= this._rotl(x[15] + x[11], 7);
            x[7] ^= this._rotl(x[3] + x[15], 9);
            x[11] ^= this._rotl(x[7] + x[3], 13);
            x[15] ^= this._rotl(x[11] + x[7], 18);

            // Row Rounds
            x[1] ^= this._rotl(x[0] + x[3], 7);
            x[2] ^= this._rotl(x[1] + x[0], 9);
            x[3] ^= this._rotl(x[2] + x[1], 13);
            x[0] ^= this._rotl(x[3] + x[2], 18);

            x[6] ^= this._rotl(x[5] + x[4], 7);
            x[7] ^= this._rotl(x[6] + x[5], 9);
            x[4] ^= this._rotl(x[7] + x[6], 13);
            x[5] ^= this._rotl(x[4] + x[7], 18);

            x[11] ^= this._rotl(x[10] + x[9], 7);
            x[8] ^= this._rotl(x[11] + x[10], 9);
            x[9] ^= this._rotl(x[8] + x[11], 13);
            x[10] ^= this._rotl(x[9] + x[8], 18);

            x[12] ^= this._rotl(x[15] + x[14], 7);
            x[13] ^= this._rotl(x[12] + x[15], 9);
            x[14] ^= this._rotl(x[13] + x[12], 13);
            x[15] ^= this._rotl(x[14] + x[13], 18);
        }
    }

    _rotl(v, c) {
        return (v << c) | (v >>> (32 - c));
    }
}