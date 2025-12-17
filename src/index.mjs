import { createSfc32 } from './algorithms/sfc32.js';
import { createSplitMix32 } from './algorithms/splitmix32.js';
import { createXoshiro128 } from './algorithms/xoshiro128.js';

// 1. Create Default Instances (Pre-seeded for immediate use)
const sfcDefault = createSfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, 0xDEADBEEF);
const smDefault = createSplitMix32(0xDEADBEEF);
const xosDefault = createXoshiro128(0x12345678, 0x90ABCDEF, 0xFEDCBA09, 0x87654321);

// 2. Export Helper Functions (The easy API)
export const sfc32 = sfcDefault.next;
export const sfc32Stream = sfcDefault.stream;

export const splitmix32 = smDefault.next;
export const splitmix32Stream = smDefault.stream;

export const xoshiro128 = xosDefault.next;
export const xoshiro128Stream = xosDefault.stream;

// 3. Export Factories (The Power User API)
export { createSfc32, createSplitMix32, createXoshiro128 };