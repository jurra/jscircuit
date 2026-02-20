#!/usr/bin/env node
/**
 * @file bundle-html.mjs
 * @description
 * Produces a single, self-contained `dist/jscircuit.html` with:
 *   - All CSS inlined in <style> (already in gui.html)
 *   - The esbuild bundle inlined in <script> (replaces the external src)
 *   - All PNG assets inlined as Base64 data-URLs inside the JS bundle
 *
 * Usage:  node scripts/bundle-html.mjs
 * Output: dist/jscircuit.html  (single file, no external dependencies)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── 1. Run esbuild to produce an IIFE bundle with all assets inlined ──
console.log('⏳ Bundling JS with esbuild (assets inlined as data-URLs)…');

execSync(
    [
        'npx esbuild src/gui/main.js',
        '--bundle',
        '--minify',
        '--format=iife',           // IIFE so we can inline in a plain <script>
        '--loader:.png=dataurl',
        '--loader:.jpg=dataurl',
        '--outfile=dist/_bundle.js',
    ].join(' '),
    { cwd: ROOT, stdio: 'inherit' }
);

const bundleJS = readFileSync(resolve(ROOT, 'dist/_bundle.js'), 'utf-8');

// ── 2. Read the HTML template ──────────────────────────────────────────
const htmlTemplate = readFileSync(resolve(ROOT, 'src/gui/gui.html'), 'utf-8');

// ── 3. Replace the external <script> tag with an inline <script> ──────
//    Original:  <script type="module" src="./static/main.js"></script>
//    Replace:   <script>…bundled code…</script>
const scriptTagRe = /<script\s+type="module"\s+src="[^"]*"><\/script>/;

if (!scriptTagRe.test(htmlTemplate)) {
    console.error('❌ Could not find the <script type="module" src="…"> tag in gui.html');
    process.exit(1);
}

const selfContainedHTML = htmlTemplate.replace(
    scriptTagRe,
    `<script>\n${bundleJS}\n</script>`
);

// ── 4. Write output ────────────────────────────────────────────────────
mkdirSync(resolve(ROOT, 'dist'), { recursive: true });
writeFileSync(resolve(ROOT, 'dist/jscircuit.html'), selfContainedHTML, 'utf-8');

// Clean up temp bundle
const { unlinkSync } = await import('fs');
try { unlinkSync(resolve(ROOT, 'dist/_bundle.js')); } catch { /* ignore */ }

const sizeKB = (Buffer.byteLength(selfContainedHTML, 'utf-8') / 1024).toFixed(1);
console.log(`✅ dist/jscircuit.html  (${sizeKB} KB — fully self-contained)`);
