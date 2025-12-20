export class Aes256CbcWeb {
    /**
     * @param {Uint8Array} key - Must be 32 bytes (256-bit).
     * @param {Uint8Array} nonce - 12 or 16 bytes (padded to 16).
     */
    constructor(key, nonce) {
        if (key.byteLength !== 32) {
            throw new Error("Aes256CbcWeb: Key must be 32 bytes.");
        }

        let iv = nonce;
        if (iv.length !== 16) {
            const padded = new Uint8Array(16);
            padded.set(nonce.subarray(0, 16));
            iv = padded;
        }
        this.iv = iv;

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
            { name: "AES-CBC", iv: this.iv,  tagLength: 256 },
            key,
            buffer
        );
    }
}