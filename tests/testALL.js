import { run } from 'node:test'; // Native Node Test Runner
import { spec } from 'node:test/reporters';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.join(__dirname, 'lib');

// Helper to recursively find test files
function findTests(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findTests(filePath, fileList);
        } else if (file.endsWith('.test.js')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const testFiles = findTests(TEST_DIR);

console.log(`\nFound ${testFiles.length} test files. Running...\n`);

run({
    files: testFiles,
    concurrency: true // Run tests in parallel for speed
}).compose(new spec()).pipe(process.stdout);