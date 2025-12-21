/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-256-cbc-node",
    name: "AES-256-CBC (Node)",
    fullName: "Advanced Encryption Standard (256-bit) - Cipher Block Chaining",
    description: "Military-grade block cipher with a 256-bit key. Offers maximum resistance against brute-force and quantum attacks.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes256.cbc.node.js",
        class: "Aes256CbcNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 256,
        ivSize: 128,
        blockSize: 128
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false,
        streaming: true
    },

    metrics: {
        speed: 3,              // Moderate (~300-350 MB/s). 14 rounds vs 10 rounds makes it slower than 128-bit.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,             // 5 stars for high security margin (Quantum Resistance)
        risk: "low",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: true,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2001,
        designer: "NIST",
        description: "AES-256 is the de facto standard for high-security data at rest. It provides a larger security margin than AES-128 but incurs a 20-40% performance penalty due to extra rounds.",
        usage: "Government/Enterprise Storage, Compliance (FIPS)"
    },

    code: {
        env: "node",
        path: "./libs/node/aes256.cbc.node.js",
        exportName: "Aes256CbcNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes256.cbc.node.js');
            const CipherClass = module.Aes256CbcNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};