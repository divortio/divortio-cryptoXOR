/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "chacha20-v8",
    name: "ChaCha20 (V8)",
    fullName: "ChaCha20 Stream Cipher (Pure JS)",
    description: "A V8-optimized software implementation using TypedArrays. Demonstrates the performance ceiling of pure JavaScript against Native C++ bindings.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "bench/libs/v8/chaCha20.v8.js",
        class: "FastChaCha20",
        api: "sync"
    },

    specs: {
        type: "stream",
        keySize: 256,
        ivSize: 96,      // 12 bytes (Standard IETF Nonce)
        blockSize: 512   // 64 bytes (Internal State)
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Random access via counter
        streaming: true
    },

    metrics: {
        speed: 2,         // Low (~55-60 MB/s). Compare to Native (~1300 MB/s).
        trend: "plateau"  // Performance flattens quickly due to V8 execution overhead.
    },

    security: {
        level: "secure",
        rating: 5,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal (Plaintext XOR)
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false,       // ARX designs are generally timing-safe (constant time), even in software
        },
        recommended: false     // Secure algorithm, but use Native/WebCrypto for performance
    },

    meta: {
        year: 2008,
        designer: "Daniel J. Bernstein",
        description: "An improvement on Salsa20 with better diffusion per round. It relies on ARX (Add-Rotate-Xor) operations which are efficient in software, but pure JS still lags behind SIMD-optimized native code.",
        usage: "Educational, Fallback for environments without WebCrypto"
    },

    code: {
        env: "v8",
        path: "./libs/v8/chaCha20.v8.js",
        exportName: "default",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 32,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/v8/chaCha20.v8.js');
            const CipherClass = module.default;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};