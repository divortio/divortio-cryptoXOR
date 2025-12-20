export class Aes256CtrWeb {
    /**
     * @param {Uint8Array} key - Must be 32 bytes (256-bit).
     * @param {Uint8Array} nonce - 12 or 16 bytes.
     */
    constructor(key, nonce) {
        if (key.byteLength !== 32) {
            throw new Error("Aes256CtrWeb: Key must be 32 bytes.");
        }

        let counter = new Uint8Array(16);
        if (nonce.length === 12) {
            counter.set(nonce);
        } else if (nonce.length === 16) {
            counter.set(nonce);
        } else {
            throw new Error("Aes256CtrWeb: Nonce must be 12 or 16 bytes");
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
        return crypto.subtle.encrypt(
            { name: "AES-CTR", counter: this.counter, length: 64 },
            key,
            buffer
        );
    }
}