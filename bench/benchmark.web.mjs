import { performance } from 'perf_hooks'; // Node-specific (ignored by bundlers usually, or polyfilled)
// In Node 19+, 'crypto' is global. In older Node, we might need:
// import crypto from 'node:crypto';
// if (!globalThis.crypto) globalThis.crypto = crypto.webcrypto;

// -----------------------------------------------------------------------------
// IMPORTS: CryptoXOR Primitives (The Home Team)
// -----------------------------------------------------------------------------
import {
    sfc32Stream,
    splitmix32Stream,
    xoshiro128Stream
} from '../src/index.mjs';

// -----------------------------------------------------------------------------
// IMPORTS: V8 Optimized Software (The Visitors)
// -----------------------------------------------------------------------------
import FastChaCha20 from './libs/v8/chaCha20.v8.js';
import FastSalsa20 from './libs/v8/salsa20.v8.js';
import FastRabbit from './libs/v8/rabbit.v8.js';
import { FastRC4 } from './libs/v8/rc4.v8.js';
import FastAesSoft from './libs/v8/aes128.v8.js';

// -----------------------------------------------------------------------------
// IMPORTS: Web Crypto (The Standard)
// -----------------------------------------------------------------------------
import { Aes128CtrWeb } from './libs/web/aes128.ctr.web.js';
import { Aes256CtrWeb } from './libs/web/aes256.ctr.web.js';
import { Aes128GcmWeb } from './libs/web/aes128.gcm.web.js';
import { Aes256GcmWeb } from './libs/web/aes256.gcm.web.js';
import { Aes128CbcWeb } from './libs/web/aes128.cbc.web.js';
import { Aes256CbcWeb } from './libs/web/aes256.cbc.web.js';
import { HmacSha256Web } from './libs/web/hmac.sha256.web.js';

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

const CONFIG = {
    SAMPLES: 30,            // Samples per test
    MIN_SAMPLE_TIME_MS: 50, // Minimum duration per sample
    WARMUP_SAMPLES: 5,
    SIZES: [
        16,           // 16 B   (IDs)
        1024,         // 1 KB   (Packets)
        64 * 1024,    // 64 KB  (Blocks)
        1024 * 1024,  // 1 MB   (Files)
    ]
};

// -----------------------------------------------------------------------------
// HELPER: Wrappers
// -----------------------------------------------------------------------------

// 1. Sync Wrapper (for Software Algos)
function wrapSync(Name, ClassRef, keySize, nonceSize) {
    const key = new Uint8Array(keySize);
    const nonce = new Uint8Array(nonceSize);
    // Fill with dummy data
    for(let i=0; i<keySize; i++) key[i] = i;

    // Instantiate once to test THROUGHPUT of processing, not setup time
    const instance = new ClassRef(key, nonce);

    return {
        name: Name,
        type: 'sync',
        fn: (buffer) => instance.process(buffer)
    };
}

// 2. Stream Function Wrapper (for CryptoXOR functional API)
function wrapFunc(Name, func) {
    return {
        name: Name,
        type: 'sync',
        fn: (buffer) => func(buffer)
    };
}

// 3. Async Wrapper (for Web Crypto)
function wrapAsync(Name, ClassRef, keySize, nonceSize) {
    const key = new Uint8Array(keySize);
    const nonce = new Uint8Array(nonceSize);
    for(let i=0; i<keySize; i++) key[i] = i;

    // Instance holds the KeyPromise
    const instance = new ClassRef(key, nonce);

    return {
        name: Name,
        type: 'async',
        // process returns a Promise
        fn: (buffer) => instance.process(buffer)
    };
}

// -----------------------------------------------------------------------------
// BENCHMARK ENGINE
// -----------------------------------------------------------------------------

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    else return (bytes / 1048576).toFixed(0) + ' MB';
}

