/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "chacha20-node",
    name: "ChaCha20 (Node)",
    fullName: "ChaCha20 Stream Cipher (OpenSSL)",
    description: "High-speed stream cipher designed for consistent performance across all platforms, even without hardware acceleration.",
    acceleration: "hardware", // OpenSSL implementation is highly optimized assembly

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/chaCha20.node.js",
        class: "ChaCha20Node",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 256,    // 32 bytes
        ivSize: 96,      // 12 bytes (Standard IETF nonce)
        blockSize: 512   // 64 bytes (Internal block size)
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Random access via block counter
        streaming: true
    },

    metrics: {
        speed: 4,        // High (~900-1100 MB/s). Slightly slower than AES-NI GCM on modern Intel chips.
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
        year: 2008,
        designer: "Daniel J. Bernstein",
        description: "The successor to Salsa20. It uses ARX (Add-Rotate-Xor) operations to achieve high security and performance in software. It is the preferred cipher for mobile devices without AES hardware acceleration.",
        usage: "WireGuard, Mobile TLS, Random Number Generation"
    },

    code: {
        env: "node",
        path: "./libs/node/chaCha20.node.js",
        exportName: "ChaCha20Node",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/chaCha20.node.js');
            const CipherClass = module.ChaCha20Node;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};