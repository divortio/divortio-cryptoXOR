/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-128-ctr-node",
    name: "AES-128-CTR (Node)",
    fullName: "Advanced Encryption Standard (128-bit) - Counter Mode",
    description: "High-performance stream cipher mode. Converts the AES block cipher into a stream cipher by encrypting a counter.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes128.ctr.node.js",
        class: "Aes128CtrNode",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 128,
        ivSize: 128,    // 16 bytes (Nonce + Initial Counter)
        blockSize: 128
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Fully parallelizable (Random Access)
        streaming: true
    },

    metrics: {
        speed: 5,             // Extreme (> 2 GB/s on server hardware). One of the fastest modes available.
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
        description: "AES-CTR is widely used for high-speed network encryption (SSH, IPsec). It requires a unique Nonce/Counter pair for every message to maintain security.",
        usage: "High-speed backend services, VPNs"
    },

    code: {
        env: "node",
        path: "./libs/node/aes128.ctr.node.js",
        exportName: "Aes128CtrNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes128.ctr.node.js');
            const CipherClass = module.Aes128CtrNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};