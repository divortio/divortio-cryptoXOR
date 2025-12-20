import { test } from 'node:test';
import assert from 'node:assert';
import { createSfc32, createSplitMix32, createXoshiro128 } from '../../../src/index.mjs';

const factories = [
    { name: 'SFC32ECC',      fn: createSfc32,      seed: [1, 2, 3, 4] },
    { name: 'SplitMix32ECC', fn: createSplitMix32, seed: 12345 },
    { name: 'Xoshiro128ECC', fn: createXoshiro128, seed: [1, 2, 3, 4] }
];

factories.forEach(({ name, fn, seed }) => {

    test(`${name}: Handles Zero-Length Buffer`, () => {
        const args = Array.isArray(seed) ? seed : [seed];
        const rng = fn(...args);
        const buffer = new Uint8Array(0);
        rng.stream(buffer);
        assert.strictEqual(buffer.length, 0);
    });

    test(`${name}: Handles Unaligned Buffer Sizes (e.g. 13 bytes)`, () => {
        const args = Array.isArray(seed) ? seed : [seed];
        const rng = fn(...args);

        const size = 13;
        const buffer = new Uint8Array(size);
        buffer.fill(0xFF); // Guard value

        rng.stream(buffer);

        // --- THE FIX ---
        // Previously we asserted it WAS 0xFF. Now we assert it is NOT 0xFF.
        // (Probability of random byte being 0xFF is 1/256, so technically this could flake rarely,
        // but for a unit test on a PRNG, checking "did it change" is usually sufficient).

        // Check the main body
        assert.notStrictEqual(buffer[0], 0xFF, "Main buffer was not written");

        // Check the tail (Byte 13 / Index 12)
        assert.notStrictEqual(buffer[12], 0xFF, `Tail byte (index 12) was not written! Expected random byte, got 0xFF.`);
    });
});