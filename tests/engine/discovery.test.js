import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runDiscoveryCheck, tryCombination, getHint } from '../../js/engine/discovery.js';
import { createState } from '../../js/engine/state.js';

describe('runDiscoveryCheck', () => {
  it('returns null if all chapter species discovered', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss','driftspore','poolworm','copperlichen','fogbell'];
    const result = runDiscoveryCheck(s, 0.0);
    assert.strictEqual(result, null);
  });
  it('returns a species id on success', () => {
    const s = createState();
    const result = runDiscoveryCheck(s, 0.01);
    assert.ok(result !== null);
    assert.ok(typeof result === 'string');
  });
  it('returns null on high roll (failure)', () => {
    const s = createState();
    const result = runDiscoveryCheck(s, 0.99);
    assert.strictEqual(result, null);
  });
});

describe('tryCombination', () => {
  it('returns failure for valid combo in future chapter', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    const result = tryCombination(s, 'luminmoss', 'driftspore');
    assert.ok(!result.success);
    assert.strictEqual(result.hint, 'future_chapter');
  });
  it('returns success for valid combo in chapter 2', () => {
    const s = createState();
    s.chapter = 2;
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    const result = tryCombination(s, 'luminmoss', 'driftspore');
    assert.ok(result.success);
    assert.strictEqual(result.species, 'glowspore');
  });
  it('returns failure for invalid combo', () => {
    const s = createState();
    s.discoveredSpecies = ['copperlichen', 'poolworm'];
    const result = tryCombination(s, 'copperlichen', 'poolworm');
    assert.ok(!result.success);
  });
});

describe('getHint', () => {
  it('returns both_valid for species that are each in some combo', () => {
    const hint = getHint('poolworm', 'copperlichen');
    assert.strictEqual(hint, 'both_valid');
  });
  it('returns both_valid when both species appear in combos', () => {
    const hint = getHint('poolworm', 'driftspore');
    assert.strictEqual(hint, 'both_valid');
  });
});
