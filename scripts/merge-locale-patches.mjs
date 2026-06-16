import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '..', 'locales');

function deepMerge(base, patch) {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

for (const locale of ['hi', 'or', 'ta', 'te']) {
  const mainPath = path.join(localesDir, `${locale}.json`);
  const patchPath = path.join(localesDir, 'patches', `${locale}.json`);
  const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
  const merged = deepMerge(main, patch);
  fs.writeFileSync(mainPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Merged ${locale}.json`);
}
