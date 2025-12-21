/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "camellia-128-node",
    name: "Camellia-128 (Node)",
    fullName: "Camellia (128-bit) - CBC Mode",
    description: "A secure block cipher approved by ISO/IEC and CRYPTREC. Structurally similar to AES but uses a Feistel network.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/camellia.node.js",
        class: "CamelliaNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 128,
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
        speed: 3,        // Moderate. Often slightly slower than AES due to less ubiquitous hardware optimization.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 4,
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
        year: 2000,
        designer: "Mitsubishi Electric / NTT",
        description: "One of the few ciphers selected by the EU's NESSIE project alongside AES. It is widely supported in OpenSSL and mandated in some Japanese government systems.",
        usage: "TLS (Optional), Government Systems"
    },

    code: {
        env: "node",
        path: "./libs/node/camellia.node.js",
        exportName: "CamelliaNode",
        type: "class",
        // CamelliaNode constructor takes (bits, key, iv)
        signature: ["128", "$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/camellia.node.js');
            const CipherClass = module.CamelliaNode;
            // Inject '128' as the bits argument
            const instance = new CipherClass('128', key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};