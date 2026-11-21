// Make a "content drop": a pack of new puzzles built around words you choose, ready to paste into the admin panel
// (Admin → New puzzle packs). Nobody needs to update the app; the pack appears on every player's home screen.
//
//   node tools/make-drop.mjs words.txt --id advent-2026 --title "Advent Specials" --icon 🕯️ --count 6 \
//        --from 2026-12-01 --to 2026-12-26 [--colors "#6a3fd1,#3a1f8e"] [--out advent.json]
//
// words.txt has one new word per line:   ANSWER|clue|emoji(optional)     e.g.   EMMANUEL|God with us|
// Answers are 2–9 capital letters. The generator also uses the built-in bank to fill the gaps, and favours your words.
import fs from 'node:fs';
import { BANK } from '../js/bank.js';
import { mulberry32, hashSeed } from '../js/rng.js';
import { validateDropPuzzle } from '../js/spec.js';
import { wordList, makeFiller, templatePool, generate } from './gen2.mjs';

const args = process.argv.slice(2), file = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (!file || file.startsWith('--')) { console.error('usage: node tools/make-drop.mjs words.txt --id my-pack --title "My Pack" [--icon ✨] [--count 6] [--from YYYY-MM-DD] [--to YYYY-MM-DD]'); process.exit(1); }
const id = opt('id', 'pack-' + Date.now().toString(36)), title = opt('title', 'New Pack'), count = +opt('count', 6);
const mine = fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => {
  const [a, c = '', e = ''] = l.split('|'); return { a: a.trim().toUpperCase(), c: c.trim(), e: e.trim() };
});
for (const m of mine) if (!/^[A-Z]{2,9}$/.test(m.a) || (!m.c && !m.e)) { console.error('bad line (needs 2–9 letters and a clue):', m.a, m.c); process.exit(1); }
if (mine.length < count * 2) console.warn(`note: ${mine.length} words for ${count} puzzles — the rest of each puzzle uses the built-in bank`);

const bank = [...mine.map((m, i) => ({ ...m, id: -1 - i, tags: ['new'] })), ...BANK];
const words = wordList(bank), F = makeFiller(words);
const isNew = new Uint8Array(F.nW); words.forEach((e, i) => { isNew[i] = e.tags.includes('new') ? 1 : 0; });
const variants = new Map(); bank.forEach((e) => { if (!variants.has(e.a)) variants.set(e.a, []); variants.get(e.a).push(e); });
const singleBank = BANK.filter((e) => e.a.length === 1 && !/_$/.test(e.c));
const SIZES = [[7, 9], [8, 9], [7, 8], [8, 8], [7, 10]], usage = new Float32Array(F.nW);
const puzzles = [], used = new Set();
for (let n = 0; n < count; n++) {
  const seed = `drop-${id}-${n}`, [W, H] = SIZES[hashSeed('size-' + seed) % SIZES.length], pool = templatePool(W, H);
  let g = null;
  for (const [salt, minT] of [['', Math.min(5, mine.length)], ['#2', 3], ['#3', 2], ['#4', 1], ['#5', 0], ['#6', 0]]) {
    g = generate(F, { seed: seed + salt, W, H, pool, weightOf: (i) => isNew[i] * 6 - usage[i] * 2 + (usage[i] === 0 ? 3 : 0), minTagged: minT, isTagged: (i) => isNew[i], seconds: 25, singleBank });
    if (g) break;
  }
  if (!g) { console.error('could not build puzzle ' + (n + 1)); process.exit(1); }
  const rnd = mulberry32(hashSeed('pick-' + seed));
  const out = g.words.map((w) => {
    usage[w.wi]++;
    const vs = variants.get(w.ans), v = vs.find((x) => x.tags.includes('new')) || vs[Math.floor(rnd() * vs.length)];
    return { a: w.ans, c: v.c, e: v.e || '', dir: w.dir, r: w.r, col: w.c, cr: w.cr, cc: w.cc };
  });
  for (const sl of g.singles) { const e = BANK[sl.entry]; out.push({ a: e.a, c: e.c, e: e.e || '', dir: sl.dir, r: Math.floor(sl.cell / W), col: sl.cell % W, cr: Math.floor(sl.clueCell / W), cc: sl.clueCell % W }); }
  const count1 = new Array(W * H).fill(0); g.words.forEach((w) => { for (let i = 0; i < w.ans.length; i++) count1[(w.r + (w.dir === 'd' ? i : 0)) * W + w.c + (w.dir === 'a' ? i : 0)]++; });
  const lone = new Set(g.singles.map((x) => x.cell)), cross = [], single = [];
  g.T.forEach((t, k) => { if (t === 2 && !lone.has(k)) (count1[k] > 1 ? cross : single).push(k); });
  const givens = [], nGive = 4 + Math.floor(rnd() * 3);
  while (givens.length < nGive && (cross.length || single.length)) { const src = cross.length ? cross : single; givens.push(src.splice(Math.floor(rnd() * src.length), 1)[0]); }
  const def = { W, H, words: out, given: givens.sort((a, b) => a - b), orn: g.orn };
  const err = validateDropPuzzle(def); if (err) { console.error('generated an invalid puzzle:', err); process.exit(1); }
  out.forEach((o) => { if (mine.some((m) => m.a === o.a)) used.add(o.a); }); puzzles.push(def); process.stderr.write(`puzzle ${n + 1}/${count} ok (${used.size}/${mine.length} of your words used so far)\n`);
}
const drop = { id, title, icon: opt('icon', '✨'), colors: opt('colors', '#2f80ed,#1c4fb8').split(','), from: opt('from', ''), to: opt('to', ''), puzzles };
const outFile = opt('out', id + '.json'); fs.writeFileSync(outFile, JSON.stringify(drop));
console.log(`wrote ${outFile}: ${puzzles.length} puzzles, ${(JSON.stringify(drop).length / 1024).toFixed(1)} KB. Paste its contents in Admin → New puzzle packs → Check & add → Publish now.`);
