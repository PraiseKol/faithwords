// "How to play" guide — shown on first launch and from the ? buttons.
import { h, modal, crossSvg, icon, coin } from './ui.js';
import { CONFIG } from './config.js';

const slides = () => [
  { art: '🧩', title: 'Fill the crossword', body: 'Blue cells hold clues: words, fill-in-the-blanks or pictures. The little arrow shows which way the answer runs. Tap a clue to zoom it.' },
  { art: '🔤', title: 'Place your 5 tiles', body: 'Drag a tile onto the cell where it belongs, or tap the tile and then the cell. Press Done to end your turn. Three wrong guesses end the turn.' },
  { art: '⭐', title: 'Score points', body: `Every correct tile is 1 point. The tile that finishes a word is worth 1 plus the length of the word. Use all 5 tiles in one turn for +${CONFIG.allTilesBonus} bonus. Highest score wins.` },
  { art: '🪙', title: 'Win coins, level up', body: `All your points add up as you climb levels. Check in daily and win games in a row for bonus coins, then spend them on Hints (${CONFIG.price.hint}) and Word reveals (${CONFIG.price.word}).` },
];

export function showHowTo({ onDone, first = false, name } = {}) {
  let i = -1; // -1 = welcome (only on first run)
  const body = h('div', { class: 'howto' });
  const nameIn = h('input', { id: 'welcome-name', placeholder: 'Your name', maxlength: 16, autocomplete: 'nickname', value: name && name !== 'Believer' ? name : '' });
  const m = modal(body, { dismiss: !first, cls: 'sheet' });
  const draw = () => {
    body.innerHTML = '';
    const S = slides();
    if (i < 0) {
      body.append(h('div', { class: 'logo big', html: crossSvg(54, 'var(--primary)') }), h('h2', {}, 'Welcome to Faith Words'),
        h('p', { class: 'muted' }, 'Bible crosswords you play against a friend, a bot or another believer around the world.'),
        h('label', { for: 'welcome-name', class: 'lbl-sm' }, 'What should we call you?'), nameIn,
        h('button', { class: 'btn', onclick: () => { i = 0; draw(); } }, 'Show me how to play'));
      return;
    }
    const s = S[i];
    body.append(h('div', { class: 'ht-art' }, s.art), h('h2', {}, s.title), h('p', { class: 'ht-body' }, s.body),
      h('div', { class: 'dots' }, S.map((_, k) => h('i', { class: k === i ? 'on' : '' }))),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => { if (i < S.length - 1) { i++; draw(); } else { fin(); } } }, i < S.length - 1 ? 'Next' : first ? "Let's play" : 'Got it'),
        i > 0 ? h('button', { class: 'btn ghost', onclick: () => { i--; draw(); } }, 'Back') : null));
  };
  const fin = () => { m.close(); onDone?.(nameIn.value.trim()); };
  i = first ? -1 : 0;
  draw();
  return m;
}
