export class AesCtrWeb {
    constructor(key, nonce) {
        this.keyBytes = key;

        // Web Crypto AES-CTR requires a 16-byte Counter block.
        // We pad the 12-byte nonce if necessary.
        let counter = new Uint8Array(16);
        if (nonce.length === 12) {
            counter.set(nonce);
            // Bytes 12-15 are 0 (Initial Counter)
        } else if (nonce.length === 16) {
            counter.set(nonce);
        } else {
            throw new Error("AES-CTR Web: Nonce must be 12 or 16 bytes");
        }
        this.counter = counter;

        // Pre-import key to avoid overhead during benchmarking loop
        this.keyPromise = crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-CTR" },
            false,
            ["encrypt"]
        );
    }

    async process(buffer) {
        const key = await this.keyPromise;

        // One-shot encryption.
        // 'length' specifies the number of bits in the counter block used for the counter.
        // Standard is 64 bits (counter) or 128 bits (full block).
        return crypto.subtle.encrypt(
            { name: "AES-CTR", counter: this.counter, length: 64 },
            key,
            buffer
        );
    }
}