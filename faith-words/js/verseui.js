// The verse card: shown after a puzzle and in the Verse Album.
import { h } from './ui.js';
import { verseByRef } from './verses.js';

export function verseCard(ref, { isNew = false, count = 0 } = {}) {
  const v = verseByRef(ref); if (!v) return null;
  return h('div', { class: 'vcard' + (isNew ? ' new' : '') },
    isNew ? h('div', { class: 'vc-new' }, 'NEW CARD') : null,
    h('div', { class: 'vc-cross' }, '✝'),
    h('blockquote', { class: 'vc-text' }, '“' + v.text + '”'),
    h('div', { class: 'vc-ref' }, '— ' + v.ref + ' (KJV)'),
    h('p', { class: 'vc-note' }, v.note),
    count > 1 ? h('small', { class: 'vc-count' }, `Found ${count} times`) : null);
}
