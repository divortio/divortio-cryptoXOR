export class Aes128GcmWeb {
    /**
     * @param {Uint8Array} key - Must be 16 bytes (128-bit).
     * @param {Uint8Array} nonce - 12 bytes (Standard GCM IV).
     */
    constructor(key, nonce) {
        if (key.byteLength !== 16) {
            throw new Error("Aes128GcmWeb: Key must be 16 bytes.");
        }
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
        // Output includes the authentication tag appended
        return crypto.subtle.encrypt(
            { name: "AES-GCM", tagLength: 128, iv: this.nonce },
            key,
            buffer
        );
    }
}