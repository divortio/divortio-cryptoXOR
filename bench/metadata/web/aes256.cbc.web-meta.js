/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-256-cbc-web",
    name: "AES-256-CBC (Web)",
    fullName: "Advanced Encryption Standard (256-bit) - Cipher Block Chaining",
    description: "Military-grade encryption with a larger key. Slightly higher CPU cost than 128-bit.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes256.cbc.web.js",
        class: "Aes256CbcWeb",
        api: "async"
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
        speed: 3,              // Moderate/High (~400 MB/s). 14 rounds vs 10 rounds makes it slower than 128-bit.
        trend: "plateau"
    },

    security: {
        level: "secure",
        rating: 5,             // Higher rating due to quantum resistance of 256-bit key
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
        description: "AES-256 provides a larger security margin against future quantum attacks (Grover's algorithm). Commonly mandated for Top Secret classification.",
        usage: "High Security Storage, Government Standards"
    },

    code: {
        env: "web",
        path: "./libs/web/aes256.cbc.web.js",
        exportName: "Aes256CbcWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes256.cbc.web.js');
            const CipherClass = module.Aes256CbcWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};