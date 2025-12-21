/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "rc4-node",
    name: "RC4 (Node)",
    fullName: "Rivest Cipher 4 (OpenSSL)",
    description: "Legacy stream cipher provided by OpenSSL. Extremely fast but cryptographically broken due to statistical biases.",
    acceleration: "hardware", // OpenSSL typically uses optimized assembly

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/rc4.node.js",
        class: "Rc4Node",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 128,    // 16 bytes (variable in reality, standardized for bench)
        ivSize: 0,       // RC4 is KDF-less; it does not natively use an IV
        blockSize: 8     // Byte-oriented
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false, // State depends on previous state
        streaming: true
    },

    metrics: {
        speed: 4,        // High (~400+ MB/s). Very simple internal loop.
        trend: "linear"
    },

    security: {
        level: "broken",
        rating: 0,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: false,   // N/A
            paddingOracle: false,
            biasedOutput: true,  // Significant biases allow plaintext recovery (e.g. NOMORE attack)
            keyReuse: true,      // Catastrophic
            timing: false
        },
        recommended: false
    },

    meta: {
        year: 1987,
        designer: "Ron Rivest",
        description: "Once the dominant stream cipher for SSL/TLS and WEP. It is now prohibited in all modern protocols due to multiple vulnerability classes.",
        usage: "Historical Benchmarking, WEP, TLS 1.0"
    },

    code: {
        env: "node",
        path: "./libs/node/rc4.node.js",
        exportName: "Rc4Node",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/rc4.node.js');
            const CipherClass = module.Rc4Node;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};