// Converts every photo in pictures/raw into a web-sized WebP in pictures/cards.
// The card's word is the file name (shown by the app above the photo), so nothing is drawn on the image.
//   npm run cards            only new or changed photos
//   npm run cards -- --force rebuild everything
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(root, 'pictures/raw');
const OUT = path.join(root, 'pictures/cards');
const MAX_EDGE = 1400;
const force = process.argv.includes('--force');

await mkdir(OUT, { recursive: true });
const raws = (await readdir(RAW)).filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));
const wanted = new Set();
let built = 0;

for (const file of raws) {
  const name = path.parse(file).name.normalize('NFC');
  const src = path.join(RAW, file);
  const dest = path.join(OUT, `${name}.webp`);
  wanted.add(`${name}.webp`);
  const [srcTime, destTime] = await Promise.all([stat(src), stat(dest).catch(() => null)]).then(([s, d]) => [s.mtimeMs, d?.mtimeMs ?? 0]);
  if (!force && destTime >= srcTime) continue;
  await sharp(src)
    .rotate() // honour EXIF orientation
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' }) // transparent PNGs onto white, like a printed card
    .webp({ quality: 80 })
    .toFile(dest);
  built++;
}

// Drop cards whose photo was deleted.
let removed = 0;
for (const file of await readdir(OUT)) {
  if (!wanted.has(file)) {
    await unlink(path.join(OUT, file));
    removed++;
  }
}

console.log(`${raws.length} photos → ${built} built, ${raws.length - built} up to date, ${removed} removed.`);
