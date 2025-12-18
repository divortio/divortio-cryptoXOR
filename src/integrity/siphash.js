export class SipHash {
    constructor(key) {
        if (!key || key.length !== 16) {
            throw new Error('SipHash key must be 16 bytes');
        }

        // Initialize state (v0, v1, v2, v3)
        // Reading 64-bit integers from 16-byte key as 4x 32-bit integers for bitwise ops
        // JS uses BigInt or two 32-bit numbers for 64-bit logic.
        // For performance in JS, we often simulate 64-bit rotation using pairs of 32-bit (hi, lo).

        const k0_lo = key[0] | (key[1] << 8) | (key[2] << 16) | (key[3] << 24);
        const k0_hi = key[4] | (key[5] << 8) | (key[6] << 16) | (key[7] << 24);
        const k1_lo = key[8] | (key[9] << 8) | (key[10] << 16) | (key[11] << 24);
        const k1_hi = key[12] | (key[13] << 8) | (key[14] << 16) | (key[15] << 24);

        // Magic constants
        this.v0_lo = 0x736f6d65 ^ k0_lo; this.v0_hi = 0x74656264 ^ k0_hi;
        this.v1_lo = 0x646f7261 ^ k1_lo; this.v1_hi = 0x6c796765 ^ k1_hi;
        this.v2_lo = 0x6c796765 ^ k0_lo; this.v2_hi = 0x74656264 ^ k0_hi;
        this.v3_lo = 0x74656264 ^ k1_lo; this.v3_hi = 0x646f7261 ^ k1_hi;

        this.buf = new Uint8Array(8);
        this.bufLen = 0;
        this.msgLen = 0;
    }

    update(msg) {
        this.msgLen += msg.length;
        let offset = 0;
        let len = msg.length;

        while (len > 0) {
            let take = 8 - this.bufLen;
            if (take > len) take = len;

            this.buf.set(msg.subarray(offset, offset + take), this.bufLen);
            this.bufLen += take;
            offset += take;
            len -= take;

            if (this.bufLen === 8) {
                this._processBlock(this.buf);
                this.bufLen = 0;
            }
        }
    }

    finish() {
        const len = this.msgLen % 256;
        const left = this.bufLen;

        // Zero out remaining buffer
        for (let i = left; i < 7; i++) {
            this.buf[i] = 0;
        }

        // Set the length byte at the end
        this.buf[7] = len;

        this._processBlock(this.buf);

        // Finalize
        this.v2_lo ^= 0xff;
        this.v2_hi ^= 0; // Effectively no change, just keeping symmetry

        // 4 rounds
        this._sipRound();
        this._sipRound();
        this._sipRound();
        this._sipRound();

        const out_lo = this.v0_lo ^ this.v1_lo ^ this.v2_lo ^ this.v3_lo;
        const out_hi = this.v0_hi ^ this.v1_hi ^ this.v2_hi ^ this.v3_hi;

        // Return 8 bytes
        const tag = new Uint8Array(8);
        tag[0] = out_lo; tag[1] = out_lo >>> 8; tag[2] = out_lo >>> 16; tag[3] = out_lo >>> 24;
        tag[4] = out_hi; tag[5] = out_hi >>> 8; tag[6] = out_hi >>> 16; tag[7] = out_hi >>> 24;
        return tag;
    }

    _processBlock(block) {
        const m_lo = block[0] | (block[1] << 8) | (block[2] << 16) | (block[3] << 24);
        const m_hi = block[4] | (block[5] << 8) | (block[6] << 16) | (block[7] << 24);

        this.v3_lo ^= m_lo;
        this.v3_hi ^= m_hi;

        // 2 rounds (SipHash-2-4)
        this._sipRound();
        this._sipRound();

        this.v0_lo ^= m_lo;
        this.v0_hi ^= m_hi;
    }

    _sipRound() {
        // v0 += v1
        let t_lo = (this.v0_lo + this.v1_lo) | 0;
        let t_hi = (this.v0_hi + this.v1_hi + ((t_lo >>> 0) < (this.v0_lo >>> 0) ? 1 : 0)) | 0;
        this.v0_lo = t_lo; this.v0_hi = t_hi;

        // v2 += v3
        t_lo = (this.v2_lo + this.v3_lo) | 0;
        t_hi = (this.v2_hi + this.v3_hi + ((t_lo >>> 0) < (this.v2_lo >>> 0) ? 1 : 0)) | 0;
        this.v2_lo = t_lo; this.v2_hi = t_hi;

        // v1 = rotl(v1, 13)
        let v1l = this.v1_lo, v1h = this.v1_hi;
        this.v1_lo = (v1l << 13) | (v1h >>> 19);
        this.v1_hi = (v1h << 13) | (v1l >>> 19);

        // v3 = rotl(v3, 16)
        let v3l = this.v3_lo, v3h = this.v3_hi;
        this.v3_lo = (v3l << 16) | (v3h >>> 16);
        this.v3_hi = (v3h << 16) | (v3l >>> 16);

        // v1 ^= v0; v3 ^= v2;
        this.v1_lo ^= this.v0_lo; this.v1_hi ^= this.v0_hi;
        this.v3_lo ^= this.v2_lo; this.v3_hi ^= this.v2_hi;

        // v0 = rotl(v0, 32) -> swap lo/hi
        let tmp = this.v0_lo; this.v0_lo = this.v0_hi; this.v0_hi = tmp;

        // v2 += v1
        t_lo = (this.v2_lo + this.v1_lo) | 0;
        t_hi = (this.v2_hi + this.v1_hi + ((t_lo >>> 0) < (this.v2_lo >>> 0) ? 1 : 0)) | 0;
        this.v2_lo = t_lo; this.v2_hi = t_hi;

        // v0 += v3
        t_lo = (this.v0_lo + this.v3_lo) | 0;
        t_hi = (this.v0_hi + this.v3_hi + ((t_lo >>> 0) < (this.v0_lo >>> 0) ? 1 : 0)) | 0;
        this.v0_lo = t_lo; this.v0_hi = t_hi;

        // v1 = rotl(v1, 17)
        v1l = this.v1_lo; v1h = this.v1_hi;
        this.v1_lo = (v1l << 17) | (v1h >>> 15);
        this.v1_hi = (v1h << 17) | (v1l >>> 15);

        // v3 = rotl(v3, 21)
        v3l = this.v3_lo; v3h = this.v3_hi;

        // --- FIX HERE (Line 60 in original log) ---
        // Was: new_v3l = ...
        // Now properly declared with let and assigned to state
        let new_v3l = (v3l << 21) | (v3h >>> 11);
        let new_v3h = (v3h << 21) | (v3l >>> 11);
        this.v3_lo = new_v3l;
        this.v3_hi = new_v3h;

        // v1 ^= v2; v3 ^= v0;
        this.v1_lo ^= this.v2_lo; this.v1_hi ^= this.v2_hi;
        this.v3_lo ^= this.v0_lo; this.v3_hi ^= this.v0_hi;

        // v2 = rotl(v2, 32) -> swap lo/hi
        tmp = this.v2_lo; this.v2_lo = this.v2_hi; this.v2_hi = tmp;
    }
}