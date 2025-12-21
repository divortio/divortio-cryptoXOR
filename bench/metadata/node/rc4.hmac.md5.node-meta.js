/** @type {import('../../types.js').CipherMetadata} */
export default {
    id: "rc4-hmac-md5-node",
    name: "RC4-MD5 (Node)",
    fullName: "RC4 Encryption with MD5 MAC (Stitched)",
    description: "A legacy 'stitched' cipher suite designed for SSL/TLS. Combines broken encryption with a weak hash.",
    acceleration: "hardware",

    impl: {
        environment: "node",
        engine: "OpenSSL",
        file: "bench/libs/node/rc4.hmac.md5.node.js",
        class: "Rc4HmacMd5Node",
        api: "sync"
    },

    specs: {
        type: "stitched", // Specialized combined mode
        keySize: 128,
        ivSize: 0,
        blockSize: 8
    },

    features: {
        integrity: true, // MD5 HMAC included
        aad: false,
        parallelizable: false,
        streaming: true
    },

    metrics: {
        speed: 3,        // Moderate. MD5 calculation adds overhead compared to pure RC4.
        trend: "linear"
    },

    security: {
        level: "broken",
        rating: 0,
        risk: "critical",
        vulnerabilities: {
            nonceReuse: false,
            paddingOracle: false,
            biasedOutput: true,
            keyReuse: true,
            timing: false,
            other: ["MD5 Collisions", "RC4 Biases"]
        },
        recommended: false
    },

    meta: {
        year: 1995, // Approximate era of SSL 3.0
        designer: "Netscape / OpenSSL",
        description: "A specific optimization in OpenSSL ('stitching') that performs RC4 encryption and MD5 hashing in a single pass. Historically used to speed up SSL handshakes on old hardware.",
        usage: "Legacy SSL 3.0 / TLS 1.0"
    },

    code: {
        env: "node",
        path: "./libs/node/rc4.hmac.md5.node.js",
        exportName: "Rc4HmacMd5Node",
        type: "class",
        signature: ["$KEY", "$IV"],
        limits: {
            keyBytes: 16,
            ivBytes: 0
        },
        factory: async (key, iv) => {
            const module = await import('../../libs/node/rc4.hmac.md5.node.js');
            const CipherClass = module.Rc4HmacMd5Node;
            const instance = new CipherClass(key, iv);
            return (buffer) => instance.process(buffer);
        }
    }
};