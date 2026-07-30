/**
 * Generates responsive crops of rightside.png for tablet and mobile viewports.
 * Run: node scripts/generate-floorplan-crops.mjs
 *
 * Source: public/images/rightside.png (463×697px)
 *
 * Tablet (768–1023px viewports):
 *   Display slot ≈ 45vw at 768px ≈ 345px wide. At 2× = 690px wide.
 *   Strategy: resize only (no crop) — preserve full floor plan.
 *   Output: 690×1039px → public/images/rightside-tablet.png
 *
 * Mobile (<768px viewports):
 *   Display slot ≈ 90vw at 390px ≈ 351px wide. At 2× = 702px wide.
 *   Strategy: resize to fit full width, then crop center-vertically to
 *   keep the most detail-rich middle section of the floor plan legible.
 *   Full resize height = 702 × (697/463) = 1057px.
 *   Crop to central 800px vertically (remove ~128px from top and ~129px from bottom)
 *   to zoom into the main room area.
 *   Output: 702×800px → public/images/rightside-mobile.png
 *
 * Both crops preserve the original's shadow/framing — no content is lost
 * that wasn't already in the outer edges of the source image.
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public', 'images');
const src = path.join(publicDir, 'rightside.png');

// ── Tablet crop ─────────────────────────────────────────────────────────────
// Resize to 690 wide, keep full height (proportional). No crop.
const tabletWidth  = 690;
const tabletDest   = path.join(publicDir, 'rightside-tablet.png');

await sharp(src)
  .resize(tabletWidth, null, { fit: 'inside', withoutEnlargement: false })
  .png({ compressionLevel: 8 })
  .toFile(tabletDest);

const tabletMeta = await sharp(tabletDest).metadata();
console.log(`✓ rightside-tablet.png → ${tabletMeta.width}×${tabletMeta.height}px`);

// ── Mobile crop ──────────────────────────────────────────────────────────────
// 1. Resize to 702 wide (proportional height = 1057px)
// 2. Crop to central 800px vertically
const mobileWidth       = 702;
const mobileFullHeight  = Math.round(mobileWidth * (697 / 463)); // ≈ 1057
const mobileCropHeight  = 800;
const mobileCropTop     = Math.round((mobileFullHeight - mobileCropHeight) / 2); // centre-align
const mobileDest        = path.join(publicDir, 'rightside-mobile.png');

await sharp(src)
  .resize(mobileWidth, mobileFullHeight, { fit: 'fill' })
  .extract({ left: 0, top: mobileCropTop, width: mobileWidth, height: mobileCropHeight })
  .png({ compressionLevel: 8 })
  .toFile(mobileDest);

const mobileMeta = await sharp(mobileDest).metadata();
console.log(`✓ rightside-mobile.png → ${mobileMeta.width}×${mobileMeta.height}px`);

console.log('Done. Both files written to public/images/');
