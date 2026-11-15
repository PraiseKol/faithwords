// Builds the board layouts in tools/templates.json. Needs a C compiler:  node tools/make-templates.mjs [WxH]
// Rule: every word has a clue cell directly before it (left of an across word, above a down word); every square is used.
// Letters that sit in no word are one-letter answers with their own riddle clue; a clue-coloured cell with nothing at all to clue
// (rare) is shown as a ✝ ornament.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { runsOf, singlesOf } from './gen2.mjs';
const SIZES = process.argv[2] ? [process.argv[2].split('x').map(Number)] : [[7, 9], [8, 9], [7, 8], [8, 8], [7, 10]];
const BIN = '/tmp/fw-samp' + (process.argv[2] || '');
execFileSync('gcc', ['-O2', '-o', BIN, new URL('./sample-templates.c', import.meta.url).pathname, '-lm']);
const out = {};
for (const [W, H] of SIZES) {
  const list = [], seen = new Set();
  const txt = execFileSync(BIN, [W, H, 150000, 11, 0], { maxBuffer: 1 << 30 }).toString();
  for (const g of txt.trim().split('\n\n')) {
    const rows = g.split('\n'); if (rows.length !== H) continue;
    const key = rows.join('/'); if (seen.has(key)) continue;
    const T = Uint8Array.from(rows.join('').split('').map((ch) => (ch === '#' ? 1 : 2)));
    const n = W * H, nC = T.reduce((a, v) => a + (v === 1), 0);
    if (nC < n * 0.24 || nC > n * 0.4) continue;
    const runs = runsOf(T, W, H);
    if (runs.some((r) => r.cells.length > Math.max(W, H) - 1)) continue;
    if (runs.filter((r) => r.cells.length === 2).length > 3) continue;
    const sg = singlesOf(T, W, H); if (!sg || sg.orn.length > 1 || sg.singles.length > 8) continue;
    const cov = new Uint8Array(n); runs.forEach((r) => r.cells.forEach((k) => cov[k]++));
    const cross = cov.filter((x) => x > 1).length / cov.filter((x) => x > 0).length;
    if (cross > 0.78) continue;
    seen.add(key); list.push({ g: key, d: sg.orn.length, s: sg.singles.length, x: +cross.toFixed(2) });
  }
  list.sort((a, b) => a.d - b.d || a.x - b.x);
  out[W + 'x' + H] = list.slice(0, 400);
  const byD = {}; list.forEach((t) => { byD[t.d] = (byD[t.d] || 0) + 1; });
  console.log(W + 'x' + H, list.length, 'templates; by ornament count', JSON.stringify(byD), 'min cross', list[0]?.x);
}
if (process.argv[2]) fs.writeFileSync(new URL(`./templates-${process.argv[2]}.json`, import.meta.url), JSON.stringify(out));
else fs.writeFileSync(new URL('./templates.json', import.meta.url), JSON.stringify(out));
