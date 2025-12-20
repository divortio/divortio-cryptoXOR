import { test } from 'node:test';
import assert from 'node:assert';
import { createSplitMix32 } from '../../../src/index.mjs';

test('SplitMix32ECC: Stream vs Core Consistency', () => {
    const seed = 0xDEADBEEF;

    const rngCore = createSplitMix32(seed);
    const rngStream = createSplitMix32(seed);

    const COUNT = 1000;
    const coreResults = new Uint32Array(COUNT);

    for (let i = 0; i < COUNT; i++) coreResults[i] = rngCore.next();

    const streamBuffer = new Uint8Array(COUNT * 4);
    rngStream.stream(streamBuffer);
    const streamResults = new Uint32Array(streamBuffer.buffer, streamBuffer.byteOffset, COUNT);

    assert.deepStrictEqual(streamResults, coreResults);
});