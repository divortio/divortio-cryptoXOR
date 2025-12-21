/** @type {import('../types.js').CipherMetadata} */
export default {
    id: "xoshiro128-xor",
    name: "Xoshiro128 (XOR)",
    fullName: "Xoshiro128** PRNG Stream Cipher",
    description: "Extremely fast, non-cryptographic PRNG used as a stream cipher. Excellent statistical properties but predictable if state is recovered.",
    acceleration: "software",

    impl: {
        environment: "v8",
        engine: "V8 JIT",
        file: "src/cryptoXOR.xoshiro128.js",
        class: "Xoshiro128", // Assuming the class export matches the name
        api: "sync"
    },

    specs: {
        type: "prng",    // Technically a PRNG, used here as a Stream Cipher
        keySize: 128,    // 128-bit state (4 x 32-bit integers)
        ivSize: 0,       // Seeds are usually derived from Key
        blockSize: 32    // Native output is 32-bit integers
    },

    features: {
        integrity: false,
        aad: false,
        parallelizable: true, // Xoshiro supports 'jump' functions for parallel streams
        streaming: true
    },

    metrics: {
        speed: 5,        // Extreme. Much faster than ChaCha/AES because it lacks cryptographic mixing complexity.
        trend: "linear"
    },

    security: {
        level: "weak",
        rating: 1,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: true,    // Fatal (Plaintext XOR)
            paddingOracle: false,
            biasedOutput: false, // Passes BigCrush, so statistically unbiased...
            keyReuse: true,
            timing: false,
            other: ["Not a CSPRNG", "State Recovery Attack (Linear Algebra)"]
        },
        recommended: false     // Do not use for secrets
    },

    meta: {
        year: 2018,
        designer: "David Blackman and Sebastiano Vigna",
        description: "Part of the Xoshiro/Xoroshiro family. It uses shift, rotate, and XOR operations to generate numbers. While it is one of the fastest and statistically strongest non-crypto PRNGs, it should not be used where an adversary can analyze the output.",
        usage: "Games, Simulations, Monte Carlo methods, Obfuscation"
    },

    code: {
        env: "v8",
        path: "../../../src/cryptoXOR.xoshiro128.js", // Relative path from /bench/metadata/cryptoXOR/
        exportName: "default", // Assuming default export
        type: "class",
        signature: ["$KEY"],   // Usually takes a seed/key
        limits: {
            keyBytes: 16, // 128-bit seed
            ivBytes: 0
        },
        factory: async (key, iv) => {
            // Import from the src directory
            const module = await import('../../../src/cryptoXOR.xoshiro128.js');
            const CipherClass = module.default || module.Xoshiro128;
            const instance = new CipherClass(key); // Standard PRNGs usually just take a seed
            return (buffer) => instance.process(buffer);
        }
    }
};