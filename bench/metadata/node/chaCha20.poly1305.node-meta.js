/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "chacha20-poly1305-node",
    name: "ChaCha20-Poly1305 (Node)",
    fullName: "ChaCha20 with Poly1305 MAC (IETF)",
    description: "The primary alternative to AES-GCM in TLS 1.3. Combines ChaCha20 encryption with the extremely fast Poly1305 authenticator.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/chaCha20.poly1305.node.js",
        class: "ChaCha20Poly1305Node",
        api: "sync"
    },

    specs: {
        type: "aead",
        keySize: 256,
        ivSize: 96,      // 12 bytes (Strict IETF requirement)
        blockSize: 512   // 64 bytes
    },

    features: {
        integrity: true, // Poly1305 (128-bit tag)
        aad: true,       // AEAD supported
        parallelizable: true,
        streaming: true
    },

    metrics: {
        speed: 4,        // High (~800-1000 MB/s). Poly1305 is very fast, but typically trails AES-GCM (AES-NI + CLMUL) on servers.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal: Leaks Poly1305 key, allowing forgery of all future messages
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: true
    },

    meta: {
        year: 2015, // RFC 7539
        designer: "IETF / Daniel J. Bernstein",
        description: "An AEAD construction that pairs ChaCha20 with the Poly1305 MAC. It is immune to timing attacks and does not rely on complex Galois Field arithmetic like GCM.",
        usage: "TLS 1.3, SSH, WireGuard, QUIC"
    },

    code: {
        env: "node",
        path: "./libs/node/chaCha20.poly1305.node.js",
        exportName: "ChaCha20Poly1305Node",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/chaCha20.poly1305.node.js');
            const CipherClass = module.ChaCha20Poly1305Node;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};