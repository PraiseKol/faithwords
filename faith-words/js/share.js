// Wordle-style result card: a short text with the score, a row of squares per turn and the verse.
import { verseByRef } from './verses.js';
import { h, modal, toast } from './ui.js';

/** Turns of the player as rows of squares: 🟩 right tile, 🟥 wrong tile; a ⭐ for a finished word. */
export function squares(log, me = 'you') {
  const rows = []; let row = '';
  for (const [who, t, k] of log) {
    if (who !== me) continue;
    if (t === 'p') row += '🟩'; else if (t === 'w') row += '🟥'.repeat(Math.min(k, 5)); else if (t === 'e') { rows.push(row || '⬜'); row = ''; }
  }
  if (row) rows.push(row);
  return rows;
}
export function shareText({ spec, score, oppScore, log, verse, url }) {
  const v = verse ? verseByRef(verse) : null;
  const rows = squares(log), shown = rows.slice(0, 8);
  const outcome = score > oppScore ? '🏆 Won' : score === oppScore ? '🤝 Draw' : '🙏 Good game';
  return [`Faith Words · ${spec.label}`, `${outcome} ${score}–${oppScore}`, '', ...shown, rows.length > 8 ? `… +${rows.length - 8} more turns` : null,
    v ? `\n📖 ${v.ref}` : null, url ? `\nPlay: ${url}` : null].filter((x) => x != null).join('\n');
}
/** Share sheet if the device has one, else copy; if even that is blocked, show the text to copy by hand. */
export async function shareOut(text) {
  try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Copied — paste it anywhere'); return; } catch { /* blocked */ }
  const ta = h('textarea', { class: 'share-ta', readonly: true, rows: 9 }, text);
  const m = modal(h('div', {}, h('h3', {}, 'Copy your result'), ta, h('button', { class: 'btn', onclick: () => m.close() }, 'Done')), { cls: 'sheet' });
  ta.select();
}
