export class AesCbcWeb {
    constructor(key, nonce) {
        // AES-CBC requires a 16-byte IV.
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
            { name: "AES-CBC", iv: this.iv },
            key,
            buffer
        );
    }
}