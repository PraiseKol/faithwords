import * as P from '../js/progress.js'; import { specMain } from '../js/spec.js';
import assert from 'assert';
const g = P.migrate({ ...P.freshProgress() });
const lose = P.applyResult(g, { spec: specMain(1), score: 3, oppScore: 20, today: '2026-11-19' });
assert.equal(g.mainNext, 1, 'a lost level must not unlock the next');
P.applyResult(g, { spec: specMain(1), score: 30, oppScore: 5, today: '2026-11-19' });
assert.equal(g.mainNext, 2, 'a win unlocks the next');
console.log('retry rules ok');
