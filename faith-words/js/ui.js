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

// ---- icons (24px line icons) & device feedback
const P = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  swap: '<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c1 1 1 2 1 3.5h6c0-1.500 0-2.500 1-3.500A6 6 0 0 0 12 3z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3.500 3.500 3.500 16.500 0 20M12 2c-3.500 3.500-3.500 16.500 0 20"/>',
  back: '<path d="M15 4l-8 8 8 8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.100a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.100 9a3 3 0 0 1 5.800 1c0 2-3 2.500-3 4.500M12 17.500h.01"/>',
  check: '<path d="M4 12.500l5 5L20 6.500"/>',
  flame: '<path d="M12 22c4 0 7-2.800 7-7 0-3-2-5-3-7-1 1.500-2 2-3 2 0-3-1-6-4-8 0 4-4 6-4 12 0 4.200 3 8 7 8z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>',
};
export const icon = (name, size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
export const coinSvg = (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#f5b301"/><circle cx="10" cy="10" r="6.500" fill="none" stroke="#c98200" stroke-width="1.500"/><path d="M10 6v8M7.500 8.500h5" stroke="#c98200" stroke-width="1.600" stroke-linecap="round"/></svg>`;
export const coin = (n, cls = '') => h('span', { class: 'coin-amt ' + cls }, h('i', { html: coinSvg() }), String(n));

export function buzz(pattern, settings) {
  try { if (settings?.haptics !== false && navigator.vibrate) navigator.vibrate(pattern); } catch { /* unsupported */ }
}
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark' || theme === 'light') root.dataset.theme = theme; else delete root.dataset.theme;
  const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1630' : '#3566e8');
}
