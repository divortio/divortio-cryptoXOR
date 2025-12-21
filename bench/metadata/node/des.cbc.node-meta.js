/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "des-cbc-node",
    name: "DES-CBC (Node)",
    fullName: "Data Encryption Standard - Cipher Block Chaining",
    description: "The original 1977 standard. Broken due to its short 56-bit key (brute-forceable in hours).",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/des.cbc.node.js",
        class: "DesCbcNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 64,     // 56 bits effective + 8 parity bits
        ivSize: 64,      // 8 bytes
        blockSize: 64    // 8 bytes
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false,
        streaming: true
    },

    metrics: {
        speed: 1,        // Legacy/Low (~50-80 MB/s). Bit-slicing optimizations exist, but it's generally slow.
        trend: "plateau"
    },

    security: {
        level: "broken",
        rating: 1,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: true,
            biasedOutput: false,
            keyReuse: false,
            timing: false,
            other: ["Key space too small (56-bit)", "Sweet32"]
        },
        recommended: false
    },

    meta: {
        year: 1977,
        designer: "IBM / NSA",
        description: "The first major standard for commercial encryption. It is now completely insecure against brute-force attacks.",
        usage: "Historical analysis, Reading legacy tapes"
    },

    code: {
        env: "node",
        path: "./libs/node/des.cbc.node.js",
        exportName: "DesCbcNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 8,
            ivBytes: 8
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/des.cbc.node.js');
            const CipherClass = module.DesCbcNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};