/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "des3-node",
    name: "3DES (Node)",
    fullName: "Triple DES (EDE3) - CBC Mode",
    description: "Applies DES three times (Encrypt-Decrypt-Encrypt) to increase key size. Very slow and marked for retirement by NIST.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/des3.node.js",
        class: "Des3Node",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 192,    // 3 keys * 64 bits (effective 168 bits)
        ivSize: 64,      // 8 bytes
        blockSize: 64    // 8 bytes (Sweet32 Vulnerability)
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false,
        streaming: true
    },

    metrics: {
        speed: 1,        // Legacy (< 30 MB/s). Extremely slow due to triple execution of an already slow cipher.
        trend: "plateau"
    },

    security: {
        level: "legacy",
        rating: 2,
        risk: "high",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: true,
            biasedOutput: false,
            keyReuse: false,
            timing: false,
            other: ["Sweet32 (Small block size)", "Slow Performance"]
        },
        recommended: false
    },

    meta: {
        year: 1999,
        designer: "NIST",
        description: "Created to extend the life of DES hardware by running it three times. It stopped the brute-force attacks but didn't fix the block size issues. Superseded by AES.",
        usage: "Legacy Banking (EMV), EMV Chip Cards"
    },

    code: {
        env: "node",
        path: "./libs/node/des3.node.js",
        exportName: "Des3Node",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 24, // 192 bits
            ivBytes: 8
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/des3.node.js');
            const CipherClass = module.Des3Node;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};