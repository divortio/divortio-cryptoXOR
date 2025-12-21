/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-256-gcm-node",
    name: "AES-256-GCM (Node)",
    fullName: "Advanced Encryption Standard (256-bit) - Galois/Counter Mode",
    description: "Military-grade authenticated encryption. Adds quantum resistance via a 256-bit key to the high-speed GCM construction.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes256.gcm.node.js",
        class: "Aes256GcmNode",
        api: "sync"
    },

    specs: {
        type: "aead",
        keySize: 256,
        ivSize: 96,
        blockSize: 128
    },

    features: {
        integrity: true,
        aad: true,
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 4,        // High. The 14 rounds of AES-256 incur a ~20-30% CPU penalty compared to AES-128 (10 rounds).
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2007,
        designer: "NIST",
        description: "Widely used for top-secret and high-value data protection. While slower than 128-bit, the performance is still exceptional on modern hardware due to AES-NI.",
        usage: "Government Data, Banking, Compliance (FIPS 140-2)"
    },

    code: {
        env: "node",
        path: "./libs/node/aes256.gcm.node.js",
        exportName: "Aes256GcmNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes256.gcm.node.js');
            const CipherClass = module.Aes256GcmNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};