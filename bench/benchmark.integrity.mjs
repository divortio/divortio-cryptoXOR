import { performance } from 'perf_hooks';
import os from 'os';
import crypto from 'node:crypto';

// -----------------------------------------------------------------------------
// IMPORTS: The Integrity Candidates
// -----------------------------------------------------------------------------
import { Chaskey } from '../src/integrity/chaskey.js';
import { Poly1305 } from '../src/integrity/poly1305.js';
import { SipHash } from '../src/integrity/siphash.js';
import { AsconMac } from '../src/integrity/ascon.js';

import { HmacNode } from '../src/integrity/hmac.node.js';
import { AesGmacNode } from '../src/integrity/aes_gmac.node.js';
import { Poly1305Node } from '../src/integrity/poly1305.node.js';

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

const CONFIG = {
    SAMPLES: 50,
    MIN_SAMPLE_TIME_MS: 50,
    WARMUP_SAMPLES: 5,
    // We test a spectrum of sizes to see where setup overhead dominates (small)
    // vs where raw throughput dominates (large).
    SIZES: [
        16,           // 16 B   (IDs, nonces)
        64,           // 64 B   (Headers)
        1024,         // 1 KB   (JSON payloads)
        16 * 1024,    // 16 KB  (Chunks)
        64 * 1024,    // 64 KB  (Standard Blocks)
        // 1024 * 1024,  // 1 MB   (Files)
    ]
};

// -----------------------------------------------------------------------------
// ADAPTERS (Normalization)
// -----------------------------------------------------------------------------

/**
 * Standardizes all classes to a simple `(buffer) => void` signature.
 * Handles key generation and instance management.
 */
function prepareCandidate(Name, ClassRef, keySize) {
    // 1. Generate a random key
    const key = new Uint8Array(keySize);
    crypto.getRandomValues(key);

    // 2. Determine Strategy
    let runner;

    if (Name === 'HMAC-SHA256 (Node)' || Name === 'Ascon-Mac') {
        // Factory pattern / State reset required
        runner = (buffer) => {
            const instance = new ClassRef(key);
            instance.update(buffer);
        };
    } else {
        // Reusable Instance Strategy
        const instance = new ClassRef(key);
        runner = (buffer) => {
            instance.update(buffer);
        };
    }

    return { name: Name, fn: runner };
}

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
        node: process.version
    };
}

// -----------------------------------------------------------------------------
// BENCHMARK ENGINE
// -----------------------------------------------------------------------------

