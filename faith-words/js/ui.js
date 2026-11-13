// Tiny DOM helpers + shared widgets
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv); }
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach((c) => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c)); });
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);

export function toast(msg, ms = 1800) {
  const t = h('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

export function modal(content, { dismiss = true, cls = '' } = {}) {
  const back = h('div', { class: 'modal-back' });
  const card = h('div', { class: 'modal ' + cls }, content);
  back.append(card);
  const close = () => { back.classList.add('out'); setTimeout(() => back.remove(), 180); };
  if (dismiss) back.addEventListener('click', (e) => { if (e.target === back) close(); });
  document.body.append(back);
  return { close, card, back };
}

export function confetti() {
  const box = h('div', { class: 'confetti' });
  const cols = ['#f5b301', '#2f80ed', '#e5484d', '#27ae60', '#9b59b6'];
  for (let i = 0; i < 40; i++) {
    box.append(h('i', { style: { left: Math.random() * 100 + '%', background: cols[i % 5], animationDelay: Math.random() * 0.6 + 's', animationDuration: 1.8 + Math.random() * 1.4 + 's' } }));
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3800);
}

export const crossSvg = (size = 28, color = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" aria-hidden="true"><path d="M10 2h4v7h7v4h-7v9h-4v-9H3V9h7z"/></svg>`;

export function trophySvg(done) {
  const a = done ? '#ffd86b' : '#5d7fa8', b = done ? '#e0a020' : '#2f4a70', c = done ? '#8a5a10' : '#1b2c47';
  return `<svg viewBox="0 0 120 140" width="170" height="198" aria-hidden="true">
  <defs><linearGradient id="tg${done ? 1 : 0}" x1="0" x2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <path d="M30 14h60v34c0 20-13 34-30 34S30 68 30 48z" fill="url(#tg${done ? 1 : 0})"/>
  <path d="M30 22H14c0 20 8 30 20 33M90 22h16c0 20-8 30-20 33" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round"/>
  <rect x="54" y="80" width="12" height="22" fill="${b}"/><rect x="36" y="102" width="48" height="12" rx="4" fill="${c}"/>
  <rect x="28" y="114" width="64" height="14" rx="4" fill="${b}"/>
  <path d="M60 28v34M48 40h24" stroke="#fff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/></svg>`;
}
