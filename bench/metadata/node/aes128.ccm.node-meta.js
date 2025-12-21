/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "aes-128-ccm-node",
    name: "AES-128-CCM (Node)",
    fullName: "Advanced Encryption Standard (128-bit) - Counter with CBC-MAC",
    description: "Authenticated encryption mode focused on compact code size. Slower than GCM because it is not parallelizable and requires two passes (MAC then Encrypt).",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/aes128.ccm.node.js",
        class: "Aes128CcmNode",
        api: "sync"
    },

    specs: {
        type: "aead",
        keySize: 128,
        ivSize: 96,      // 12 bytes is the standard nonce length
        blockSize: 128
    },

    features: {
        integrity: true, // CBC-MAC Authentication
        aad: true,       // Supports AAD
        parallelizable: false, // CCM is NOT parallelizable (CBC-MAC dependency)
        streaming: false // Node.js CCM requires total message length upfront (AuthTagLength option)
    },

    metrics: {
        speed: 3,        // Moderate. significantly slower than GCM due to dual-pass nature.
        trend: "linear"
    },

    security: {
        level: "secure",
        rating: 4,
        risk: "low",
        vulnerabilities: {
            nonceReuse: true,    // Fatal
            paddingOracle: false,
            biasedOutput: false,
            keyReuse: false,
            timing: false
        },
        recommended: false     // Prefer GCM for performance unless constrained by protocol
    },

    meta: {
        year: 2003,
        designer: "NIST (Whiting, Housley, Ferguson)",
        description: "AES-CCM combines CTR encryption with CBC-MAC integrity. It was designed as an alternative to OCB (patent-encumbered) and GCM (complex hardware reqs). Common in IoT (Zigbee) and WPA2.",
        usage: "WPA2, Zigbee, IPSec, TLS 1.2"
    },

    code: {
        env: "node",
        path: "./libs/node/aes128.ccm.node.js",
        exportName: "Aes128CcmNode",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 12
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/aes128.ccm.node.js');
            const CipherClass = module.Aes128CcmNode;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};