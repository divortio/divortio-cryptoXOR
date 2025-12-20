export class Aes128CtrWeb {
    /**
     * @param {Uint8Array} key - Must be 16 bytes (128-bit).
     * @param {Uint8Array} nonce - 12 or 16 bytes.
     */
    constructor(key, nonce) {
        if (key.byteLength !== 16) {
            throw new Error("Aes128CtrWeb: Key must be 16 bytes.");
        }

        // AES-CTR in Web Crypto requires a 16-byte Counter block.
        // We pad the benchmark's standard 12-byte nonce to 16 bytes.
        let counter = new Uint8Array(16);
        if (nonce.length === 12) {
            counter.set(nonce);
            // Bytes 12-15 remain 0 (Initial Counter)
        } else if (nonce.length === 16) {
            counter.set(nonce);
        } else {
            throw new Error("Aes128CtrWeb: Nonce must be 12 or 16 bytes");
        }
        this.counter = counter;

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
        // length: 64 bits for the counter part (standard)
        return crypto.subtle.encrypt(
            { name: "AES-CTR", counter: this.counter, length: 64 },
            key,
            buffer
        );
    }
}