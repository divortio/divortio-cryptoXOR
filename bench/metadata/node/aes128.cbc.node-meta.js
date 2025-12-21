/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-128-cbc-node",
    name: "AES-128-CBC (Node)",
    fullName: "Advanced Encryption Standard (128-bit) - Cipher Block Chaining",
    description: "Standard hardware-accelerated block cipher provided by OpenSSL. Requires padding and serial execution for encryption.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes128.cbc.node.js",
        class: "Aes128CbcNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 128,
        ivSize: 128,    // 16 bytes
        blockSize: 128  // 16 bytes
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false, // Encryption is serial (chaining dependency)
        streaming: true
    },

    metrics: {
        speed: 3,              // Moderate (~400 MB/s). Slower than CTR/GCM because it cannot pipeline blocks in hardware.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 4,
        risk: "low",
        vulnerabilities: {
            nonceReuse: false,   // IV reuse leaks equality of first block (less fatal than CTR)
            paddingOracle: true, // Vulnerable to padding oracles if used without a MAC
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2001,
        designer: "NIST / Joan Daemen & Vincent Rijmen",
        description: "The classic mode of operation for AES. It XORs each plaintext block with the previous ciphertext block before encryption. Mandatory in many legacy protocols.",
        usage: "File Encryption, Legacy Backend Systems"
    },

    code: {
        env: "node",
        path: "./libs/node/aes128.cbc.node.js",
        exportName: "Aes128CbcNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 16
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes128.cbc.node.js');
            const CipherClass = module.Aes128CbcNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};