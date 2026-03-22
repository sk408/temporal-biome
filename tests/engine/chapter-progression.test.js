import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createState } from '../../js/engine/state.js';
import { getChapterObjectives, checkChapterComplete, advanceChapter, checkObjectives } from '../../js/engine/progress.js';

describe('getChapterObjectives', () => {
  it('returns 5 objectives for chapter 1', () => {
    assert.strictEqual(getChapterObjectives(1).length, 5);
  });
  it('returns 5 objectives for chapter 2', () => {
    assert.strictEqual(getChapterObjectives(2).length, 5);
  });
  it('returns empty for undefined chapter', () => {
    assert.strictEqual(getChapterObjectives(99).length, 0);
  });
});

describe('checkChapterComplete', () => {
  it('returns false when objectives incomplete', () => {
    const s = createState();
    assert.strictEqual(checkChapterComplete(s), false);
  });
  it('returns true when all Ch1 objectives complete', () => {
    const s = createState();
    const objs = getChapterObjectives(1);
    for (const obj of objs) {
      s.chapterObjectives[obj.id] = true;
    }
    assert.strictEqual(checkChapterComplete(s), true);
  });
  it('returns false with partial completion', () => {
    const s = createState();
    s.chapterObjectives['discover3'] = true;
    s.chapterObjectives['earn1kTr'] = true;
    assert.strictEqual(checkChapterComplete(s), false);
  });
});

describe('advanceChapter', () => {
  it('increments chapter', () => {
    const s = createState();
    s.chapterObjectives = { a: true, b: true };
    advanceChapter(s);
    assert.strictEqual(s.chapter, 2);
  });
  it('resets objectives', () => {
    const s = createState();
    s.chapterObjectives = { a: true };
    advanceChapter(s);
    assert.deepStrictEqual(s.chapterObjectives, {});
  });
  it('adds chronicle entry for chapter completion', () => {
    const s = createState();
    advanceChapter(s);
    assert.ok(s.chronicleEntries.some(e => e.trigger === 'chapter1Complete'));
  });
});

describe('Ch2 objectives', () => {
  it('ch2_discover4 checks for Ch2 species', () => {
    const s = createState();
    s.chapter = 2;
    s.discoveredSpecies = ['luminmoss', 'driftspore', 'poolworm']; // Ch1 species
    const objs = getChapterObjectives(2);
    const discObj = objs.find(o => o.id === 'ch2_discover4');
    assert.strictEqual(discObj.check(s), false);
    s.discoveredSpecies.push('rootweaver', 'petalfly', 'thornsprout', 'dewdrop');
    assert.strictEqual(discObj.check(s), true);
  });
  it('ch2_combine2 checks combinationsFound', () => {
    const s = createState();
    s.chapter = 2;
    const objs = getChapterObjectives(2);
    const comboObj = objs.find(o => o.id === 'ch2_combine2');
    s.combinationsFound = ['glowspore'];
    assert.strictEqual(comboObj.check(s), false);
    s.combinationsFound.push('pollenswarm');
    assert.strictEqual(comboObj.check(s), true);
  });
  it('ch2_gens checks all 3 Ch2 generators at 5+', () => {
    const s = createState();
    s.chapter = 2;
    const objs = getChapterObjectives(2);
    const genObj = objs.find(o => o.id === 'ch2_gens');
    s.generators = { symbioticPair: 5, gardenMatrix: 5, growthAccelerator: 4 };
    assert.strictEqual(genObj.check(s), false);
    s.generators.growthAccelerator = 5;
    assert.strictEqual(genObj.check(s), true);
  });
});
