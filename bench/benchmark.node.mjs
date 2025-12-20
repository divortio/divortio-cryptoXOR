import { performance } from 'perf_hooks';
import os from 'os';
import v8 from 'v8';

// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------
// Internal PRNGs
import {
    sfc32, sfc32Stream,
    splitmix32, splitmix32Stream,
    xoshiro128, xoshiro128Stream
} from '../src/index.mjs';

// External Libs (ChaCha20)
// Ensure these files exist in /bench/libs/
import { ChaCha20Node } from './libs/node/chaCha20.node.js';
import FastChaCha20 from './libs/v8/chaCha20.v8.js';

import { StitchedCipherNode } from './libs/node/stitched.node.js';
import { Aes128CcmNode } from './libs/node/aes128.ccm.node.js';
import { CamelliaNode } from './libs/node/camellia.node.js';
import { BlowfishNode } from './libs/node/blowfish.node.js';
import { DesCbcNode } from './libs/node/des.cbc.node.js';

import { DesNode } from './libs/node/des.node.js';
import { Des3Node } from './libs/node/des3.node.js';
import { Rc4HmacMd5Node } from './libs/node/rc4.hmac.md5.node.js';
import { Aes256Node } from './libs/node/aes256.node.js';
import { Aes128Node } from './libs/node/aes128.node.js';
import { Rc4Node } from './libs/node/rc4.node.js';

import { ChaCha20Poly1305Node } from './libs/node/chaCha20.poly1305.node.js';

import { Aes128CtrNode } from './libs/node/aes128.ctr.node.js';
import { Aes128GcmNode } from './libs/node/aes128.gcm.node.js';
import { Aes256CtrNode } from './libs/node/aes256.ctr.node.js';
import { Aes256GcmNode } from './libs/node/aes256.gcm.node.js';




// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

const CONFIG = {
    SAMPLES: 50,           // Number of data points to collect per test
    MIN_SAMPLE_TIME_MS: 20,// Minimum duration per sample (to avoid timer resolution noise)
    WARMUP_SAMPLES: 5,     // Runs before recording to warm JIT
    SIZES: [
        16,           // 16 B
        64,           // 64 B
        512,          // 512 B
        1024,         // 1 KB
        4 * 1024,     // 4 KB
        16 * 1024,    // 16 KB
        64 * 1024,    // 64 KB
        512 * 1024,   // 512 KB
        1024 * 1024,  // 1 MB
        16 * 1024 * 1024, // 16 MB
        64 * 1024 * 1024  // 64 MB
    ]
};

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    else return (bytes / 1048576).toFixed(0) + ' MB';
}

function getSystemInfo() {
    const cpus = os.cpus();
    return {
        os: `${os.type()} ${os.release()} (${os.arch()})`,
        cpu: cpus[0] ? cpus[0].model : 'Unknown',
        cores: cpus.length,
        mem: `${(os.totalmem() / (1024**3)).toFixed(1)} GB`,
        node: process.version,
        v8: process.versions.v8
    };
}

