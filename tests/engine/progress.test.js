import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkObjectives, checkAchievements, addChronicleEntry, getChapterObjectives } from '../../js/engine/progress.js';
import { createState } from '../../js/engine/state.js';

describe('getChapterObjectives', () => {
  it('returns 5 objectives for chapter 1', () => {
    const objs = getChapterObjectives(1);
    assert.strictEqual(objs.length, 5);
  });
});

describe('checkObjectives', () => {
  it('detects completed objectives', () => {
    const s = createState();
    s.discoveredSpecies = ['a', 'b', 'c'];
    const completed = checkObjectives(s);
    assert.ok(completed.includes('Discover 3 species'));
  });
  it('does not re-trigger completed objectives', () => {
    const s = createState();
    s.discoveredSpecies = ['a', 'b', 'c'];
    checkObjectives(s);
    const second = checkObjectives(s);
    assert.strictEqual(second.length, 0);
  });
});

describe('checkAchievements', () => {
  it('detects earned achievements', () => {
    const s = createState();
    s.totalLoops = 1;
    const earned = checkAchievements(s);
    const names = earned.map(a => a.name);
    assert.ok(names.includes('Groundhog Day'));
  });
});

describe('addChronicleEntry', () => {
  it('adds entry for valid trigger', () => {
    const s = createState();
    addChronicleEntry(s, 'start');
    assert.strictEqual(s.chronicleEntries.length, 1);
    assert.ok(s.chronicleEntries[0].text.includes('woke up'));
  });
  it('does not duplicate entries', () => {
    const s = createState();
    addChronicleEntry(s, 'start');
    addChronicleEntry(s, 'start');
    assert.strictEqual(s.chronicleEntries.length, 1);
  });
});
