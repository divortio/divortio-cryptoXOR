import { performance } from 'perf_hooks';
import os from 'os';
import crypto from 'node:crypto';

// =============================================================================
// 1. CRYPTOXOR LIBRARY IMPORTS
// =============================================================================

// --- Functional Wrappers (Baseline Speed - Raw Math) ---
import {
    sfc32Stream,
    splitmix32Stream,
    xoshiro128Stream
} from '../src/index.mjs';

// --- Pure Classes (No Integrity Overhead) ---
import SFC32 from '../src/cryptoXOR.sfc32.js';
import SplitMix32 from '../src/cryptoXOR.splitmix32.js';
import Xoshiro128 from '../src/cryptoXOR.xoshiro128.js';

// --- ECC Classes (Legacy Integrity) ---
import SFC32ECC from '../src/cryptoXOR.sfc32.ecc.js';
import SplitMix32ECC from '../src/cryptoXOR.splitmix32.ecc.js';
import Xoshiro128ECC from '../src/cryptoXOR.xoshiro128.ecc.js';

// --- Chaskey Classes (Modern Integrity) ---
import { SFC32Chaskey } from '../src/cryptoXOR.sfc32.chaskey.js';

// =============================================================================
// 2. COMPETITOR IMPORTS
// =============================================================================

// --- V8 Optimized Software (libs/v8) ---
import FastChaCha20 from './libs/v8/chaCha20.v8.js';
import FastSalsa20 from './libs/v8/salsa20.v8.js';
import FastRabbit from './libs/v8/rabbit.v8.js';
import { FastRC4 } from './libs/v8/rc4.v8.js';
import FastAesSoft from './libs/v8/aes128.v8.js';

// --- Node.js Native Bindings (libs/node) ---
import { ChaCha20Node } from './libs/node/chaCha20.node.js';
import { Rc4Node } from './libs/node/rc4.node.js';
import { Rc4HmacMd5Node } from './libs/node/rc4.hmac.md5.node.js';
import { DesEcbNode } from './libs/node/des.ecb.node.js';
import { DesCbcNode } from './libs/node/des.cbc.node.js';
import { Des3Node } from './libs/node/des3.node.js';
import { BlowfishNode } from './libs/node/blowfish.node.js';
import { CamelliaNode } from './libs/node/camellia.node.js';
import { StitchedCipherNode } from './libs/node/stitched.node.js';

import { Aes128CbcNode } from './libs/node/aes128.cbc.node.js';
import { Aes128CtrNode } from './libs/node/aes128.ctr.node.js';
import { Aes128GcmNode } from './libs/node/aes128.gcm.node.js';
// import { Aes128CcmNode } from './libs/node/aes128.ccm.node.js'; // CCM not supported in streams

import { Aes256CbcNode } from './libs/node/aes256.cbc.node.js';
import { Aes256CtrNode } from './libs/node/aes256.ctr.node.js';
import { Aes256GcmNode } from './libs/node/aes256.gcm.node.js';

import { ChaCha20Poly1305Node } from './libs/node/chaCha20.poly1305.node.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    SAMPLES: 10,
    MIN_SAMPLE_TIME_MS: 30,
    WARMUP_SAMPLES: 5,
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

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Universal Wrapper for Library/Competitor algorithms.
 * Instantiates the cipher ONCE, then benchmarks the .process() method.
 */
function prepare(name, ClassRef, keyLen, nonceLen, ...extraArgs) {
    const key = Buffer.alloc(keyLen, 1);
    const nonce = Buffer.alloc(nonceLen, 2);
    let instance;
    try {
        if (extraArgs.length > 0) instance = new ClassRef(...extraArgs, key, nonce);
        else instance = new ClassRef(key, nonce);
    } catch (e) {
        return { name: `[SKIP] ${name}`, fn: () => {}, error: e.message };
    }
    return { name: name, fn: (buffer) => instance.process(buffer) };
}

