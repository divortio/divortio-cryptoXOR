/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-256-ctr-node",
    name: "AES-256-CTR (Node)",
    fullName: "Advanced Encryption Standard (256-bit) - Counter Mode",
    description: "Top-tier stream cipher security. Combines the speed of CTR mode with the quantum resistance of a 256-bit key.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes256.ctr.node.js",
        class: "Aes256CtrNode",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 256,
        ivSize: 128,    // 16 bytes
        blockSize: 128
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 5,              // Extreme (> 1.5 GB/s). Minimal overhead compared to 128-bit on modern CPUs.
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
        description: "AES-256-CTR is often the default choice for military and government communications requiring maximum confidentiality and throughput.",
        usage: "Top Secret Communication, Server-to-Server links"
    },

    code: {
        env: "node",
        path: "./libs/node/aes256.ctr.node.js",
        exportName: "Aes256CtrNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes256.ctr.node.js');
            const CipherClass = module.Aes256CtrNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};