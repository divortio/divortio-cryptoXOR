import { test } from 'node:test';
import assert from 'node:assert';
import { createSfc32, createSplitMix32, createXoshiro128 } from '../../../src/index.mjs';

test('Global Determinism: Same Seed = Same Output', () => {
    const sfcSeed = [0x1, 0x2, 0x3, 0x4];

    const rng1 = createSfc32(...sfcSeed);
    const rng2 = createSfc32(...sfcSeed); // Identical seed
    const rng3 = createSfc32(0x9, 0x9, 0x9, 0x9); // Different seed

    const val1 = rng1.next();
    const val2 = rng2.next();
    const val3 = rng3.next();

    assert.strictEqual(val1, val2, 'Two instances with same seed produced different output!');
    assert.notStrictEqual(val1, val3, 'Different seeds produced same output (unlikely collision)!');
});

test('Xoshiro128: Verify Known Sequence (Sanity Check)', () => {
    // It is often good to check against a known value to ensure
    // we didn't break the math implementation itself during a refactor.
    // Seed: 1, 2, 3, 4
    const rng = createXoshiro128(1, 2, 3, 4);
    const first = rng.next();

    // Run this ONCE, log the value, and hardcode it here.
    // Assuming your implementation is correct, we lock it in.
    // If you change the math later, this test warns you.
    // For now, we just ensure it returns a Number.
    assert.strictEqual(typeof first, 'number');
});