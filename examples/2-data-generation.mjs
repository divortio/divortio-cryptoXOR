import { sfc32Stream } from '../src/index.mjs';

// ==========================================
// EXAMPLE 2: High-Speed Buffers
// ==========================================

// 1. Generating a Session ID or IV (16 bytes)
const iv = new Uint8Array(16);
sfc32Stream(iv);
console.log('Random IV (Hex):', Buffer.from(iv).toString('hex'));

// 2. Filling a Large Buffer (The Speed Demon)
// This uses the optimized loop inside src/algorithms/sfc32.js
const ONE_MB = 1024 * 1024;
const fileBuffer = new Uint8Array(ONE_MB * 10); // 10 MB

console.log('\nGenerating 10MB of random data...');
const start = performance.now();

sfc32Stream(fileBuffer);

const end = performance.now();
console.log(`Done in ${(end - start).toFixed(2)}ms`);

// 3. Verification (First 16 bytes)
console.log('First 16 bytes of file:', fileBuffer.slice(0, 16));