/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-128-gcm-node",
    name: "AES-128-GCM (Node)",
    fullName: "Advanced Encryption Standard (128-bit) - Galois/Counter Mode",
    description: "The gold standard for authenticated encryption. Hardware accelerated (AES-NI) and widely used in TLS 1.3.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes128.gcm.node.js",
        class: "Aes128GcmNode",
        api: "sync"
    },

    specs: {
        type: "aead",
        keySize: 128,
        ivSize: 96,      // 12 bytes is the optimal standard for GCM
        blockSize: 128
    },

    features: {
        integrity: true, // 128-bit Authentication Tag
        aad: true,       // Supports Additional Authenticated Data
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 5,        // Extreme (~1.5 GB/s+). Uses PCLMULQDQ instruction for GMAC.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Catastrophic: Leaks the GMAC authentication key (GHASH)
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2007,
        designer: "NIST (McGrew & Viega)",
        description: "Combines CTR mode encryption with the GMAC authentication tag. It provides confidentiality and integrity in a single pass. 12-byte nonces are strongly recommended to avoid extra hashing overhead.",
        usage: "HTTPS, TLS 1.3, SSH, VPNs"
    },

    code: {
        env: "node",
        path: "./libs/node/aes128.gcm.node.js",
        exportName: "Aes128GcmNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes128.gcm.node.js');
            const CipherClass = module.Aes128GcmNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};