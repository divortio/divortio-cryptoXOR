const rotl = (x, k) => (x << k) | (x >>> (32 - k));

export function createXoshiro128(seed_a, seed_b, seed_c, seed_d) {
    let s0 = seed_a >>> 0, s1 = seed_b >>> 0, s2 = seed_c >>> 0, s3 = seed_d >>> 0;

    const next = () => {
        const result = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;
        const t = (s1 << 9);
        s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 11);
        return result;
    };

    const stream = (buffer) => {
        const len = buffer.byteLength;
        const len32 = len >>> 2;
        const view32 = new Uint32Array(buffer.buffer, buffer.byteOffset, len32);

        for (let i = 0; i < len32; i++) {
            view32[i] = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;
            const t = (s1 << 9);
            s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 11);
        }

        const remaining = len & 3;
        if (remaining > 0) {
            const val = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;
            const t = (s1 << 9);
            s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 11);
            const offset = len32 * 4;
            if (remaining === 1) buffer[offset] = val;
            else if (remaining === 2) { buffer[offset] = val; buffer[offset + 1] = val >>> 8; }
            else { buffer[offset] = val; buffer[offset + 1] = val >>> 8; buffer[offset + 2] = val >>> 16; }
        }
    };

    return { next, stream };
}