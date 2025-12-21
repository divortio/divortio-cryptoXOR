/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "hmac-sha1-web",
    name: "HMAC-SHA1 (Web)",
    fullName: "Hash-based Message Authentication Code (SHA-1)",
    description: "Legacy integrity primitive. Faster than SHA-256 but cryptographically weaker due to SHA-1 collisions.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/hmac.sha1.web.js",
        class: "HmacSha1Web",
        api: "async"
    },

    specs: {
        type: "hash",
        keySize: 160,    // Standard output size (20 bytes)
        ivSize: 0,       // HMAC does not use an IV
        blockSize: 512   // Internal SHA-1 block size (64 bytes)
    },

    features: {
        integrity: true,
        aad: false,      // N/A for pure MAC
        parallelizable: false,
        streaming: false // WebCrypto sign() is typically one-shot
    },

    metrics: {
        speed: 4,        // High (~400-600 MB/s on modern hardware)
        trend: "plateau"
    },

    security: {
        level: "weak",
        rating: 2,
        risk: "medium",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false,
            other: ["SHA-1 Collision Attacks (Theoretical impact on HMAC is low, but deprecated)"]
        },
        recommended: false
    },

    meta: {
        year: 1996,
        designer: "Bellare, Canetti, and Krawczyk",
        description: "The original HMAC construction using the SHA-1 hash function. While SHA-1 collisions are practical today, HMAC-SHA1 remains relatively resistant. However, it is deprecated by NIST and industry standards.",
        usage: "Legacy Systems, Git (Internal Integrity), Hotp/Totp"
    },

    code: {
        env: "web",
        path: "./libs/web/hmac.sha1.web.js",
        exportName: "HmacSha1Web",
        type: "class",
        signature: ["$KEY"], // HMAC only needs a key
        limits: {
            keyBytes: 20, // 160 bits
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/hmac.sha1.web.js');
            const CipherClass = module.HmacSha1Web;
            const instance = new CipherClass(key);
            return (buffer) => instance.process(buffer);
        }
    }
};