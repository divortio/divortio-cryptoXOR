/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "hmac-sha256-web",
    name: "HMAC-SHA256 (Web)",
    fullName: "Hash-based Message Authentication Code (SHA-256)",
    description: "The industry standard for message integrity. Hardware accelerated and highly secure.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/hmac.sha256.web.js",
        class: "HmacSha256Web",
        api: "async"
    },

    specs: {
        type: "hash",
        keySize: 256,    // 32 bytes
        ivSize: 0,
        blockSize: 512   // Internal SHA-256 block size
    },

    features: {
        integrity: true,
        aad: false,
        parallelizable: false,
        streaming: false
    },

    metrics: {
        speed: 3,        // Moderate (~200-400 MB/s). SHA-256 is computationally heavier than SHA-1/Poly1305.
        trend: "plateau"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2002, // SHA-256 publication
        designer: "NSA (Hash) / Bellare et al. (HMAC)",
        description: "Combines the proven security of SHA-256 with the HMAC construction. Immune to length extension attacks and widely supported in every cryptographic library.",
        usage: "JWT Signatures, TLS Handshakes, AWS API Signing"
    },

    code: {
        env: "web",
        path: "./libs/web/hmac.sha256.web.js",
        exportName: "HmacSha256Web",
        type: "class",
        signature: ["$KEY"],
        limits: {
            keyBytes: 32,
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/hmac.sha256.web.js');
            const CipherClass = module.HmacSha256Web;
            const instance = new CipherClass(key);
            return (buffer) => instance.process(buffer);
        }
    }
};