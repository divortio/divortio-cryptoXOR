/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "des-ecb-node",
    name: "DES-ECB (Node)",
    fullName: "Data Encryption Standard - Electronic Codebook",
    description: "Raw DES block processing. Insecure mode (identical blocks encrypt identically) but slightly faster/parallelizable.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/des.ecb.node.js",
        class: "DesEcbNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 64,
        ivSize: 0,       // ECB does not use an IV
        blockSize: 64
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // ECB is parallelizable
        streaming: true
    },

    metrics: {
        speed: 1,        // Legacy. Slightly faster than CBC due to parallel potential, but overhead dominates.
        trend: "plateau"
    },

    security: {
        level: "broken",
        rating: 0,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: false, // No padding oracle in the same sense, but pattern leakage is fatal
            biasedOutput: true,   // Patterns in plaintext remain visible in ciphertext
            keyReuse: false,
            timing: false,
            other: ["Pattern Leakage (ECB)", "56-bit Key"]
        },
        recommended: false
    },

    meta: {
        year: 1977,
        designer: "IBM",
        description: "Electronic Codebook (ECB) mode for DES. Visual data (like a bitmap) remains recognizable after encryption. Strictly for benchmarking raw block throughput.",
        usage: "Educational (Don't use)"
    },

    code: {
        env: "node",
        path: "./libs/node/des.ecb.node.js",
        exportName: "DesEcbNode",
        type: "class",
        signature: ["$KEY", "$IV"], // IV passed but ignored by ECB
        limits: {
            keyBytes: 8,
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/des.ecb.node.js');
            const CipherClass = module.DesEcbNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};