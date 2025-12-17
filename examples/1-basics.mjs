
import { sfc32 } from '../src/index.mjs';

// ==========================================
// EXAMPLE 1: Basic Usage (Singleton)
// ==========================================
console.log('--- Raw Integers ---');
// sfc32() returns a 32-bit unsigned integer (0 to 4,294,967,295)
console.log('Random Int 1:', sfc32());
console.log('Random Int 2:', sfc32());

console.log('\n--- Helper Functions ---');

// 1. Normalized Float [0, 1)
// Standard "Math.random()" replacement
const randomFloat = () => (sfc32() >>> 0) / 4294967296;
console.log('Float (0-1):', randomFloat().toFixed(6));

// 2. Integer in Range [min, max]
// Useful for game logic, dice, etc.
const randomRange = (min, max) => {
    const range = max - min + 1;
    const val = (sfc32() >>> 0) % range;
    return min + val;
};
console.log('D20 Roll:', randomRange(1, 20));
console.log('D20 Roll:', randomRange(1, 20));

// 3. Boolean (Coin Flip)
const coinFlip = () => (sfc32() & 1) === 0;
console.log('Heads?', coinFlip());