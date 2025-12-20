/**
 * @module FastRC4
 * @description A V8-optimized implementation of RC4.
 * **Role:** The baseline for "Byte-Oriented" stream ciphers.
 * **Note:** RC4 is cryptographically broken, but useful for performance comparison.
 */
export class FastRC4 {
    /**
     * @param {Uint8Array} key - Variable length key (usually 5-256 bytes).
     * @param {Uint8Array} [nonce] - Ignored (RC4 is KDF-less).
     */
    constructor(key, nonce) {
        if (typeof key === 'string') key = new TextEncoder().encode(key);

        // State Initialization (KSA)
        this.s = new Uint8Array(256);
        this.i = 0;
        this.j = 0;

        for (let i = 0; i < 256; i++) {
            this.s[i] = i;
        }

        let j = 0;
        const keyLen = key.length;
        for (let i = 0; i < 256; i++) {
            j = (j + this.s[i] + key[i % keyLen]) & 255;
            // Swap
            const t = this.s[i];
            this.s[i] = this.s[j];
            this.s[j] = t;
        }
    }

    /**
     * Processes buffer in-place (or copy).
     * RC4 generates a keystream byte and XORs it with the input.
     * @param {Uint8Array} input
     * @returns {Uint8Array}
     */
    process(input) {
        const output = new Uint8Array(input);
        const len = output.length;
        const s = this.s;
        let i = this.i;
        let j = this.j;

        // Hot Loop (Byte-by-Byte)
        for (let k = 0; k < len; k++) {
            i = (i + 1) & 255;
            j = (j + s[i]) & 255;

            // Swap
            const si = s[i];
            const sj = s[j];
            s[i] = sj;
            s[j] = si;

            // XOR
            output[k] ^= s[(si + sj) & 255];
        }

        // Save state
        this.i = i;
        this.j = j;
        return output;
    }
}

export default FastRC4;