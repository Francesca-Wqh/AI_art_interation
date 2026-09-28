import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDIES, createNightPalette} from './interactions.js';
import {defaultWork} from './workshop-model.js';

const core = STUDIES.filter(s => s.core);
function complete(story = createNightPalette()) {
 story.start();
 for (const s of core) {
  const work = defaultWork(s.id);
  if (s.id === 'atelier') work.strokes = [{color: 1, width: .012, points: [[.2,.3],[.4,.32],[.7,.25]]}];
  story.recordWork(s.id, work);
 }
 return story;
}

test('v08 exposes exactly three core studies with distinct action verbs', () => {
 assert.deepEqual(STUDIES.map(s => s.id), ['books', 'cloth', 'atelier']);
 assert.equal(STUDIES.filter(s => s.core).length, 3);
 assert.ok(STUDIES.every(s => s.choices.length >= 2));
});
test('cannot record or finish before receiving the commission', () => {
 const s = createNightPalette();
 assert.equal(s.recordWork('books', defaultWork('books')).ok, false);
 assert.equal(s.finish().ok, false);
});
test('start and recording are idempotent; previews do not auto-record', () => {
 const s = createNightPalette(); s.start();
 assert.equal(s.choice('books'), null);
 const w = defaultWork('books');
 assert.equal(s.recordWork('books', w).changed, true);
 assert.equal(s.recordWork('books', w).changed, false);
 assert.equal(s.collectedCount, 1);
});
test('three core games can be finished in any order', () => {
 const s = createNightPalette(); s.start();
 for (const id of ['atelier', 'cloth', 'books']) {
  const w = defaultWork(id); if (id === 'atelier') w.strokes = [{color: 0, width: .01, points: [[.2,.2],[.4,.4]]}];
  s.recordWork(id, w);
 }
 assert.equal(s.coreCount, 3); assert.equal(s.canFinish, true); assert.equal(s.finish().ok, true); assert.equal(s.finish().changed, false);
});
test('unknown shops and malformed work are rejected', () => {
 const s = createNightPalette(); s.start();
 assert.equal(s.recordWork('cafe', {}).ok, false);
 assert.equal(s.recordWork('__proto__', {}).ok, false);
 assert.equal(s.recordWork('atelier', {strokes: []}).ok, false);
});
test('v05 choices migrate without fabricating work data', () => {
 const s = createNightPalette({version: 5, started: true, finished: true, choices: {books:'sky', cloth:'gold-blue', atelier:'flow'}});
 assert.equal(s.snapshot().version, 8);
 assert.equal(s.choice('cloth'), 'warm');
 assert.equal(s.finished, true);
 assert.equal(s.canFinish, true);
 assert.equal(s.work('atelier'), null);
});
test('snapshot round trip is deep and restart clears only the current night', () => {
 const s = complete(); s.finish();
 const snap = s.snapshot(); const restored = createNightPalette(snap);
 assert.deepEqual(restored.snapshot(), snap);
 snap.works.books.tiles[0].x = .88;
 assert.notEqual(s.work('books').tiles[0].x, .88);
 s.reset(); assert.deepEqual(s.snapshot(), {version: 8, started: false, finished: false, choices: {}, works: {}});
});
test('editing a saved game requires delivery again but keeps all three stations', () => {
 const s = complete(); s.finish();
 const w = s.work('books'); w.tiles[0].x += .1;
 assert.equal(s.recordWork('books', w).changed, true);
 assert.equal(s.finished, false); assert.equal(s.canFinish, true);
});
test('corrupt, future and inactive saves start clean', () => {
 for (const saved of ['broken', 'null', {version: 99, started: true}, {version: 8, started: false, finished: true}]) {
  const s = createNightPalette(saved); assert.equal(s.started, false); assert.equal(s.finished, false);
 }
});
