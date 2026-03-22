import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createState, resetLoop, calcOfflineProgressWithRate } from '../../js/engine/state.js';

describe('createState', () => {
  it('returns a state object with all required fields', () => {
    const s = createState();
    assert.strictEqual(s.chapter, 1);
    assert.strictEqual(s.loop, 0);
    assert.strictEqual(s.residue, 0);
    assert.strictEqual(s.echoMatter, 0);
    assert.deepStrictEqual(s.generators, {});
    assert.deepStrictEqual(s.discoveredSpecies, []);
    assert.deepStrictEqual(s.achievements, []);
    assert.deepStrictEqual(s.activeAnomalies, []);
  });
});

describe('resetLoop', () => {
  it('resets TR to zero', () => {
    const s = createState();
    s.residue = 5000;
    resetLoop(s);
    assert.strictEqual(s.residue, 0);
  });
  it('preserves Echo Matter', () => {
    const s = createState();
    s.echoMatter = 100;
    resetLoop(s);
    assert.strictEqual(s.echoMatter, 100);
  });
  it('resets all generator counts to zero', () => {
    const s = createState();
    s.generators = { mossPatch: 15, puddleFarm: 5 };
    resetLoop(s);
    assert.strictEqual(s.generators.mossPatch, 0);
    assert.strictEqual(s.generators.puddleFarm, 0);
  });
  it('preserves discovered species', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    resetLoop(s);
    assert.deepStrictEqual(s.discoveredSpecies, ['luminmoss', 'driftspore']);
  });
  it('increments loop counter', () => {
    const s = createState();
    resetLoop(s);
    assert.strictEqual(s.loop, 1);
  });
  it('resets multiplier levels', () => {
    const s = createState();
    s.multipliers = { sharpEyes: 5, ecosystemHarmony: 3 };
    resetLoop(s);
    assert.strictEqual(s.multipliers.sharpEyes, 0);
    assert.strictEqual(s.multipliers.ecosystemHarmony, 0);
  });
  it('applies Residual Memory permanent upgrade', () => {
    const s = createState();
    s.residue = 1000;
    s.permanentUpgrades = { residualMemory: 2 };
    s.trEarnedThisLoop = 1000;
    resetLoop(s);
    assert.strictEqual(s.residue, 20);
  });
  it('resets activeAnomalies', () => {
    const s = createState();
    s.activeAnomalies = [{ id: 'a1' }];
    resetLoop(s);
    assert.deepStrictEqual(s.activeAnomalies, []);
  });
  it('applies Deja Vu bonus before multipliers reset', () => {
    const s = createState();
    s.multipliers = { dejaVu: 3 };
    resetLoop(s);
    assert.strictEqual(s.residue, 150); // 3 * 50
    assert.strictEqual(s.multipliers.dejaVu, 0);
  });
});

describe('calcOfflineProgressWithRate', () => {
  it('returns TR earned at 50% generator efficiency', () => {
    const s = createState();
    const result = calcOfflineProgressWithRate(s, 3600, 5);
    assert.strictEqual(result.trEarned, Math.floor(5 * 3600 * 0.5));
  });
  it('caps offline time at 8 hours', () => {
    const s = createState();
    const result = calcOfflineProgressWithRate(s, 100000, 5);
    const cappedResult = calcOfflineProgressWithRate(s, 8 * 3600, 5);
    assert.strictEqual(result.trEarned, cappedResult.trEarned);
  });
  it('uses 100% efficiency with Offline Beacon', () => {
    const s = createState();
    s.automation = { offlineBeacon: true };
    const result = calcOfflineProgressWithRate(s, 3600, 5);
    assert.strictEqual(result.trEarned, Math.floor(5 * 3600 * 1.0));
  });
});
