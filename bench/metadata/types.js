/**
 * @fileoverview Type definitions for the CryptoXOR Cipher Catalog.
 * Serves as the "Source of Truth" for UI display, documentation generation,
 * and automated benchmark execution.
 */

/**
 * @typedef {Object} CipherMetadata
 * @property {string} id - Unique identifier (slug-friendly, e.g., 'rc4-node').
 * @property {string} name - Short display name (e.g., 'RC4', 'AES-128-GCM').
 * @property {string} fullName - Formal algorithm name (e.g., 'Rivest Cipher 4').
 * @property {string} description - Single sentence summary (e.g. "Fastest software stream cipher.").
 * @property {string} [variant] - Specific variant or mode (e.g., 'HMAC-MD5', 'Drop-768').
 * @property {'hardware'|'software'} acceleration - 'hardware' (Node C++/WebCrypto) vs 'software' (V8 Pure JS).
 * @property {CipherMetrics} metrics - Numeric ratings and performance characteristics.
 * @property {CipherVulnerabilities} vulnerabilities - Categorical attack vector flags.
 * @property {CipherImplementation} impl - High-level implementation details.
 * @property {CipherSpecs} specs - Cryptographic parameters and dimensions.
 * @property {CipherFeatures} features - Functional capabilities.
 * @property {CipherSecurity} security - General security assessment.
 * @property {CipherMeta} meta - Historical context and descriptive text.
 * @property {CipherExecutable} code - Instructions for the benchmark runner.
 */

/**
 * @typedef {Object} CipherMetrics
 * @property {1|2|3|4|5} speed - Relative Speed Rating (at 64MB).
 * - 5: Extreme (> 1 GB/s) - e.g. AES-CTR, SplitMix32
 * - 4: High (> 500 MB/s)   - e.g. ChaCha20 (Node), SFC32-Stream
 * - 3: Moderate (> 100 MB/s)- e.g. RC4 (V8)
 * - 2: Low (> 20 MB/s)     - e.g. ChaCha20 (V8)
 * - 1: Legacy (< 20 MB/s)  - e.g. Rabbit, 3DES
 * @property {'linear'|'plateau'|'tank'} trend - Performance behavior at large sizes (64MB+).
 * - 'linear': Scales perfectly with size (e.g. AES-CTR).
 * - 'plateau': Hits a ceiling due to memory/GC (e.g. some V8 implementations).
 * - 'tank': Performance degrades significantly at scale.
 */

/**
 * @typedef {Object} CipherVulnerabilities
 * @property {boolean} nonceReuse - Catastrophic failure if Nonce is reused (e.g. GCM/CTR/Poly1305).
 * @property {boolean} paddingOracle - Vulnerable to padding oracles (e.g. CBC without MAC).
 * @property {boolean} biasedOutput - Output has statistical biases (e.g. RC4).
 * @property {boolean} keyReuse - Fatal if key is reused (e.g. One-Time Pad style streams).
 * @property {boolean} timing - Susceptible to timing attacks (non-constant time ops).
 * @property {string[]} [other] - Free-form list of specific CVEs or weaknesses (e.g. "Sweet32").
 */

/**
 * @typedef {Object} CipherImplementation
 * @property {'node'|'v8'|'web'} environment - The runtime environment required.
 * @property {'OpenSSL'|'V8 JIT'|'WebCrypto'|'WASM'} engine - The underlying execution engine.
 * @property {string} file - Source file path relative to project root.
 * @property {string} class - Name of the class or function implemented.
 * @property {'sync'|'async'|'stream'} api - The nature of the API.
 */

/**
 * @typedef {Object} CipherSpecs
 * @property {'stream'|'block'|'aead'|'stitched'|'hash'|'prng'} type - The cryptographic primitive type.
 * @property {number} keySize - Key size in bits (e.g., 128, 256).
 * @property {number} ivSize - IV/Nonce size in bits (e.g., 96, 128). Use 0 if not applicable.
 * @property {number} [stateSize] - Internal state size in bits.
 * @property {number} [blockSize] - Native block processing size in bits.
 */

/**
 * @typedef {Object} CipherFeatures
 * @property {boolean} integrity - Built-in message authentication (Tag/MAC).
 * @property {boolean} aad - Supports Additional Authenticated Data (AEAD).
 * @property {boolean} parallelizable - Can process blocks in parallel.
 * @property {boolean} streaming - Capable of processing infinite streams.
 */

/**
 * @typedef {Object} CipherSecurity
 * @property {'secure'|'legacy'|'weak'|'broken'} level - Overall security verdict.
 * @property {number} rating - Visual rating (0-5 stars).
 * @property {'low'|'medium'|'high'|'critical'} risk - UI color indicator.
 * @property {boolean} recommended - Whether this cipher is recommended for new use.
 */

/**
 * @typedef {Object} CipherMeta
 * @property {number} year - Year of publication or standardization.
 * @property {string} designer - Author(s) or organization.
 * @property {string} description - Long form description.
 * @property {string} usage - Common real-world applications.
 * @property {string} [paperUrl] - Link to the academic paper or RFC.
 */

/**
 * @typedef {Object} CipherExecutable
 * @description Configuration used by the benchmark runner.
 * @property {'node'|'v8'|'web'} env - Runtime constraint.
 * @property {string} path - Import path for the library.
 * @property {string} [exportName] - The export to use (default or named).
 * @property {'class'|'function'|'singleton'} type - Instantiation strategy.
 * @property {(string|'$KEY'|'$IV'|'$BUFFER')[]} signature - Arguments for instantiation.
 * @property {CipherLimits} limits - Constraints for test data generation.
 * @property {function(Uint8Array, Uint8Array): Promise<function(Uint8Array): (Uint8Array|Promise<Uint8Array>)>} [factory] -
 * Optional Lazy-Loader. If present, the benchmark runner should use this
 * to instantiate the cipher, avoiding static imports of incompatible modules.
 */

/**
 * @typedef {Object} CipherLimits
 * @property {number} keyBytes - Required key length.
 * @property {number} ivBytes - Required IV length.
 * @property {number} [maxDataBytes] - Optional limit for algos that crash on large buffers.
 */

export {};