/**
 * Wrapper for Functional Streams (CryptoXOR native streams).
 */
function prepareFunc(name, func) {
    return { name, fn: (buffer) => func(buffer) };
}

/**
 * Wrapper for CryptoXOR Class Instantiation.
 * We instantiate with standard keys to measure the class overhead + processing.
 */
function prepareCryptoXOR(name, ClassRef) {
    // 256-bit Key, 16-byte IV (Standard for SFC32/Xoshiro)
    const key = new Uint8Array(32);
    const iv = new Uint8Array(16);

    let instance;
    try {
        instance = new ClassRef(key, iv);
    } catch (e) {
        return { name: `[SKIP] ${name}`, fn: () => {}, error: e.message };
    }

    return {
        name,
        fn: (buffer) => instance.process(buffer)
    };
}

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

// =============================================================================
// BENCHMARK ENGINE
// =============================================================================

async function runBenchmark() {
    const sys = getSystemInfo();
    const timestamp = new Date().toISOString();

    console.log(`\n================================================================================`);
    console.log(`NODE.JS CRYPTO BENCHMARK (V8 vs NATIVE vs REAL WORLD)`);
    console.log(`================================================================================`);
    console.log(`Time:      ${timestamp}`);
    console.log(`Node:      ${sys.node} (V8 ${sys.v8})`);
    console.log(`CPU:       ${sys.cpu} (${sys.cores} Cores)`);
    console.log(`RAM:       ${sys.mem}`);
    console.log(`Config:    ${CONFIG.SAMPLES} Samples, Max Size ${formatBytes(Math.max(...CONFIG.SIZES))}`);
    console.log(`================================================================================\n`);

    const candidates = [
        // --- 1. CryptoXOR: Pure (No ECC) ---
        prepareFunc('SFC32-Stream', sfc32Stream),
        prepareCryptoXOR('SFC32', SFC32),
        prepareCryptoXOR('SplitMix32', SplitMix32),
        prepareCryptoXOR('Xoshiro128', Xoshiro128),

        // --- 2. CryptoXOR: Integrity Variants ---
        prepareCryptoXOR('SFC32-ECC (Class)', SFC32ECC),
        prepareCryptoXOR('SplitMix32-ECC (Class)', SplitMix32ECC),
        prepareCryptoXOR('Xoshiro128-ECC (Class)', Xoshiro128ECC),
        prepareCryptoXOR('SFC32-Chaskey (Class)', SFC32Chaskey),

        // --- 3. V8 Optimized Software ---
        prepare('ChaCha20 (V8)', FastChaCha20, 32, 12),
        prepare('RC4 (V8)', FastRC4, 16, 0),
        prepare('Rabbit (V8)', FastRabbit, 16, 8),
        prepare('Salsa20 (V8)', FastSalsa20, 32, 8),
        prepare('AES-128-Table (V8)', FastAesSoft, 16, 16),

        // --- 4. Node.js Native (Stream Ciphers) ---
        prepare('ChaCha20 (Node)', ChaCha20Node, 32, 12),
        prepare('RC4 (Node)', Rc4Node, 16, 0),
        prepare('RC4-MD5 (Node)', Rc4HmacMd5Node, 16, 0),

        // --- 5. Node.js Native (AES) ---
        prepare('AES-128-CTR (Node)', Aes128CtrNode, 16, 16),
        prepare('AES-256-CTR (Node)', Aes256CtrNode, 32, 16),
        prepare('AES-128-CBC (Node)', Aes128CbcNode, 16, 16),
        prepare('AES-256-CBC (Node)', Aes256CbcNode, 32, 16),

        // --- 6. Node.js Native (Authenticated) ---
        prepare('AES-128-GCM (Node)', Aes128GcmNode, 16, 12),
        prepare('AES-256-GCM (Node)', Aes256GcmNode, 32, 12),
        prepare('ChaCha20-Poly1305 (Node)', ChaCha20Poly1305Node, 32, 12),
        prepare('Stitched-AES128 (Node)', StitchedCipherNode, 32, 16, 'aes-128-cbc-hmac-sha1'),

        // --- 7. Legacy / Exotic ---
        prepare('DES-CBC (Node)', DesCbcNode, 8, 8),
        prepare('3DES (Node)', Des3Node, 24, 8),
        prepare('Blowfish (Node)', BlowfishNode, 16, 8),
        prepare('Camellia-128 (Node)', CamelliaNode, 16, 16, '128'),
    ];

    const activeCandidates = candidates.filter(c => {
        if (c.name.startsWith('[SKIP]')) {
            // console.warn(`Skipping ${c.name}: ${c.error}`);
            return false;
        }
        return true;
    });

    const allResults = {};

    for (const size of CONFIG.SIZES) {
        const sizeLabel = formatBytes(size);
        console.log(`\n--- Test Suite: ${sizeLabel} ---`);

        const buffer = new Uint8Array(size);
        crypto.randomFillSync(buffer);

        const sizeResults = [];

        for (const cand of activeCandidates) {
            process.stdout.write(`  Running ${cand.name.padEnd(25)} ... `);
            const runner = cand.fn;

            try {
                // Warmup
                for(let i=0; i<CONFIG.WARMUP_SAMPLES; i++) runner(buffer);

                // Calibration
                let iterations = 1;
                while(true) {
                    const start = performance.now();
                    for(let i=0; i<iterations; i++) runner(buffer);
                    const dur = performance.now() - start;
                    if (dur >= CONFIG.MIN_SAMPLE_TIME_MS) break;
                    iterations *= 2;
                }

                // Measure
                const samples = [];
                for(let s=0; s<CONFIG.SAMPLES; s++) {
                    const start = performance.now();
                    for(let i=0; i<iterations; i++) runner(buffer);
                    const dur = performance.now() - start;

                    const totalBytes = size * iterations;
                    const mbps = (totalBytes / 1024 / 1024) / (dur / 1000);
                    samples.push(mbps);
                }

                const avgMbps = samples.reduce((a,b)=>a+b,0) / samples.length;
                process.stdout.write(`Done. (${avgMbps.toFixed(2)} MB/s)\n`);
                sizeResults.push({ name: cand.name, mbps: avgMbps });

            } catch (e) {
                console.log('FAILED');
                console.error(`  Error: ${e.message}`);
            }
        }

        sizeResults.sort((a,b) => b.mbps - a.mbps);
        allResults[size] = sizeResults;
    }

    // --- REPORT ---
    console.log(`\n\n================================================================================`);
    console.log(`FINAL RESULTS: THROUGHPUT (MB/s)`);
    console.log(`================================================================================`);

    const tableData = {};
    activeCandidates.forEach(c => tableData[c.name] = {});

    for (const size of CONFIG.SIZES) {
        if (!allResults[size]) continue;
        allResults[size].forEach(r => {
            tableData[r.name][formatBytes(size)] = r.mbps.toFixed(2);
        });
    }

    // Average
    Object.keys(tableData).forEach(name => {
        let sum = 0, count = 0;
        CONFIG.SIZES.forEach(s => {
            const val = parseFloat(tableData[name][formatBytes(s)]);
            if(!isNaN(val)) { sum += val; count++; }
        });
        tableData[name]['AVG'] = count ? (sum/count).toFixed(2) : 0;
    });

    // Sort by largest size
    const sortKey = formatBytes(Math.max(...CONFIG.SIZES));
    const sortedNames = Object.keys(tableData).sort((a,b) => {
        return parseFloat(tableData[b][sortKey]||0) - parseFloat(tableData[a][sortKey]||0);
    });

    const sortedTable = {};
    sortedNames.forEach(name => sortedTable[name] = tableData[name]);
    console.table(sortedTable);
}

runBenchmark().catch(console.error);