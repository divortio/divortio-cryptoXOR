/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "rc4-v8",
    name: "RC4 (V8)",
    fullName: "Rivest Cipher 4 (Pure JS)",
    description: "Legacy stream cipher implemented in pure JavaScript. Known for its simplicity and reasonable speed in software despite being cryptographically broken.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "bench/libs/v8/rc4.v8.js",
        class: "FastRC4",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 128,    // Variable, but standardized to 128 for benchmarks
        ivSize: 0,       // RC4 does not natively use an IV (KDF-less)
        blockSize: 8     // Byte-oriented
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false, // State evolves sequentially
        streaming: true
    },

    metrics: {
        speed: 3,         // Moderate (~200-300 MB/s). Faster than unoptimized 32-bit logic in JS due to simple byte swaps.
        trend: "plateau"
    },

    security: {
        level: "broken",
        rating: 0,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: false,   // Not applicable (no nonce), but Key Reuse is fatal
            paddingOracle: false,
            biasedOutput: true,  // Significant statistical biases in the keystream
            keyReuse: true,      // Catastrophic
            timing: false
        },
        recommended: false
    },

    meta: {
        year: 1987,
        designer: "Ron Rivest",
        description: "One of the most widely used stream ciphers in history (WEP, SSL). Its simple algorithm made it a favorite for software implementation before hardware acceleration existed.",
        usage: "Historical Benchmarking, Legacy Systems"
    },

    code: {
        env: "v8",
        path: "./libs/v8/rc4.v8.js",
        exportName: "default",
        type: "class",
        signature: ["$KEY", "$IV"], // IV is passed but ignored by implementation
        limits: {
            keyBytes: 16,
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/v8/rc4.v8.js');
            const CipherClass = module.default;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};