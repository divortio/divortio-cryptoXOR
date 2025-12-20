export class AesGcmWeb {
    constructor(key, nonce) {
        this.nonce = nonce;

        this.keyPromise = crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );
    }

    async process(buffer) {
        const key = await this.keyPromise;

        // AES-GCM in Web Crypto allows additionalData (AAD),
        // but for basic benchmarking we just encrypt the buffer.
        return crypto.subtle.encrypt(
            { name: "AES-GCM", iv: this.nonce },
            key,
            buffer
        );
    }
}