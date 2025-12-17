export function createSplitMix32(seed) {
    let x = seed >>> 0;

    const next = () => {
        x = (x + 0x9e3779b9) | 0;
        let t = x;
        t = Math.imul(t ^ (t >>> 15), 0x85ebca6b);
        t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
        return ((t ^ (t >>> 16)) >>> 0);
    };

    const stream = (buffer) => {
        const len = buffer.byteLength;
        const len32 = len >>> 2;
        const view32 = new Uint32Array(buffer.buffer, buffer.byteOffset, len32);

        for (let i = 0; i < len32; i++) {
            x = (x + 0x9e3779b9) | 0;
            let t = x;
            t = Math.imul(t ^ (t >>> 15), 0x85ebca6b);
            t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
            view32[i] = ((t ^ (t >>> 16)) >>> 0);
        }

        const remaining = len & 3;
        if (remaining > 0) {
            x = (x + 0x9e3779b9) | 0;
            let t = x;
            t = Math.imul(t ^ (t >>> 15), 0x85ebca6b);
            t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
            const val = (t ^ (t >>> 16)) >>> 0;
            const offset = len32 * 4;
            if (remaining === 1) buffer[offset] = val;
            else if (remaining === 2) { buffer[offset] = val; buffer[offset + 1] = val >>> 8; }
            else { buffer[offset] = val; buffer[offset + 1] = val >>> 8; buffer[offset + 2] = val >>> 16; }
        }
    };

    return { next, stream };
}