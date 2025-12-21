/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "rabbit-v8",
    name: "Rabbit (V8)",
    fullName: "Rabbit Stream Cipher (RFC 4503)",
    description: "High-speed stream cipher from the eSTREAM project. Uses BigInt to emulate 64-bit arithmetic in V8.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "bench/libs/v8/rabbit.v8.js",
        class: "FastRabbit",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 128,
        ivSize: 64,      // 8 bytes (distinct from the 12-byte standard of ChaCha/GCM)
        blockSize: 128   // Generates 128 bits per iteration
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false, // State depends on previous state
        streaming: true
    },

    metrics: {
        speed: 1,         // Legacy/Low (~10-15 MB/s). The BigInt overhead in JS is significant.
        trend: "plateau"
    },

    security: {
        level: "secure",
        rating: 4,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Key stream reuse is fatal
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: true,        // BigInt multiplication in V8 is not guaranteed constant-time
        },
        recommended: false     // Secure algorithm, but implementation is too slow for production
    },

    meta: {
        year: 2003,
        designer: "Martin Boesgaard et al. (Cryptico)",
        description: "An eSTREAM finalist designed for high performance in software. It relies on a complex internal state update function involving squaring, which is efficient in C/ASM but costly in pure JavaScript.",
        usage: "RFC 4503, Legacy High-Speed Streams"
    },

    code: {
        env: "v8",
        path: "./libs/v8/rabbit.v8.js",
        exportName: "default",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 8 // Strictly 64-bit IV
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/v8/rabbit.v8.js');
            const CipherClass = module.default;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};