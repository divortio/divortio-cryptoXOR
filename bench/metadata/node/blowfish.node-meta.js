/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "blowfish-node",
    name: "Blowfish (Node)",
    fullName: "Blowfish (CBC Mode)",
    description: "Legacy 64-bit block cipher. Once a popular alternative to DES, now considered legacy due to its small block size (Sweet32 attack).",
    acceleration: "hardware", // OpenSSL

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/blowfish.node.js",
        class: "BlowfishNode",
        api: "sync"
    },

    specs: {
        type: "block",
        keySize: 128,    // Variable (32-448), benchmark uses 128
        ivSize: 64,      // 8 bytes (Critical weakness for large data)
        blockSize: 64    // 8 bytes
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: false,
        streaming: true
    },

    metrics: {
        speed: 2,        // Low/Moderate (~150 MB/s). Slow key setup, decent encryption speed.
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
            other: ["Sweet32 (Birthday attack on 64-bit blocks)"]
        },
        recommended: false
    },

    meta: {
        year: 1993,
        designer: "Bruce Schneier",
        description: "Designed as a drop-in replacement for DES. Its complex key schedule makes it slow to initialize (good for password hashing, bad for high-speed streams).",
        usage: "Legacy VPNs, Password Hashing (bcrypt base)"
    },

    code: {
        env: "node",
        path: "./libs/node/blowfish.node.js",
        exportName: "BlowfishNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16, // 128-bit key
            ivBytes: 8    // 64-bit IV
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/blowfish.node.js');
            const CipherClass = module.BlowfishNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};