/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-128-v8",
    name: "AES-128 (V8)",
    fullName: "Advanced Encryption Standard (128-bit) - Software T-Table",
    description: "Pure JavaScript implementation using pre-computed lookup tables (Te0-Te3). Used to demonstrate the performance gap between V8 and Native AES-NI.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "bench/libs/v8/aes128.v8.js",
        class: "FastAesSoft",
        api: "sync"
    },

    specs: {
        type: "stream",   // Implemented in CTR mode effectively turning it into a stream cipher
        keySize: 128,
        ivSize: 128,      // 16 bytes (Nonce + Counter)
        blockSize: 128
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // CTR mode is parallelizable
        streaming: true
    },

    metrics: {
        speed: 2,         // Low (~60-70 MB/s). Significantly slower than Native (~1.5 GB/s).
        trend: "plateau"
    },

    security: {
        level: "secure",  // Mathematically secure (AES)
        rating: 3,        // Downgraded due to implementation side-channels
        risk: "medium",
        vulnerabilities: {
            nonceReuse: true,
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: true,   // T-Table lookups in JS are susceptible to Cache-Timing attacks
            other: ["Software Side-Channels"]
        },
        recommended: false // Use Native/WebCrypto for AES
    },

    meta: {
        year: 2001,
        designer: "NIST / Joan Daemen & Vincent Rijmen",
        description: "A logic-faithful implementation of AES-128 in Counter Mode. It uses 4KB of pre-computed tables to replace the complex Galois Field arithmetic, a common optimization technique before hardware support existed.",
        usage: "Educational, Benchmarking Baseline"
    },

    code: {
        env: "v8",
        path: "./libs/v8/aes128.v8.js",
        exportName: "default", // Default export class
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('/../../libs/v8/aes128.v8.js');
            const CipherClass = module.default;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};