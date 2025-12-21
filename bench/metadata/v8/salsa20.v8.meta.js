/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "salsa20-v8",
    name: "Salsa20 (V8)",
    fullName: "Salsa20 Stream Cipher (Pure JS)",
    description: "The predecessor to ChaCha20. A pure JS implementation demonstrating the V8 performance baseline for ARX ciphers.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "bench/libs/v8/salsa20.v8.js",
        class: "FastSalsa20",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 256,    // 32 bytes
        ivSize: 64,      // 8 bytes (Salsa20 Original Standard)
        blockSize: 512   // 64 bytes (Internal State)
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Random access via counter
        streaming: true
    },

    metrics: {
        speed: 2,         // Low (~50-60 MB/s). Pure JS overhead is significant.
        trend: "plateau"
    },

    security: {
        level: "secure",
        rating: 4,        // Good, though ChaCha20 provides better diffusion per round.
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: false
    },

    meta: {
        year: 2005,
        designer: "Daniel J. Bernstein",
        description: "An eSTREAM portfolio cipher built on ARX (Add-Rotate-Xor) operations. It is cryptographically secure but superseded by ChaCha20 in most modern protocols due to slightly better performance and diffusion.",
        usage: "Legacy TLS, eSTREAM Benchmarks"
    },

    code: {
        env: "v8",
        path: "./libs/v8/salsa20.v8.js",
        exportName: "default",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 8 // Strictly 8 bytes
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/v8/salsa20.v8.js');
            const CipherClass = module.default;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};