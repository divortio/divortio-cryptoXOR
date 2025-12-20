export class Aes128CbcWeb {
    /**
     * @param {Uint8Array} key - Must be 16 bytes (128-bit).
     * @param {Uint8Array} nonce - 12 or 16 bytes (padded to 16).
     */
    constructor(key, nonce) {
        if (key.byteLength !== 16) {
            throw new Error("Aes128CbcWeb: Key must be 16 bytes.");
        }

        // AES-CBC requires a 16-byte IV.
        // We pad the benchmark's standard 12-byte nonce to 16 bytes.
        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(nonce.subarray(0, 16));
            iv = padded;
        }
        this.iv = iv;

        // Pre-import key to avoid overhead during the loop
        this.keyPromise = crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-CBC" },
            false,
            ["encrypt"]
        );
    }

    async process(buffer) {
        const key = await this.keyPromise;
        return crypto.subtle.encrypt(
            { name: "AES-CBC", iv: this.iv },
            key,
            buffer
        );
    }
}