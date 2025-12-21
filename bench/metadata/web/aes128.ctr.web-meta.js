/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "aes-128-ctr-web",
    name: "AES-128-CTR (Web)",
    fullName: "Advanced Encryption Standard (128-bit) - Counter Mode",
    description: "High-performance parallel encryption that transforms the AES block cipher into a stream cipher.",
    acceleration: "hardware",

    impl: {
        environment: "web",
        engine: "WebCrypto",
        file: "bench/libs/web/aes128.ctr.web.js",
        class: "Aes128CtrWeb",
        api: "async"
    },

    specs: {
        type: "stream",
        keySize: 128,
        ivSize: 128,    // 16 bytes (Nonce + Initial Counter)
        blockSize: 128  // Underlying block size
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Fully parallelizable (Random Access)
        streaming: true
    },

    metrics: {
        speed: 5,             // Extreme (> 1 GB/s). Often the fastest hardware mode available.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal: Plaintext XOR recovery
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
        description: "AES-CTR turns the block cipher into a stream cipher by encrypting a counter. It offers high throughput and requires a unique Nonce/Counter pair for every message.",
        usage: "Real-time Video, VPNs, SSH"
    },

    code: {
        env: "web",
        path: "./libs/web/aes128.ctr.web.js",
        exportName: "Aes128CtrWeb",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/web/aes128.ctr.web.js');
            const CipherClass = module.Aes128CtrWeb;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};