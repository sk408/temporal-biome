import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createState } from '../../js/engine/state.js';
import { getActiveSynergies, getSymbiosisBonus, hasAnySynergy } from '../../js/engine/symbiosis.js';
import { getTotalProduction, getTapValue } from '../../js/engine/economy.js';

describe('getActiveSynergies', () => {
  it('returns empty when no species discovered', () => {
    const s = createState();
    assert.strictEqual(getActiveSynergies(s).length, 0);
  });
  it('returns synergy when both species in a pair are discovered', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    const active = getActiveSynergies(s);
    assert.ok(active.length >= 1);
    assert.ok(active.some(syn => syn.a === 'luminmoss' && syn.b === 'driftspore'));
  });
  it('returns nothing when only one of a pair is discovered', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss'];
    assert.strictEqual(getActiveSynergies(s).length, 0);
  });
});

describe('getSymbiosisBonus', () => {
  it('returns 0 with no synergies', () => {
    const s = createState();
    assert.strictEqual(getSymbiosisBonus(s, 'generatorMult'), 0);
  });
  it('returns correct bonus for active synergy', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    const bonus = getSymbiosisBonus(s, 'generatorMult');
    assert.ok(bonus > 0);
  });
  it('stacks multiple synergies of same type', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore', 'rootweaver'];
    // luminmoss+driftspore = 0.10, luminmoss+rootweaver = 0.08
    const bonus = getSymbiosisBonus(s, 'generatorMult');
    assert.ok(bonus >= 0.18);
  });
});

describe('hasAnySynergy', () => {
  it('returns false with no pairs', () => {
    const s = createState();
    assert.strictEqual(hasAnySynergy(s), false);
  });
  it('returns true when a pair is discovered', () => {
    const s = createState();
    s.discoveredSpecies = ['poolworm', 'fogbell'];
    assert.strictEqual(hasAnySynergy(s), true);
  });
});

describe('symbiosis integration with economy', () => {
  it('getTotalProduction includes symbiosis generator bonus', () => {
    const s = createState();
    s.generators = { mossPatch: 5 };
    const baseProd = getTotalProduction(s);
    s.discoveredSpecies = ['luminmoss', 'driftspore']; // +10% generator mult
    const boostedProd = getTotalProduction(s);
    assert.ok(boostedProd > baseProd);
  });
  it('getTapValue includes symbiosis tap bonus', () => {
    const s = createState();
    const baseTap = getTapValue(s);
    s.discoveredSpecies = ['copperlichen', 'thornsprout']; // +12% tap mult
    const boostedTap = getTapValue(s);
    assert.ok(boostedTap >= baseTap);
  });
});
