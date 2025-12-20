import { test } from 'node:test';
import assert from 'node:assert';
import { createSfc32, createSplitMix32, createXoshiro128 } from '../../../src/index.mjs';

const factories = [
    { name: 'SFC32ECC',      fn: createSfc32,      args: [1, 2, 3, 4] },
    { name: 'SplitMix32ECC', fn: createSplitMix32, args: [1] }, // Note different arg count
    { name: 'Xoshiro128ECC', fn: createXoshiro128, args: [1, 2, 3, 4] }
];

test('Interface Contract: All variants must allow hot-swapping', async (t) => {
    for (const { name, fn, args } of factories) {
        await t.test(`${name} adheres to the standard API`, () => {
            const rng = fn(...args);

            // 1. Check .next()
            assert.strictEqual(typeof rng.next, 'function', '.next() missing');
            const val = rng.next();
            assert.strictEqual(typeof val, 'number', '.next() must return a number');

            // 2. Check .stream()
            assert.strictEqual(typeof rng.stream, 'function', '.stream() missing');
            const buf = new Uint8Array(16);
            const ret = rng.stream(buf);
            assert.strictEqual(ret, undefined, '.stream() should return void');
        });
    }
});