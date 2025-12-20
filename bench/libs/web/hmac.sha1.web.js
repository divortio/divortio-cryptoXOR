export class HmacSha1Web {
    constructor(key) {
        this.keyPromise = crypto.subtle.importKey(
            "raw",
            key,
            { name: "HMAC", hash: "SHA-1" },
            false,
            ["sign"]
        );
    }

    async process(buffer) {
        const key = await this.keyPromise;
        return crypto.subtle.sign(
            "HMAC",
            key,
            buffer
        );
    }
}

