/* Generate the PNG icon set and iOS startup images for the PWA.
 *
 * Why this exists: the app shipped an SVG-only icon. iOS does NOT support SVG
 * for apple-touch-icon — "Add to Home Screen" there produced a blank tile or a
 * page screenshot, and Android got a single scaled raster with no maskable
 * variant. Bundled artwork therefore has to be real PNGs at the sizes both
 * platforms actually ask for.
 *
 * Source artwork: public/icon.svg is a 1.1MB auto-traced vector — an orange
 * (#FC9F47) circle holding Amy's portrait, sitting on an opaque white square.
 * The white square is a trace artifact and shows up as an ugly white box
 * whenever the art is composited onto another background, so this script cuts
 * the circle out onto transparency first, then re-tiles it:
 *
 *   icons        brand-orange full-bleed tile + portrait (matches theme)
 *   maskable     same tile, art shrunk into Android's 80% safe zone
 *   splash       cream #FFF9F5 (the page background) + floating portrait
 *
 * Run:  node tools/gen-pwa-icons.js
 * Out:  public/icons/*.png, public/splash/*.png
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/icon.svg');
const ICON_DIR = path.join(ROOT, 'public/icons');
const SPLASH_DIR = path.join(ROOT, 'public/splash');

const BRAND = { r: 252, g: 159, b: 71, alpha: 1 };  // #FC9F47 — theme color
const CREAM = { r: 255, g: 249, b: 245, alpha: 1 }; // #FFF9F5 — page background
const WHITE = { r: 254, g: 254, b: 254, alpha: 1 }; // trace background, for fringe check

let sharp;
try {
  sharp = require(path.join(process.env.NODE_PATH || '', 'sharp'));
} catch (e) {
  sharp = require('sharp');
}

// ---------------------------------------------------------------- icons
// 192 / 512 are what Chrome's installability check looks for. 180 is the iOS
// home-screen tile (full-bleed, iOS rounds the corners itself). Maskable
// variants keep the portrait inside Android's safe zone so circle/squircle
// masks cannot clip it.
const ICONS = [
  { file: 'icon-192.png', size: 192, art: 0.92 },
  { file: 'icon-512.png', size: 512, art: 0.92 },
  { file: 'icon-maskable-192.png', size: 192, art: 0.72 },
  { file: 'icon-maskable-512.png', size: 512, art: 0.72 },
  { file: 'apple-touch-icon-180.png', size: 180, art: 0.92 },
  { file: 'favicon-32.png', size: 32, art: 0.92 },
];

// --------------------------------------------------------------- splash
// iOS picks a startup image by exact device resolution (portrait), so each
// entry needs its own media query in index.html. Width/height are the device's
// pixel resolution.
const SPLASH = [
  { file: 'iphone-se.png', w: 750, h: 1334 },          // SE 2/3, 8
  { file: 'iphone-8plus.png', w: 1242, h: 2208 },      // 8 Plus
  { file: 'iphone-x.png', w: 1125, h: 2436 },          // X, 11 Pro, 12 mini, 13 mini
  { file: 'iphone-xr.png', w: 828, h: 1792 },          // XR, 11
  { file: 'iphone-xsmax.png', w: 1242, h: 2688 },      // XS Max, 11 Pro Max
  { file: 'iphone-12.png', w: 1170, h: 2532 },         // 12, 13, 14
  { file: 'iphone-12max.png', w: 1284, h: 2778 },      // 12/13 Pro Max, 14 Plus
  { file: 'iphone-15.png', w: 1179, h: 2556 },         // 15, 15 Pro, 16
  { file: 'iphone-15max.png', w: 1290, h: 2796 },      // 15 Pro Max, 16 Plus
  { file: 'ipad-97.png', w: 1536, h: 2048 },           // iPad 9.7, mini 4
  { file: 'ipad-air.png', w: 1640, h: 2360 },          // iPad Air 10.9, iPad 10
  { file: 'ipad-mini6.png', w: 1488, h: 2266 },        // iPad mini 6
  { file: 'ipad-102.png', w: 1620, h: 2160 },          // iPad 10.2
  { file: 'ipad-pro11.png', w: 1668, h: 2388 },        // iPad Pro 11
  { file: 'ipad-pro129.png', w: 2048, h: 2732 },       // iPad Pro 12.9
];

// Cut the portrait circle out of the traced square. Returns a PNG buffer of
// the circle's bounding square with transparent corners.
async function circleCutout() {
  const S = 1024;
  const master = await sharp(SRC, { density: 1024 })
    .resize(S, S, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  // Find the circle on the middle row/column: first/last pixel that is not
  // the trace's white background.
  const { data, info } = await sharp(master).raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const isBg = (p) => Math.abs(p[0] - WHITE.r) <= 6 && Math.abs(p[1] - WHITE.g) <= 6 && Math.abs(p[2] - WHITE.b) <= 6;
  const mid = Math.floor(S / 2);
  let minX = S, maxX = 0, minY = S, maxY = 0;
  for (let x = 0; x < S; x++) {
    if (!isBg(at(x, mid))) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    if (!isBg(at(mid, x))) { if (x < minY) minY = x; if (x > maxY) maxY = x; }
  }
  if (maxX <= minX || maxY <= minY) throw new Error('could not locate the portrait circle');
  const size = Math.max(maxX - minX, maxY - minY) + 1;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const r = size / 2 - 2;             // 2px inward bias kills the white fringe

  const box = Math.round(size);
  const crop = await sharp(master)
    .extract({ left: Math.round(cx - size / 2), top: Math.round(cy - size / 2), width: box, height: box })
    .png().toBuffer();
  const mask = Buffer.from(
    '<svg width="' + box + '" height="' + box + '">' +
    '<circle cx="' + box / 2 + '" cy="' + box / 2 + '" r="' + Math.round(r) + '" fill="#fff"/></svg>'
  );
  return sharp(crop)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png().toBuffer();
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error('missing ' + SRC);
  fs.mkdirSync(ICON_DIR, { recursive: true });
  fs.mkdirSync(SPLASH_DIR, { recursive: true });

  const cut = await circleCutout();

  for (const ic of ICONS) {
    const artSize = Math.round(ic.size * ic.art);
    const art = await sharp(cut).resize(artSize, artSize, { fit: 'contain' }).png().toBuffer();
    await sharp({ create: { width: ic.size, height: ic.size, channels: 4, background: BRAND } })
      .composite([{
        input: art,
        top: Math.round((ic.size - artSize) / 2),
        left: Math.round((ic.size - artSize) / 2),
      }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(ICON_DIR, ic.file));
    console.log('icon  ', ic.file, ic.size + 'x' + ic.size);
  }

  for (const sp of SPLASH) {
    // Art occupies ~26% of the shorter edge — large enough to read, small
    // enough that a phone on its side still shows it whole.
    const artSize = Math.round(Math.min(sp.w, sp.h) * 0.26);
    const art = await sharp(cut).resize(artSize, artSize, { fit: 'contain' }).png().toBuffer();
    await sharp({ create: { width: sp.w, height: sp.h, channels: 4, background: CREAM } })
      .composite([{
        input: art,
        top: Math.round((sp.h - artSize) / 2),
        left: Math.round((sp.w - artSize) / 2),
      }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(SPLASH_DIR, sp.file));
    console.log('splash', sp.file, sp.w + 'x' + sp.h);
  }
  console.log('done');
}

main().catch(function (e) { console.error('FAILED:', e.message); process.exit(1); });
