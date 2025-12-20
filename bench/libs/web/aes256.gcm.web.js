

export class Aes256GcmWeb {
    /**
     * @param {Uint8Array} key - Must be 32 bytes (256-bit).
     * @param {Uint8Array} nonce - 12 bytes.
     */
    constructor(key, nonce) {
        if (key.byteLength !== 32) {
            throw new Error("Aes256GcmWeb: Key must be 32 bytes.");
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
        return crypto.subtle.encrypt(
            { name: "AES-GCM", iv: this.nonce ,
                tagLength: 256
            },
            key,
            buffer
        );
    }
}