async function runBenchmark() {
    const sys = getSystemInfo();
    const timestamp = new Date().toISOString();

    console.log(`\n================================================================================`);
    console.log(`CRYPTO INTEGRITY BENCHMARK`);
    console.log(`================================================================================`);
    console.log(`Time:      ${timestamp}`);
    console.log(`Node:      ${sys.node}`);
    console.log(`CPU:       ${sys.cpu} (${sys.cores} Cores)`);
    console.log(`RAM:       ${sys.mem}`);
    console.log(`Config:    ${CONFIG.SAMPLES} Samples per test`);
    console.log(`================================================================================\n`);

    // Define Candidates
    const candidates = [
        // --- The Reference (Node Native) ---
        prepareCandidate('HMAC-SHA256 (Node)', HmacNode, 32),
        prepareCandidate('AES-GMAC (Node)', AesGmacNode, 32),
        prepareCandidate('Poly1305 (Node)', Poly1305Node, 32),

        // --- Our JS Primitives ---
        prepareCandidate('Chaskey (JS)', Chaskey, 16),
        prepareCandidate('Poly1305 (JS)', Poly1305, 32),
        prepareCandidate('SipHash-2-4 (JS)', SipHash, 16),
        prepareCandidate('Ascon-Mac (JS)', AsconMac, 16),
    ];

    // Store all results: { [Size]: [ {name, mbps, ops, lat}, ... ] }
    const allResults = {};

    for (const size of CONFIG.SIZES) {
        const sizeLabel = formatBytes(size);
        console.log(`\n--- Test Suite: ${sizeLabel} ---`);
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer); // Random data

        const sizeResults = [];

        for (const cand of candidates) {
            process.stdout.write(`  Running ${cand.name.padEnd(20)} ... `);
            const runner = cand.fn;

            try {
                // --- 1. Warmup ---
                // We wrap execution in a try/catch to ensure FAIL-FAST behavior
                for(let i=0; i<CONFIG.WARMUP_SAMPLES; i++) runner(buffer);

                // --- 2. Calibration ---
                let iterationsPerSample = 1;
                while(true) {
                    const start = performance.now();
                    for(let i=0; i<iterationsPerSample; i++) runner(buffer);
                    const duration = performance.now() - start;
                    if (duration >= CONFIG.MIN_SAMPLE_TIME_MS) break;
                    iterationsPerSample *= 2;
                }

                // --- 3. Execution ---
                const samples = [];
                for(let s=0; s<CONFIG.SAMPLES; s++) {
                    const t0 = performance.now();
                    for(let i=0; i<iterationsPerSample; i++) runner(buffer);
                    const t1 = performance.now();
                    const dt = t1 - t0;

                    const totalBytes = size * iterationsPerSample;
                    const mbps = (totalBytes / 1024 / 1024) / (dt / 1000);
                    samples.push(mbps);
                }

                // --- 4. Stats ---
                const avgMbps = samples.reduce((a, b) => a + b, 0) / samples.length;
                const avgOps = (avgMbps * 1024 * 1024) / size;
                const latMs = 1000 / avgOps;
                const latStr = latMs < 0.1 ? `${(latMs * 1000).toFixed(2)} µs` : `${latMs.toFixed(3)} ms`;

                process.stdout.write(`Done. (${avgMbps.toFixed(2)} MB/s)\n`);

                sizeResults.push({
                    name: cand.name,
                    mbps: avgMbps,
                    ops: avgOps,
                    lat: latStr
                });

            } catch (e) {
                // 🛑 FATAL ERROR HANDLER
                console.log(`\n\n================================================================================`);
                console.log(`FATAL ERROR: ${cand.name} crashed.`);
                console.log(`================================================================================`);
                console.error(e); // Print full stack trace
                console.log(`\nAborting benchmark to prevent misleading results.`);
                process.exit(1); // Exit code 1 indicates failure
            }
        }

        // Sort by MBps descending
        sizeResults.sort((a,b) => b.mbps - a.mbps);
        allResults[size] = sizeResults;
    }

    // -----------------------------------------------------------------------------
    // REPORT GENERATION
    // -----------------------------------------------------------------------------

    // 1. THROUGHPUT TABLE
    console.log(`\n\n================================================================================`);
    console.log(`FINAL RESULTS: THROUGHPUT (MB/s)`);
    console.log(`================================================================================`);

    const tableData = {};
    candidates.forEach(c => tableData[c.name] = {});

    for (const size of CONFIG.SIZES) {
        if (!allResults[size]) continue; // Guard against partial runs if logic changes
        const resList = allResults[size];
        resList.forEach(r => {
            tableData[r.name][formatBytes(size)] = r.mbps.toFixed(2);
        });
    }
    console.table(tableData);

    // 2. LATENCY TABLE
    console.log(`\n================================================================================`);
    console.log(`LEADERBOARD: Small Packet Latency (64 Bytes)`);
    console.log(`================================================================================`);

    const smallSize = 64;
    if (allResults[smallSize]) {
        const smallResults = allResults[smallSize].map(r => ({
            Algorithm: r.name,
            'Ops/Sec': Math.round(r.ops).toLocaleString(),
            'Latency': r.lat,
            'Speed': r.mbps.toFixed(2) + ' MB/s'
        }));
        console.table(smallResults);
    }
}

runBenchmark().catch(err => {
    console.error('Unhandled Benchmark Error:', err);
    process.exit(1);
});