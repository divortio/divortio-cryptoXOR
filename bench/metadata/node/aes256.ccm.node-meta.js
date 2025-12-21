/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-256-ccm-node",
    name: "AES-256-CCM (Node)",
    fullName: "Advanced Encryption Standard (256-bit) - Counter with CBC-MAC",
    description: "High-security authenticated encryption. Provides 256-bit quantum resistance but suffers from the same performance penalties as standard CCM.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes256.ccm.node.js", // Assuming you create this file following the 128 pattern
        class: "Aes256CcmNode",
        api: "sync"
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
        parallelizable: false,
        streaming: false
    },

    metrics: {
        speed: 3,        // Moderate/Low. The 14 rounds of AES-256 combined with the 2-pass CCM structure makes this heavy.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: false
    },

    meta: {
        year: 2003,
        designer: "NIST",
        description: "AES-256-CCM offers the highest security margin for the CCM family. It is rarely the first choice for software due to performance cost, but mandatory in some high-security specifications.",
        usage: "High Security IoT, Government Specs"
    },

    code: {
        env: "node",
        path: "./libs/node/aes256.ccm.node.js",
        exportName: "Aes256CcmNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes256.ccm.node.js');
            const CipherClass = module.Aes256CcmNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};