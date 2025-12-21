/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-256-gcm-web",
    name: "AES-256-GCM (Web)",
    fullName: "Advanced Encryption Standard (256-bit) - Galois/Counter Mode",
    description: "Top-tier authenticated encryption. Adds quantum resistance via 256-bit key to the GCM construction.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes256.gcm.web.js",
        class: "Aes256GcmWeb",
        api: "async"
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
        speed: 4,        // High. The extra rounds for 256-bit keys incur a slight CPU penalty compared to 128-bit.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true, // Catastrophic
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
        description: "Combines the brute-force resistance of AES-256 with the speed and integrity of GCM. Widely required by government and enterprise security policies.",
        usage: "Top Secret Communication, Financial Transactions"
    },

    code: {
        env: "web",
        path: "./libs/web/aes256.gcm.web.js",
        exportName: "Aes256GcmWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes256.gcm.web.js');
            const CipherClass = module.Aes256GcmWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};