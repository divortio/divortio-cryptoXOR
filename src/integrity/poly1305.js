export class Poly1305 {
    constructor(key) {
        if (!key || key.length !== 32) {
            throw new Error('Poly1305 key must be 32 bytes');
        }

        this.buffer = new Uint8Array(16);
        this.bufferLen = 0;

        // Accumulator (h)
        this.h0 = 0;
        this.h1 = 0;
        this.h2 = 0;
        this.h3 = 0;
        this.h4 = 0;

        // Clamp the key (r)
        // r &= 0xffffffc0ffffffc0ffffffc0fffffff
        const t0 = key[0] | (key[1] << 8) | (key[2] << 16) | (key[3] << 24);
        const t1 = key[4] | (key[5] << 8) | (key[6] << 16) | (key[7] << 24);
        const t2 = key[8] | (key[9] << 8) | (key[10] << 16) | (key[11] << 24);
        const t3 = key[12] | (key[13] << 8) | (key[14] << 16) | (key[15] << 24);

        // Precompute r limbs (26-bit)
        this.r0 = t0 & 0x3ffffff;
        this.r1 = ((t0 >>> 26) | (t1 << 6)) & 0x3ffff03;
        this.r2 = ((t1 >>> 20) | (t2 << 12)) & 0x3ffc0ff;
        this.r3 = ((t2 >>> 14) | (t3 << 18)) & 0x3f03fff;
        this.r4 = (t3 >>> 8) & 0x00fffff;

        // Precompute 5 * r (s) for modular reduction
        this.s1 = this.r1 * 5;
        this.s2 = this.r2 * 5;
        this.s3 = this.r3 * 5;
        this.s4 = this.r4 * 5;

        // Save pad (s part of the key) for the final addition
        this.pad = new Uint8Array(16);
        this.pad.set(key.subarray(16));
    }

    update(msg) {
        let len = msg.length;
        let offset = 0;

        while (len > 0) {
            // Fill buffer
            let take = 16 - this.bufferLen;
            if (take > len) take = len;

            this.buffer.set(msg.subarray(offset, offset + take), this.bufferLen);
            this.bufferLen += take;
            offset += take;
            len -= take;

            // If buffer full, process block
            if (this.bufferLen === 16) {
                this._processBlock(this.buffer, false);
                this.bufferLen = 0;
            }
        }
    }

    // Processes a single 16-byte block
    _processBlock(block, isFinal) {
        // Read block as 26-bit limbs
        const t0 = block[0] | (block[1] << 8) | (block[2] << 16) | (block[3] << 24);
        const t1 = block[4] | (block[5] << 8) | (block[6] << 16) | (block[7] << 24);
        const t2 = block[8] | (block[9] << 8) | (block[10] << 16) | (block[11] << 24);
        const t3 = block[12] | (block[13] << 8) | (block[14] << 16) | (block[15] << 24);

        // Add block to accumulator
        this.h0 += t0 & 0x3ffffff;
        this.h1 += ((t0 >>> 26) | (t1 << 6)) & 0x3ffffff;
        this.h2 += ((t1 >>> 20) | (t2 << 12)) & 0x3ffffff;
        this.h3 += ((t2 >>> 14) | (t3 << 18)) & 0x3ffffff;
        this.h4 += (t3 >>> 8);

        // If final block (partial or full), add the high bit
        if (isFinal) {
            // Padding logic handled outside or implicitly by the high bit here
            // Standard Poly1305 adds 2^128 to the message block
            // 128th bit falls into h4
            // However, we track partials in finish().
            // This function assumes a full 16 bytes unless managed by finish logic.
            // Standard implementation usually sets the bit here:
            this.h4 += (1 << 24);
        } else {
            this.h4 += (1 << 24);
        }

        this._multiply();
    }

    // This was likely where your code was failing
    _multiply() {
        // Compute polynomial multiplication
        // d0...d4 must be 'let' to allow carry propagation (the += operations)

        let d0 = (this.h0 * this.r0) + (this.h1 * this.s4) + (this.h2 * this.s3) + (this.h3 * this.s2) + (this.h4 * this.s1);
        let d1 = (this.h0 * this.r1) + (this.h1 * this.r0) + (this.h2 * this.s4) + (this.h3 * this.s3) + (this.h4 * this.s2);
        let d2 = (this.h0 * this.r2) + (this.h1 * this.r1) + (this.h2 * this.r0) + (this.h3 * this.s4) + (this.h4 * this.s3);
        let d3 = (this.h0 * this.r3) + (this.h1 * this.r2) + (this.h2 * this.r1) + (this.h3 * this.r0) + (this.h4 * this.s4);
        let d4 = (this.h0 * this.r4) + (this.h1 * this.r3) + (this.h2 * this.r2) + (this.h3 * this.r1) + (this.h4 * this.r0);

        // Propagate carries
        // 26-bit limb reduction
        let c;

        c = d0 >>> 26; d0 &= 0x3ffffff; d1 += c;
        c = d1 >>> 26; d1 &= 0x3ffffff; d2 += c;
        c = d2 >>> 26; d2 &= 0x3ffffff; d3 += c;
        c = d3 >>> 26; d3 &= 0x3ffffff; d4 += c;
        c = d4 >>> 26; d4 &= 0x3ffffff; d0 += c * 5;

        // Final carry after reduction
        c = d0 >>> 26; d0 &= 0x3ffffff; d1 += c;

        // Update state
        this.h0 = d0;
        this.h1 = d1;
        this.h2 = d2;
        this.h3 = d3;
        this.h4 = d4;
    }

    finish() {
        // Process remaining bytes
        if (this.bufferLen > 0) {
            // Create a temp buffer initialized to 0
            const block = new Uint8Array(16);
            block.set(this.buffer.subarray(0, this.bufferLen));

            // Set the "1" bit immediately after the data
            block[this.bufferLen] = 1;

            // We handle the manual "add 1 bit" logic here slightly differently
            // than the standard loop to accommodate partials.
            // But for cleaner code, we can re-use the math logic:

            const t0 = block[0] | (block[1] << 8) | (block[2] << 16) | (block[3] << 24);
            const t1 = block[4] | (block[5] << 8) | (block[6] << 16) | (block[7] << 24);
            const t2 = block[8] | (block[9] << 8) | (block[10] << 16) | (block[11] << 24);
            const t3 = block[12] | (block[13] << 8) | (block[14] << 16) | (block[15] << 24);

            this.h0 += t0 & 0x3ffffff;
            this.h1 += ((t0 >>> 26) | (t1 << 6)) & 0x3ffffff;
            this.h2 += ((t1 >>> 20) | (t2 << 12)) & 0x3ffffff;
            this.h3 += ((t2 >>> 14) | (t3 << 18)) & 0x3ffffff;
            this.h4 += (t3 >>> 8);

            // Since we manually set the padding bit in block[],
            // we don't add the standard (1<<24) to h4 here,
            // but we do need to account for the bit position if it spilled over.
            // Actually, the simpler way is to treat the high bit of the block as the stop bit.
            // In this specific 26-bit implementation, the stop bit is usually added to h4
            // if the block is full, or logically OR'd into the stream.

            // Simpler approach for the partial block in this 26-bit arch:
            // Just run multiply. The bits are already in h0-h4.
            this._multiply();
        }

        // Final Reduction (Full modulation)
        // h = h % (2^130 - 5)

        // We do a "tentative" subtraction of p to see if h >= p
        let h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
        let c;

        // Fully carry one last time
        c = h1 >>> 26; h1 &= 0x3ffffff; h2 += c;
        c = h2 >>> 26; h2 &= 0x3ffffff; h3 += c;
        c = h3 >>> 26; h3 &= 0x3ffffff; h4 += c;
        c = h4 >>> 26; h4 &= 0x3ffffff; h0 += c * 5;
        c = h0 >>> 26; h0 &= 0x3ffffff; h1 += c;

        // Compute g = h - 5
        let g0 = h0 + 5; c = g0 >>> 26; g0 &= 0x3ffffff;
        let g1 = h1 + c; c = g1 >>> 26; g1 &= 0x3ffffff;
        let g2 = h2 + c; c = g2 >>> 26; g2 &= 0x3ffffff;
        let g3 = h3 + c; c = g3 >>> 26; g3 &= 0x3ffffff;
        let g4 = h4 + c - (1 << 26);

        // Select h if h < p, else g
        let mask = (g4 >>> 31) - 1; // mask is all 1s if g is negative (h < p)
        g0 &= mask; g1 &= mask; g2 &= mask; g3 &= mask; g4 &= mask;
        mask = ~mask;
        h0 = (h0 & mask) | g0;
        h1 = (h1 & mask) | g1;
        h2 = (h2 & mask) | g2;
        h3 = (h3 & mask) | g3;
        h4 = (h4 & mask) | g4;

        // Convert back to 4 x 32-bit integers
        // (h0..h4 are 26-bit)
        // f0 = h0 | (h1 << 26)
        // f1 = (h1 >> 6) | (h2 << 20)
        // ...
        // Note: We need to use BigInt or careful u32 shifting to avoid overflow/signed issues.
        // Given the environment is generic JS, let's use BigInt for the final combination
        // to ensure bit-perfect conversion, or stick to u32 reconstruction.

        // Reconstruction using u32 (safe):
        let f0 = (h0)       | (h1 << 26);
        let f1 = (h1 >>> 6) | (h2 << 20);
        let f2 = (h2 >>> 12)| (h3 << 14);
        let f3 = (h3 >>> 18)| (h4 << 8);

        // Add the "s" key (pad)
        const s0 = this.pad[0] | (this.pad[1] << 8) | (this.pad[2] << 16) | (this.pad[3] << 24);
        const s1 = this.pad[4] | (this.pad[5] << 8) | (this.pad[6] << 16) | (this.pad[7] << 24);
        const s2 = this.pad[8] | (this.pad[9] << 8) | (this.pad[10] << 16) | (this.pad[11] << 24);
        const s3 = this.pad[12] | (this.pad[13] << 8) | (this.pad[14] << 16) | (this.pad[15] << 24);

        // 64-bit addition simulated with 32-bit ops
        // (f + s)
        let acc = (f0 >>> 0) + (s0 >>> 0);
        f0 = acc >>> 0;
        acc = (f1 >>> 0) + (s1 >>> 0) + (acc > 0xffffffff ? 1 : 0); // Logic for carry using doubles
        // Easier way:
        acc = f0 + s0; f0 = acc & 0xffffffff;
        let carry = acc > 0xffffffff ? 1 : 0; // JS numbers are doubles, safe up to 2^53

        acc = f1 + s1 + carry; f1 = acc & 0xffffffff;
        carry = acc > 0xffffffff ? 1 : 0;

        acc = f2 + s2 + carry; f2 = acc & 0xffffffff;
        carry = acc > 0xffffffff ? 1 : 0;

        acc = f3 + s3 + carry; f3 = acc & 0xffffffff;

        // Output tag
        const tag = new Uint8Array(16);
        tag[0] = f0; tag[1] = f0 >>> 8; tag[2] = f0 >>> 16; tag[3] = f0 >>> 24;
        tag[4] = f1; tag[5] = f1 >>> 8; tag[6] = f1 >>> 16; tag[7] = f1 >>> 24;
        tag[8] = f2; tag[9] = f2 >>> 8; tag[10] = f2 >>> 16; tag[11] = f2 >>> 24;
        tag[12] = f3; tag[13] = f3 >>> 8; tag[14] = f3 >>> 16; tag[15] = f3 >>> 24;

        return tag;
    }
}