import { test } from 'node:test';
import assert from 'node:assert';
import { createXoshiro128 } from '../../../src/index.mjs';

test('Xoshiro128ECC: Stream vs Core Consistency', () => {
    const seed = [0x11111111, 0x22222222, 0x33333333, 0x44444444];

    const rngCore = createXoshiro128(...seed);
    const rngStream = createXoshiro128(...seed);

    const COUNT = 1000;
    const coreResults = new Uint32Array(COUNT);

    for (let i = 0; i < COUNT; i++) coreResults[i] = rngCore.next();

    const streamBuffer = new Uint8Array(COUNT * 4);
    rngStream.stream(streamBuffer);
    const streamResults = new Uint32Array(streamBuffer.buffer, streamBuffer.byteOffset, COUNT);

    assert.deepStrictEqual(streamResults, coreResults);
});