// Copies the web app into ./www for Capacitor (Android/iOS wrapper).
import { cpSync, rmSync, mkdirSync } from 'fs';
rmSync('www', { recursive: true, force: true }); mkdirSync('www');
for (const f of ['index.html', 'manifest.json', 'icon.svg', 'sw.js', 'css', 'js']) cpSync(f, 'www/' + f, { recursive: true });
console.log('www/ ready');
