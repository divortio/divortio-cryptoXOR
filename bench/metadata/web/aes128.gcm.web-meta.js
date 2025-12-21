/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-128-gcm-web",
    name: "AES-128-GCM (Web)",
    fullName: "Advanced Encryption Standard (128-bit) - Galois/Counter Mode",
    description: "The gold standard for authenticated encryption on the web. Combines CTR mode encryption with GMAC integrity.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes128.gcm.web.js",
        class: "Aes128GcmWeb",
        api: "async"
    },

    specs: {
        type: "aead",
        keySize: 128,
        ivSize: 96,     // 12 bytes is the mandatory standard for high-performance GCM
        blockSize: 128
    },

    features: {
        integrity: true, // Built-in Authentication Tag (128-bit)
        aad: true,       // Supports Additional Authenticated Data
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 5,        // Extreme (> 1 GB/s). Hardware accelerated carry-less multiplication (CLMUL).
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Catastrophic: Leaks the Authentication Key (GHASH) and allows forgery
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
        description: "AES-GCM is an Authenticated Encryption with Associated Data (AEAD) cipher. It provides confidentiality, integrity, and authenticity. It is the mandatory cipher suite for TLS 1.3.",
        usage: "HTTPS, VPNs, Encrypted Database Fields"
    },

    code: {
        env: "web",
        path: "./libs/web/aes128.gcm.web.js",
        exportName: "Aes128GcmWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes128.gcm.web.js');
            const CipherClass = module.Aes128GcmWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};