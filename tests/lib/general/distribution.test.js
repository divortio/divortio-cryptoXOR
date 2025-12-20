import { test } from 'node:test';
import assert from 'node:assert';
import { createSfc32, createSplitMix32, createXoshiro128 } from '../../../src/index.mjs';

// Helper to normalize any 32-bit int to [0, 1) double
const toDouble = (int32) => (int32 >>> 0) / 4294967296;

const factories = [
    { name: 'SFC32ECC',      fn: createSfc32,      args: [1, 2, 3, 4] },
    { name: 'SplitMix32ECC', fn: createSplitMix32, args: [12345] },
    { name: 'Xoshiro128ECC', fn: createXoshiro128, args: [1, 2, 3, 4] }
];

test('Statistical Smoke Test: Output looks roughly random', async (t) => {
    for (const { name, fn, args } of factories) {
        await t.test(`${name} produces valid distribution`, () => {
            const rng = fn(...args);
            const SAMPLES = 10000;
            let sum = 0;

            for(let i=0; i<SAMPLES; i++) {
                const val = rng.next();

                // FIX: Allow full Unsigned 32-bit range (0 to 0xFFFFFFFF)
                // Note: In JS, bitwise ops return signed ints (-2B to 2B), but >>> 0 casts to unsigned.
                // Our PRNGs return >>> 0, so they are always positive 0 to 4B.
                assert.ok(val >= 0 && val <= 4294967295, `Value ${val} out of UInt32 range`);

                sum += toDouble(val);
            }

            const average = sum / SAMPLES;

            // Check 2: Average should be close to 0.5
            assert.ok(average > 0.48 && average < 0.52, `Average ${average} is suspiciously far from 0.5`);
        });
    }
});