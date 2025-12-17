import { createSfc32 } from '../src/index.mjs';

// ==========================================
// EXAMPLE 4: XOR Stream Cipher
// ==========================================

const SECRET_MESSAGE = "Attack at Dawn! ⚔️";
const SHARED_KEY = [0xDEAD, 0xBEEF, 0xCAFE, 0xBABE]; // The "Password"

// Helper: XOR a string against the PRNG stream
function processString(text, seed) {
    const rng = createSfc32(...seed);
    const inputBytes = Buffer.from(text, 'utf-8'); // Convert string to bytes
    const outputBytes = new Uint8Array(inputBytes.length);

    // Create a temporary buffer for the random stream matching input size
    const keyStream = new Uint8Array(inputBytes.length);
    rng.stream(keyStream); // Fill it with "pad" bytes

    // XOR Loop
    for (let i = 0; i < inputBytes.length; i++) {
        outputBytes[i] = inputBytes[i] ^ keyStream[i];
    }

    return Buffer.from(outputBytes);
}

console.log(`Original:  "${SECRET_MESSAGE}"`);

// 1. Encrypt (Alice)
const encrypted = processString(SECRET_MESSAGE, SHARED_KEY);
console.log(`Encrypted: <${encrypted.toString('hex')}>`);

// 2. Decrypt (Bob) - Must use SAME seed
const decryptedBuffer = processString(encrypted.toString('utf-8'), SHARED_KEY);
// Note: In real XOR, you'd pass the raw buffer, but for this simpler example
// we assume the "processString" function re-generates the keystream identically.
// Actually, let's just re-run the XOR logic manually to prove it.

const rngBob = createSfc32(...SHARED_KEY);
const padBob = new Uint8Array(encrypted.length);
rngBob.stream(padBob);

const finalBytes = new Uint8Array(encrypted.length);
for(let i=0; i<encrypted.length; i++) {
    finalBytes[i] = encrypted[i] ^ padBob[i];
}

console.log(`Decrypted: "${Buffer.from(finalBytes).toString('utf-8')}"`);