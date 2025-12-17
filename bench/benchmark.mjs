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
import { NativeChaCha20 } from './libs/chaCha20.node.js';
import FastChaCha20 from './libs/chaCha20.v8.js';

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

// -----------------------------------------------------------------------------
// TEST WRAPPERS
// -----------------------------------------------------------------------------

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
    const cipher = new NativeChaCha20(key, nonce);
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