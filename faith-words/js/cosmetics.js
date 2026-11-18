// Board and tile themes. Each is bought with coins or unlocked by a badge; ownership and the equipped choice are
// server-owned (ops buyCosmetic / equipCosmetic) like every other thing that costs coins.
import { badgeById } from './achievements.js';

export const COSMETICS = [
  { id: 'b-classic',  slot: 'board', name: 'Classic',       price: 0 },
  { id: 'b-parch',    slot: 'board', name: 'Parchment',     price: 200, sw: ['#f6ead0', '#e3cf9f', '#8a6a34'] },
  { id: 'b-glass',    slot: 'board', name: 'Stained glass', price: 400, sw: ['#c5d8ff', '#e7b7c9', '#4a3c8f'] },
  { id: 'b-night',    slot: 'board', name: 'Night vigil',   price: 300, sw: ['#1b2748', '#2b3a66', '#d9b24c'] },
  { id: 'b-meadow',   slot: 'board', name: 'Green pastures', badge: 'shepherd', sw: ['#eaf6dd', '#c8e4b0', '#5c8f45'] },
  { id: 't-classic',  slot: 'tile',  name: 'Wooden',        price: 0 },
  { id: 't-ivory',    slot: 'tile',  name: 'Ivory',         price: 150, sw: ['#fffdf6', '#ece4cf', '#b9ad8c'] },
  { id: 't-gold',     slot: 'tile',  name: 'Gold leaf',     price: 350, sw: ['#ffe9a3', '#e8b53a', '#a8761a'] },
  { id: 't-stone',    slot: 'tile',  name: 'Stone tablet',  badge: 'scribe', sw: ['#d9d8d3', '#a9a8a1', '#6f6e68'] },
  { id: 't-rose',     slot: 'tile',  name: 'Rose of Sharon', price: 250, sw: ['#ffe1e6', '#f3a8b8', '#c2566f'] },
];
export const cosmeticById = (id) => COSMETICS.find((c) => c.id === id) || null;
export const freshCosmetics = () => ({ own: [], board: 'b-classic', tile: 't-classic' });
const DEFAULT = (c) => !c.price && !c.badge;
/** Can this player use it? (free ones, bought ones, or the badge that unlocks it) */
export const available = (d, c) => DEFAULT(c) || (d.cosmetics?.own || []).includes(c.id) || (c.badge && !!badgeById(c.badge)?.test(d));

export function buyCosmetic(d, id) {
  const c = cosmeticById(id);
  if (!c || !c.price || available(d, c) || d.coins < c.price) return false;
  d.coins -= c.price; d.cosmetics.own = [...d.cosmetics.own, id]; return true;
}
export function equipCosmetic(d, id) {
  const c = cosmeticById(id);
  if (!c || !available(d, c)) return false;
  d.cosmetics[c.slot] = id; return true;
}
