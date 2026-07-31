#!/usr/bin/env node
/**
 * Extract a high-quality WebP frame sequence from the hero source video.
 *
 * - Native resolution (no downscale)
 * - WebP quality 96
 * - Subtle warm cinematic grade matching site cream/gold palette
 * - Soft highlight bloom (encode-time only — zero runtime cost)
 *
 * Usage: npm run generate:hero-frames
 * Requires ffmpeg on PATH.
 *
 * Env:
 *   HERO_FPS     — override extract fps (default: source fps)
 *   HERO_NO_GRADE — set to 1 to skip color grade / bloom
 */

import { spawn } from 'node:child_process';
import { mkdir, readdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SOURCE = path.join(root, 'public/hero/Spatialedit-2.mp4');
const OUT_DIR = path.join(root, 'public/hero/frames');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

/** WebP quality 0–100. High for architectural detail. */
const WEBP_QUALITY = 96;
/** libwebp effort 0–6 (higher = better / slower). */
const WEBP_COMPRESSION_LEVEL = 5;

const TARGET_FPS = process.env.HERO_FPS ? Number(process.env.HERO_FPS) : null;
const NO_GRADE = process.env.HERO_NO_GRADE === '1';

/**
 * Luxury warm grade — Architectural Digest / golden-hour feel.
 * Tuned to site tokens: cream #f4ede0, gold #b4904f. Kept subtle.
 */
function buildGradeFilters() {
  return [
    // Warmer white balance (pull away from cool daylight blue)
    'colortemperature=temperature=5450:mix=0.38',
    // Gentle contrast + vibrance; slight lift in mids
    'eq=contrast=1.07:brightness=0.012:saturation=1.05:gamma=1.02',
    // Warm shadows/mids, cooler blue reduced in highlights
    'colorbalance=rs=0.05:gs=0.015:bs=-0.035:rm=0.035:gm=0.01:bm=-0.025:rh=0.025:bh=-0.02',
    // Micro-contrast / clarity on edges (windows, stone, foliage)
    'unsharp=5:5:0.45:5:5:0.0',
    // Soft screen bloom on bright areas — luxury glow, not a flare
    'split[base][br]',
    '[br]eq=brightness=0.05:gamma=1.12,gblur=sigma=8:steps=1[bloom]',
    '[base][bloom]blend=all_mode=screen:all_opacity=0.065',
  ];
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function probe(file) {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,duration',
      '-of', 'json',
      file,
    ];
    const child = spawn('ffprobe', args, { shell: false });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed (${code}): ${out}`));
        return;
      }
      try {
        const json = JSON.parse(out);
        const stream = json.streams?.[0];
        if (!stream) reject(new Error('No video stream found'));
        else resolve(stream);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function parseRate(rate) {
  if (!rate || typeof rate !== 'string') return 30;
  const [a, b] = rate.split('/').map(Number);
  if (!b) return a || 30;
  return a / b;
}

function buildFilterGraph(extractFps) {
  const parts = [`fps=${extractFps}`];
  // Never downscale — keep source resolution (scale only if odd dims need even)
  // format=yuv420p keeps libwebp happy after filter chain
  if (!NO_GRADE) {
    parts.push(...buildGradeFilters());
  }
  parts.push('format=yuv420p');
  return parts.join(',');
}

async function main() {
  await access(SOURCE).catch(() => {
    throw new Error(`Source video missing: ${SOURCE}`);
  });

  const info = await probe(SOURCE);
  const srcFps = parseRate(info.r_frame_rate);
  const duration = Number(info.duration) || 0;
  const extractFps = TARGET_FPS && Number.isFinite(TARGET_FPS) ? TARGET_FPS : srcFps;
  const estimated = Math.round(duration * extractFps) || Number(info.nb_frames) || 0;
  const vf = buildFilterGraph(extractFps);

  console.log('Hero frame generation (native resolution)');
  console.log(`  source:  ${SOURCE}`);
  console.log(`  size:    ${info.width}×${info.height} (no downscale)`);
  console.log(`  fps:     ${srcFps} → extract @ ${extractFps}`);
  console.log(`  approx:  ${estimated} frames`);
  console.log(`  grade:   ${NO_GRADE ? 'off' : 'warm cinematic + soft bloom'}`);
  console.log(`  output:  ${OUT_DIR} (WebP q=${WEBP_QUALITY})`);

  await mkdir(OUT_DIR, { recursive: true });

  const existing = await readdir(OUT_DIR);
  await Promise.all(
    existing
      .filter((name) => /^frame_\d+\.webp$/i.test(name) || name === 'manifest.json')
      .map((name) => rm(path.join(OUT_DIR, name), { force: true })),
  );

  await run('ffmpeg', [
    '-y',
    '-i', SOURCE,
    '-vf', vf,
    '-c:v', 'libwebp',
    '-quality', String(WEBP_QUALITY),
    '-compression_level', String(WEBP_COMPRESSION_LEVEL),
    '-preset', 'photo',
    '-an',
    path.join(OUT_DIR, 'frame_%04d.webp'),
  ]);

  const frames = (await readdir(OUT_DIR))
    .filter((name) => /^frame_\d+\.webp$/i.test(name))
    .sort();

  if (frames.length === 0) {
    throw new Error('No frames were generated');
  }

  const manifest = {
    version: 2,
    source: 'Spatialedit-2.mp4',
    frameCount: frames.length,
    pattern: 'frame_%04d.webp',
    pad: 4,
    extension: 'webp',
    width: Number(info.width),
    height: Number(info.height),
    quality: WEBP_QUALITY,
    graded: !NO_GRADE,
    extractFps,
    sourceFps: srcFps,
    sourceWidth: Number(info.width),
    sourceHeight: Number(info.height),
    generatedAt: new Date().toISOString(),
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`\nDone: ${frames.length} frames @ ${info.width}×${info.height} → ${OUT_DIR}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);

  if (frames.length < 240 || frames.length > 400) {
    console.warn(
      `Warning: frame count ${frames.length} is outside the 240–400 smoothness band. ` +
        `Set HERO_FPS to adjust (e.g. HERO_FPS=36).`,
    );
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