function wrapDesNode() {
    // DES Key = 8 bytes
    const key = Buffer.alloc(8, 1);
    const nonce = Buffer.alloc(12, 1); // Wrapper truncates to 8
    const cipher = new DesNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapDes3Node() {
    // 3DES Key = 24 bytes
    const key = Buffer.alloc(24, 1);
    const nonce = Buffer.alloc(12, 1); // Wrapper truncates to 8
    const cipher = new Des3Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

// -----------------------------------------------------------------------------
// TEST WRAPPERS
// -----------------------------------------------------------------------------


function wrapDesCbcNode() {
    // DES Key = 8 bytes
    const key = Buffer.alloc(8, 1);
    const nonce = Buffer.alloc(12, 1); // Truncated to 8 by adapter
    const cipher = new DesCbcNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

// Wrapper for "Core" functions (repeatedly calls generator)
function wrapCore(prngFunc) {
    return (buffer) => {
        const len = buffer.length;
        // Int32 view for speed, similar to our stream implementations
        const intView = new Uint32Array(buffer.buffer, buffer.byteOffset, Math.floor(len / 4));
        for (let i = 0; i < intView.length; i++) {
            intView[i] = prngFunc();
        }
    };
}

// Wrapper for ChaCha20 Classes to match the (buffer) => void signature
// Note: We instantiate once and reuse to test throughput of the algorithm, not the constructor.
function wrapChaChaNative() {
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new ChaCha20Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAesCtrNode() {
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(12, 1); // Adapter will pad to 16
    const cipher = new Aes256CtrNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAesGcmNode() {
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes256GcmNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAes128Node() {
    // 128-bit Key = 16 Bytes
    const key = Buffer.alloc(16, 1);
    // 12-byte nonce (will be padded by adapter)
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes128Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}
function wrapChaChaV8() {
    const key = new Uint8Array(32); key.fill(1);
    const nonce = new Uint8Array(12); nonce.fill(1);
    const cipher = new FastChaCha20(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

// --- Stitched AES Wrappers ---
function wrapStitchedAes128() {
    // Note: Stitched ciphers often work with standard 16-byte keys in Node
    // but typically imply a concatenated MAC key. We test with 32 bytes
    // to cover both (16 AES + 16 HMAC) just in case, or let OpenSSL truncate.
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(16, 1);
    const cipher = new StitchedCipherNode('aes-128-cbc-hmac-sha1', key, nonce);
    return (buffer) => cipher.process(buffer);
}

function wrapStitchedAes256() {
    const key = Buffer.alloc(48, 1); // 32 AES + 16 HMAC?
    const nonce = Buffer.alloc(16, 1);
    const cipher = new StitchedCipherNode('aes-256-cbc-hmac-sha1', key, nonce);
    return (buffer) => cipher.process(buffer);
}

// --- AEAD Wrappers ---
function wrapAes128CcmNode() {
    const key = Buffer.alloc(16, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes128CcmNode(key, nonce);
    return (buffer) => cipher.process(buffer);
}

// --- Exotic Wrappers ---
function wrapCamellia128Node() {
    const key = Buffer.alloc(16, 1);
    const nonce = Buffer.alloc(16, 1);
    const cipher = new CamelliaNode('128', key, nonce);
    return (buffer) => cipher.process(buffer);
}

function wrapBlowfishNode() {
    const key = Buffer.alloc(16, 1); // 128-bit key
    const nonce = Buffer.alloc(8, 1);
    const cipher = new BlowfishNode(key, nonce);
    return (buffer) => cipher.process(buffer);
}
function wrapRc4HmacMd5Node() {
    // 16 bytes (128-bit) key
    const key = Buffer.alloc(16, 1);
    const nonce = Buffer.alloc(0);
    const cipher = new Rc4HmacMd5Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAes256Node() {
    // 256-bit Key = 32 Bytes
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes256Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapRc4Node() {
    // RC4 supports variable key lengths.
    // We use 16 bytes (128-bit) to match the "lightweight" comparison.
    const key = Buffer.alloc(16, 1);
    // Nonce is unused by RC4 class but passed for consistency
    const nonce = Buffer.alloc(0);
    const cipher = new Rc4Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapChaCha20Poly1305Node() {
    const key = Buffer.alloc(32, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new ChaCha20Poly1305Node(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAes128CtrNode() {
    // 128-bit Key = 16 Bytes
    const key = Buffer.alloc(16, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes128CtrNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

function wrapAes128GcmNode() {
    // 128-bit Key = 16 Bytes
    const key = Buffer.alloc(16, 1);
    const nonce = Buffer.alloc(12, 1);
    const cipher = new Aes128GcmNode(key, nonce);
    return (buffer) => {
        cipher.process(buffer);
    };
}

// -----------------------------------------------------------------------------
// BENCHMARK ENGINE
// -----------------------------------------------------------------------------

async function runBenchmark() {
    const sys = getSystemInfo();
    const timestamp = new Date().toISOString();

    console.log(`\n================================================================================`);
    console.log(`BENCHMARK REPORT`);
    console.log(`================================================================================`);
    console.log(`Time:      ${timestamp}`);
    console.log(`Node:      ${sys.node} (V8 ${sys.v8})`);
    console.log(`OS:        ${sys.os}`);
    console.log(`CPU:       ${sys.cpu} (${sys.cores} Cores)`);
    console.log(`RAM:       ${sys.mem}`);
    console.log(`Config:    ${CONFIG.SAMPLES} Samples, Max Size ${formatBytes(Math.max(...CONFIG.SIZES))}`);
    console.log(`================================================================================\n`);

    // Define Candidates
    // All 'fn' must be converted to (buffer) => void signature
    const candidates = [
        { name: 'sfc32-stream',       fn: sfc32Stream },
        { name: 'splitmix32-stream',  fn: splitmix32Stream },
        { name: 'xoshiro128-stream',  fn: xoshiro128Stream },
        // Core variants wrapped to fill buffer
        { name: 'sfc32 (core)',       fn: wrapCore(sfc32) },
        { name: 'splitmix32 (core)',  fn: wrapCore(splitmix32) },
        { name: 'xoshiro128 (core)',  fn: wrapCore(xoshiro128) },
        // ChaCha20 variants
        { name: 'chacha20 (native)',  fn: wrapChaChaNative() },
        { name: 'chacha20 (v8)',      fn: wrapChaChaV8() },

        // Stitched (TLS Optimized)
        { name: 'aes-128-stitched (sha1)', fn: wrapStitchedAes128() },
        { name: 'aes-256-stitched (sha1)', fn: wrapStitchedAes256() },

        // AEAD
        { name: 'aes-128-ccm (node)',      fn: wrapAes128CcmNode() },
       // DES
        { name: 'des-cbc (node)',     fn: wrapDesCbcNode() },
        { name: 'des (node)',         fn: wrapDesNode() },
        { name: 'des3 (node)',        fn: wrapDes3Node() },
        { name: 'rc4-hmac-md5 (node)', fn: wrapRc4HmacMd5Node() },
        // Exotics
        { name: 'camellia-128 (node)',     fn: wrapCamellia128Node() },
        { name: 'blowfish (node)',         fn: wrapBlowfishNode() },
        { name: 'aes128 (node)',      fn: wrapAes128Node() },
        { name: 'aes256 (node)',      fn: wrapAes256Node() },
        { name: 'rc4 (node)', fn: wrapRc4Node() },
        { name: 'aes-256-ctr (node)', fn: wrapAesCtrNode() }, // Existing
        { name: 'aes-128-ctr (node)', fn: wrapAes128CtrNode() }, // NEW

        { name: 'aes-256-gcm (node)', fn: wrapAesGcmNode() }, // Existing
        { name: 'aes-128-gcm (node)', fn: wrapAes128GcmNode() }, // NEW

        // --- NEW BASELINES ---
        { name: 'aes-256-ctr (node)', fn: wrapAesCtrNode() },
        { name: 'aes-256-gcm (node)', fn: wrapAesGcmNode() },
        { name: 'chacha20-poly1305 (node)', fn: wrapChaCha20Poly1305Node() },
    ];

    // Store all results for final tabulation
    // Structure: { [Size]: [ {name, mbps, ops, lat}, ... ] }
    const allResults = {};

    for (const size of CONFIG.SIZES) {
        const sizeLabel = formatBytes(size);
        console.log(`\n--- Test Suite: ${sizeLabel} ---`);
        const buffer = new Uint8Array(size); // Reusable buffer

        const sizeResults = [];

        for (const cand of candidates) {
            process.stdout.write(`  Running ${cand.name.padEnd(20)} ... `);

            const runner = cand.fn;

            // 1. Warmup
            for(let i=0; i<CONFIG.WARMUP_SAMPLES; i++) runner(buffer);

            // 2. Calibration: How many iterations to hit MIN_SAMPLE_TIME_MS?
            let iterationsPerSample = 1;
            let duration = 0;
            while(true) {
                const start = performance.now();
                for(let i=0; i<iterationsPerSample; i++) runner(buffer);
                duration = performance.now() - start;
                if (duration >= CONFIG.MIN_SAMPLE_TIME_MS) break;
                iterationsPerSample *= 2;
            }

            // 3. Execution (Sampling)
            const samples = []; // Throughput (MB/s) of each sample

            for(let s=0; s<CONFIG.SAMPLES; s++) {
                // Force GC logic could go here if memory pressure is high,
                // but typically breaks Node benchmarks. relying on V8.

                const t0 = performance.now();
                for(let i=0; i<iterationsPerSample; i++) runner(buffer);
                const t1 = performance.now();
                const dt = t1 - t0; // milliseconds

                const totalBytes = size * iterationsPerSample;
                const mbps = (totalBytes / 1024 / 1024) / (dt / 1000);
                samples.push(mbps);
            }

            // 4. Calculate Stats
            // Average MB/s
            const avgMbps = samples.reduce((a, b) => a + b, 0) / samples.length;

            // Ops/Sec (How many full buffers filled per second)
            // MB/s * 1024*1024 / size_in_bytes = Ops/sec
            const avgOps = (avgMbps * 1024 * 1024) / size;

            // Latency (Time to fill ONE buffer)
            // 1000ms / Ops
            const latMs = 1000 / avgOps;
            const latStr = latMs < 1 ? `${(latMs * 1000).toFixed(2)} µs` : `${latMs.toFixed(3)} ms`;

            process.stdout.write(`Done. (${avgMbps.toFixed(2)} MB/s)\n`);

            sizeResults.push({
                name: cand.name,
                mbps: avgMbps,
                ops: avgOps,
                lat: latStr
            });
        }

        // Sort this size by MBps descending
        sizeResults.sort((a,b) => b.mbps - a.mbps);
        allResults[size] = sizeResults;
    }

    // -----------------------------------------------------------------------------
    // FINAL REPORTS
    // -----------------------------------------------------------------------------

    // 1. THROUGHPUT REPORT (64 MB Winner Highlight)
    console.log(`\n\n================================================================================`);
    console.log(`FINAL RESULTS: THROUGHPUT (MB/s)`);
    console.log(`================================================================================`);

    // Create a table where Rows = Algorithms, Columns = Sizes
    const tableData = {};
    candidates.forEach(c => tableData[c.name] = {});

    for (const size of CONFIG.SIZES) {
        const resList = allResults[size];
        resList.forEach(r => {
            tableData[r.name][formatBytes(size)] = r.mbps.toFixed(2);
        });
    }

    // Add an Average column
    Object.keys(tableData).forEach(name => {
        let sum = 0;
        CONFIG.SIZES.forEach(s => {
            sum += parseFloat(tableData[name][formatBytes(s)]);
        });
        tableData[name]['AVG'] = (sum / CONFIG.SIZES.length).toFixed(2);
    });

    // Sort by the largest size (64MB)
    const largestSizeKey = formatBytes(Math.max(...CONFIG.SIZES));
    const sortedNames = Object.keys(tableData).sort((a,b) => {
        return parseFloat(tableData[b][largestSizeKey]) - parseFloat(tableData[a][largestSizeKey]);
    });

    const sortedTable = {};
    sortedNames.forEach(name => sortedTable[name] = tableData[name]);
    console.table(sortedTable);


    // 2. OPS/SEC REPORT (Summary for 1KB - Common Payload)
    const focusSize = 1024; // 1KB
    if (CONFIG.SIZES.includes(focusSize)) {
        console.log(`\n================================================================================`);
        console.log(`LEADERBOARD: Operations Per Second (at 1 KB)`);
        console.log(`================================================================================`);
        const opsResults = allResults[focusSize].map(r => ({
            Algorithm: r.name,
            'Ops/Sec': Math.round(r.ops).toLocaleString(),
            'Latency': r.lat,
            'Throughput': r.mbps.toFixed(2) + ' MB/s'
        }));
        console.table(opsResults);
    }
}

// Run
runBenchmark().catch(err => console.error(err));