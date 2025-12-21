/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-256-ctr-web",
    name: "AES-256-CTR (Web)",
    fullName: "Advanced Encryption Standard (256-bit) - Counter Mode",
    description: "Military-grade stream cipher. Combines the speed of CTR mode with the quantum resistance of a 256-bit key.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes256.ctr.web.js",
        class: "Aes256CtrWeb",
        api: "async"
    },

    specs: {
        type: "stream",
        keySize: 256,
        ivSize: 128,    // 16 bytes (Nonce + Initial Counter)
        blockSize: 128
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 4,              // High. Slightly slower than 128-bit due to extra rounds (14 vs 10).
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2001,
        designer: "NIST",
        description: "AES-256 in Counter mode is widely considered one of the most secure and efficient encryption methods available for high-throughput applications.",
        usage: "Top Secret Communication, High-Speed Links"
    },

    code: {
        env: "web",
        path: "./libs/web/aes256.ctr.web.js",
        exportName: "Aes256CtrWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes256.ctr.web.js');
            const CipherClass = module.Aes256CtrWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};