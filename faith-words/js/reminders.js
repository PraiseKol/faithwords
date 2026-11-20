// Verse of the day: a card on the home screen everywhere, and — in the mobile app — a real notification every day.
// The notification plugin is reached through Capacitor (@capacitor/local-notifications); on the web it is simply absent,
// and every call here then quietly does nothing, so the same code runs in the browser, the tests and the store apps.
import { VERSES } from './verses.js';
import { hashSeed } from './rng.js';

export const verseOfDay = (date) => VERSES[hashSeed('vod:' + date) % VERSES.length];
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const plugin = () => globalThis.Capacitor?.Plugins?.LocalNotifications || null;
export const remindersSupported = () => !!plugin() && !!globalThis.Capacitor?.isNativePlatform?.();
export const REMIND_DAYS = 30; // scheduled this far ahead; every time the app opens the window is topped up

/** The next notifications to schedule: one per day at hour:00, each with that day's own verse. Pure, for tests. */
export function plan(remind, now = new Date(), days = REMIND_DAYS) {
  const out = [];
  for (let i = 0; i < days + 1 && out.length < days; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, remind.h ?? 8, 0, 0);
    if (at <= now) continue;
    const v = verseOfDay(localDate(at));
    out.push({ id: 100 + out.length, title: '📖 Verse of the day', body: `“${v.text}” — ${v.ref}`, schedule: { at, allowWhileIdle: true } });
  }
  return out;
}

/** Make the phone's schedule match the setting. Returns 'on' | 'off' | 'denied' | 'unsupported'. */
export async function applyReminders(remind, now = new Date(), LN = plugin()) {
  if (!LN) return 'unsupported';
  try {
    const pend = await LN.getPending?.();
    if (pend?.notifications?.length) await LN.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
    if (!remind?.on) return 'off';
    let perm = await LN.checkPermissions?.();
    if (perm?.display !== 'granted') perm = await LN.requestPermissions();
    if (perm?.display !== 'granted') return 'denied';
    await LN.schedule({ notifications: plan(remind, now) });
    return 'on';
  } catch { return 'unsupported'; }
}
