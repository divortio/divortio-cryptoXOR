import { test } from 'node:test';
import assert from 'node:assert';
import { createSfc32 } from '../../../src/index.mjs';

test('SFC32: Stream vs Core Consistency', () => {
    const seed = [1, 2, 3, 4];

    // Instance 1: Core
    const rngCore = createSfc32(...seed);

    // Instance 2: Stream
    const rngStream = createSfc32(...seed);

    const COUNT = 1000;
    const coreResults = new Uint32Array(COUNT);

    // Generate 1000 numbers via Core
    for (let i = 0; i < COUNT; i++) {
        coreResults[i] = rngCore.next();
    }

    // Generate 1000 numbers (4000 bytes) via Stream
    const streamBuffer = new Uint8Array(COUNT * 4);
    rngStream.stream(streamBuffer);
    const streamResults = new Uint32Array(streamBuffer.buffer, streamBuffer.byteOffset, COUNT);

    // Compare
    assert.deepStrictEqual(streamResults, coreResults, "Stream output does not match Core output!");
});