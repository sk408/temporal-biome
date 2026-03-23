import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getUpgradeTier, getUpgradeCost, canUpgradeSpecies, upgradeSpecies, getSpeciesOutputBonus, getSpeciesEchoBonus } from '../../js/engine/species-upgrades.js';

function makeState(overrides = {}) {
  return {
    discoveredSpecies: ['luminmoss', 'driftspore'],
    speciesUpgrades: {},
    myceliumThreads: 100,
    chapter: 3,
    ...overrides,
  };
}

describe('getUpgradeTier', () => {
  it('returns 0 for unupgraded species', () => {
    const state = makeState();
    assert.equal(getUpgradeTier(state, 'luminmoss'), 0);
  });

  it('returns current tier level', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 2 } });
    assert.equal(getUpgradeTier(state, 'luminmoss'), 2);
  });
});

describe('getUpgradeCost', () => {
  it('returns tier 1 cost (25 threads)', () => {
    assert.equal(getUpgradeCost(0), 25);
  });

  it('returns tier 2 cost (75 threads)', () => {
    assert.equal(getUpgradeCost(1), 75);
  });

  it('returns tier 3 cost (200 threads)', () => {
    assert.equal(getUpgradeCost(2), 200);
  });

  it('returns Infinity for max tier', () => {
    assert.equal(getUpgradeCost(3), Infinity);
  });
});

describe('canUpgradeSpecies', () => {
  it('returns true with enough threads and chapter >= 3', () => {
    const state = makeState();
    assert.equal(canUpgradeSpecies(state, 'luminmoss'), true);
  });

  it('returns false if species not discovered', () => {
    const state = makeState();
    assert.equal(canUpgradeSpecies(state, 'poolworm'), false);
  });

  it('returns false if chapter < 3', () => {
    const state = makeState({ chapter: 2 });
    assert.equal(canUpgradeSpecies(state, 'luminmoss'), false);
  });

  it('returns false if not enough threads', () => {
    const state = makeState({ myceliumThreads: 10 });
    assert.equal(canUpgradeSpecies(state, 'luminmoss'), false);
  });

  it('returns false if already at max tier (3)', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 3 } });
    assert.equal(canUpgradeSpecies(state, 'luminmoss'), false);
  });
});

describe('upgradeSpecies', () => {
  it('upgrades species and deducts threads', () => {
    const state = makeState({ myceliumThreads: 50 });
    const result = upgradeSpecies(state, 'luminmoss');
    assert.equal(result, true);
    assert.equal(state.speciesUpgrades.luminmoss, 1);
    assert.equal(state.myceliumThreads, 25);
  });

  it('returns false if cannot upgrade', () => {
    const state = makeState({ myceliumThreads: 5 });
    assert.equal(upgradeSpecies(state, 'luminmoss'), false);
    assert.equal(state.speciesUpgrades.luminmoss, undefined);
  });

  it('upgrades from tier 1 to tier 2', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 1 }, myceliumThreads: 100 });
    upgradeSpecies(state, 'luminmoss');
    assert.equal(state.speciesUpgrades.luminmoss, 2);
    assert.equal(state.myceliumThreads, 25);
  });
});

describe('getSpeciesOutputBonus', () => {
  it('returns 0 for unupgraded species', () => {
    const state = makeState();
    assert.equal(getSpeciesOutputBonus(state), 0);
  });

  it('returns bonus for tier 1 upgrade', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 1 } });
    assert.ok(getSpeciesOutputBonus(state) > 0);
  });

  it('returns higher bonus for tier 3', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 3 } });
    const t3 = getSpeciesOutputBonus(state);
    const state2 = makeState({ speciesUpgrades: { luminmoss: 1 } });
    const t1 = getSpeciesOutputBonus(state2);
    assert.ok(t3 > t1);
  });
});

describe('getSpeciesEchoBonus', () => {
  it('returns 0 for species below tier 2', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 1 } });
    assert.equal(getSpeciesEchoBonus(state), 0);
  });

  it('returns bonus for tier 2+ species', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 2 } });
    assert.ok(getSpeciesEchoBonus(state) > 0);
  });

  it('returns higher bonus for tier 3', () => {
    const state = makeState({ speciesUpgrades: { luminmoss: 3 } });
    const t3 = getSpeciesEchoBonus(state);
    const state2 = makeState({ speciesUpgrades: { luminmoss: 2 } });
    const t2 = getSpeciesEchoBonus(state2);
    assert.ok(t3 > t2);
  });
});