async function runBenchmark() {
    console.log(`\n================================================================================`);
    console.log(`WEB & SOFTWARE CRYPTO BENCHMARK`);
    console.log(`================================================================================`);
    console.log(`Env:       ${typeof window !== 'undefined' ? 'Browser' : 'Node.js (WebCrypto)'}`);
    console.log(`Config:    ${CONFIG.SAMPLES} Samples, Max Size ${formatBytes(Math.max(...CONFIG.SIZES))}`);
    console.log(`================================================================================\n`);

    const candidates = [
        // --- 1. CryptoXOR (Pure Software) ---
        wrapFunc('sfc32-stream', sfc32Stream),
        wrapFunc('xoshiro128-stream', xoshiro128Stream),
        wrapFunc('splitmix32-stream', splitmix32Stream),

        // --- 2. V8 Optimized Software ---
        wrapSync('ChaCha20 (V8)', FastChaCha20, 32, 12),
        wrapSync('Salsa20 (V8)', FastSalsa20, 32, 8),
        wrapSync('Rabbit (V8)', FastRabbit, 16, 8),
        wrapSync('RC4 (V8)', FastRC4, 16, 0),
        wrapSync('AES-128 (V8-TTable)', FastAesSoft, 16, 16),

        // --- 3. Web Crypto (Hardware) ---
        wrapAsync('AES-128-CTR (Web)', Aes128CtrWeb, 16, 12),
        wrapAsync('AES-256-CTR (Web)', Aes256CtrWeb, 32, 12),
        wrapAsync('AES-128-GCM (Web)', Aes128GcmWeb, 16, 12),
        wrapAsync('AES-256-GCM (Web)', Aes256GcmWeb, 32, 12),
        wrapAsync('AES-128-CBC (Web)', Aes128CbcWeb, 16, 16),
        wrapAsync('HMAC-SHA256 (Web)', HmacSha256Web, 32, 0),
    ];

    const allResults = {};

    for (const size of CONFIG.SIZES) {
        const sizeLabel = formatBytes(size);
        console.log(`\n--- Test Suite: ${sizeLabel} ---`);

        // Allocate buffer once
        const buffer = new Uint8Array(size);

        const sizeResults = [];

        for (const cand of candidates) {
            // Check for WebCrypto availability in Node legacy environments
            if (cand.name.includes('(Web)') && !globalThis.crypto) {
                console.warn(`Skipping ${cand.name} (No WebCrypto)`);
                continue;
            }

            process?.stdout?.write(`  Running ${cand.name.padEnd(25)} ... `);

            const runner = cand.fn;
            const isAsync = cand.type === 'async';

            try {
                // 1. Warmup
                for(let i=0; i<CONFIG.WARMUP_SAMPLES; i++) {
                    const ret = runner(buffer);
                    if (isAsync) await ret;
                }

                // 2. Calibration
                let iterations = 1;
                while(true) {
                    const start = performance.now();
                    for(let i=0; i<iterations; i++) {
                        const ret = runner(buffer);
                        if (isAsync) await ret;
                    }
                    const dur = performance.now() - start;
                    if (dur >= CONFIG.MIN_SAMPLE_TIME_MS) break;
                    iterations *= 2;
                }

                // 3. Measure
                const samples = [];
                for(let s=0; s<CONFIG.SAMPLES; s++) {
                    const start = performance.now();
                    for(let i=0; i<iterations; i++) {
                        const ret = runner(buffer);
                        if (isAsync) await ret;
                    }
                    const dur = performance.now() - start;

                    // Calc MB/s
                    const totalBytes = size * iterations;
                    const sec = dur / 1000;
                    const mbps = (totalBytes / 1024 / 1024) / sec;
                    samples.push(mbps);
                }

                const avgMbps = samples.reduce((a,b)=>a+b,0) / samples.length;

                if (process?.stdout) {
                    process.stdout.write(`Done. (${avgMbps.toFixed(2)} MB/s)\n`);
                } else {
                    console.log(`  ${cand.name}: ${avgMbps.toFixed(2)} MB/s`);
                }

                sizeResults.push({ name: cand.name, mbps: avgMbps });

            } catch (e) {
                console.error(`\nFAILED ${cand.name}:`, e.message);
            }
        }

        // Sort
        sizeResults.sort((a,b) => b.mbps - a.mbps);
        allResults[size] = sizeResults;
    }

    // --- Report ---
    console.log(`\n\n================================================================================`);
    console.log(`FINAL RESULTS: THROUGHPUT (MB/s)`);
    console.log(`================================================================================`);

    const tableData = {};
    candidates.forEach(c => tableData[c.name] = {});

    for (const size of CONFIG.SIZES) {
        if (!allResults[size]) continue;
        allResults[size].forEach(r => {
            tableData[r.name][formatBytes(size)] = r.mbps.toFixed(2);
        });
    }

    console.table(tableData);
}

runBenchmark().catch(console.error);