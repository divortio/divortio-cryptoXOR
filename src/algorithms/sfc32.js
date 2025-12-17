export function createSfc32(seed_a, seed_b, seed_c, seed_d) {
    let a = seed_a >>> 0;
    let b = seed_b >>> 0;
    let c = seed_c >>> 0;
    let d = seed_d >>> 0;

    const next = () => {
        let t = (a + b) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0);
    };

    const stream = (buffer) => {
        const len = buffer.byteLength;
        const len32 = len >>> 2;
        const view32 = new Uint32Array(buffer.buffer, buffer.byteOffset, len32);

        // Main Loop
        for (let i = 0; i < len32; i++) {
            let t = (a + b) | 0;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0;
            c = (c << 21) | (c >>> 11);
            c = (c + t) | 0;
            view32[i] = (t >>> 0);
        }

        // Tail Handling
        const remaining = len & 3;
        if (remaining > 0) {
            let t = (a + b) | 0;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0;
            c = (c << 21) | (c >>> 11);
            c = (c + t) | 0;
            const offset = len32 * 4;
            if (remaining === 1) buffer[offset] = t;
            else if (remaining === 2) { buffer[offset] = t; buffer[offset + 1] = t >>> 8; }
            else { buffer[offset] = t; buffer[offset + 1] = t >>> 8; buffer[offset + 2] = t >>> 16; }
        }
    };

    return { next, stream };
}