/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-128-cbc-web",
    name: "AES-128-CBC (Web)",
    fullName: "Advanced Encryption Standard (128-bit) - Cipher Block Chaining",
    description: "Standard hardware-accelerated block cipher. Sequential execution makes it slower than CTR/GCM modes.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes128.cbc.web.js",
        class: "Aes128CbcWeb",
        api: "async"
    },

    specs: {
        type: "block",
        keySize: 128,
        ivSize: 128,    // 16 bytes
        blockSize: 128  // 16 bytes
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false, // CBC Encryption is sequential (Decryption is parallelizable)
        streaming: true        // WebCrypto supports it, but this wrapper is one-shot
    },

    metrics: {
        speed: 4,              // High (~500 MB/s). Slower than CTR because it cannot pipeline blocks.
        trend: "plateau"
    },

    security: {
        level: "secure",
        rating: 4,
        risk: "low",
        vulnerabilities: {
            nonceReuse: false,   // IV reuse leaks equality of first block, but not fatal like CTR
            paddingOracle: true, // Vulnerable if used without an Auth Tag (MAC)
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2001,
        designer: "NIST",
        description: "The classic mode of operation for AES. It chains blocks together, meaning encryption must happen one block at a time. Requires random IVs and PKCS#7 padding.",
        usage: "File Storage, Legacy Systems"
    },

    code: {
        env: "web",
        path: "./libs/web/aes128.cbc.web.js",
        exportName: "Aes128CbcWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes128.cbc.web.js');
            const CipherClass = module.Aes128CbcWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};