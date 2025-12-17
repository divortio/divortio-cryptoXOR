import { createSfc32 } from '../src/index.mjs';

// ==========================================
// EXAMPLE 3: Deterministic Seeding
// ==========================================

const SEED = [0x1234, 0x5678, 0x9ABC, 0xDEF0];

console.log(`Using Seed: ${SEED}`);

// Player 1 (Instance A)
const rngA = createSfc32(...SEED);

// Player 2 (Instance B) - Same Seed
const rngB = createSfc32(...SEED);

console.log('\n--- Sync Check ---');
const valA1 = rngA.next();
const valB1 = rngB.next();

console.log(`Instance A: ${valA1}`);
console.log(`Instance B: ${valB1}`);

if (valA1 === valB1) {
    console.log('✅ Success: Instances are perfectly synchronized.');
} else {
    console.error('❌ Error: Instances drifted!');
}

console.log('\n--- Stream Sync Check ---');
// Verify streams are also deterministic
const bufA = new Uint8Array(16);
const bufB = new Uint8Array(16);

rngA.stream(bufA);
rngB.stream(bufB);

console.log('Buffer A:', bufA.join(','));
console.log('Buffer B:', bufB.join(','));