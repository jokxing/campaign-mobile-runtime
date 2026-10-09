import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../app/', import.meta.url));
const violations = [];
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (file !== path.join(root, 'api')) await scan(file);
    } else if (/\.(vue|[cm]?[jt]sx?)$/.test(entry.name)) {
      const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/\/api\/|\$fetch\b|\b(?:useFetch|useLazyFetch|fetch)\s*\(|\bnew\s+(?:EventSource|XMLHttpRequest)\b|\baxios\b/.test(line.replace(/(['"])~\/api\/[^'"]+\1/g, ''))) {
          violations.push(`${path.relative(root, file)}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
await scan(root);
if (violations.length) {
  console.error('Move API addresses and transport calls into app/api/:\n' + violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('API boundary check passed.');
}
