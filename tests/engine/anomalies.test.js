import { describe, it } from 'node:test';
import assert from 'node:assert';
import { updateAnomalies, tapAnomaly, getActiveAnomalies } from '../../js/engine/anomalies.js';
import { createState } from '../../js/engine/state.js';

describe('updateAnomalies', () => {
  it('spawns anomaly after interval', () => {
    const s = createState();
    // Tick enough to trigger a spawn (base interval is 8s)
    updateAnomalies(s, 9);
    assert.ok(s.activeAnomalies.length >= 1);
  });
  it('removes expired anomalies', () => {
    const s = createState();
    s.activeAnomalies = [{ id: 'a0', type: 'residue', x: 0.5, y: 0.5, spawnTime: 0, lifetime: 2, age: 0 }];
    updateAnomalies(s, 3); // age 3 > lifetime 2
    const remaining = s.activeAnomalies.filter(a => a.id === 'a0');
    assert.strictEqual(remaining.length, 0);
  });
});

describe('tapAnomaly', () => {
  it('returns reward and removes anomaly', () => {
    const s = createState();
    s.activeAnomalies = [{ id: 'test1', type: 'residue', x: 0.5, y: 0.5, spawnTime: Date.now(), lifetime: 5, age: 0 }];
    const reward = tapAnomaly(s, 'test1');
    assert.ok(reward);
    assert.strictEqual(reward.type, 'residue');
    assert.ok(reward.amount > 0);
    assert.strictEqual(s.activeAnomalies.length, 0);
  });
  it('returns null for missing anomaly', () => {
    const s = createState();
    s.activeAnomalies = [];
    const reward = tapAnomaly(s, 'nonexistent');
    assert.strictEqual(reward, null);
  });
  it('tracks chain multiplier', () => {
    const s = createState();
    s.activeAnomalies = [
      { id: 't1', type: 'residue', x: 0.5, y: 0.5, spawnTime: Date.now(), lifetime: 5, age: 0 },
      { id: 't2', type: 'residue', x: 0.5, y: 0.5, spawnTime: Date.now(), lifetime: 5, age: 0 },
    ];
    const r1 = tapAnomaly(s, 't1');
    const r2 = tapAnomaly(s, 't2');
    assert.strictEqual(r1.chain, 1);
    assert.strictEqual(r2.chain, 2);
    assert.ok(r2.amount > r1.amount); // chain multiplier
  });
  it('increments totalAnomaliesTapped', () => {
    const s = createState();
    s.activeAnomalies = [{ id: 't1', type: 'residue', x: 0.5, y: 0.5, spawnTime: Date.now(), lifetime: 5, age: 0 }];
    tapAnomaly(s, 't1');
    assert.strictEqual(s.totalAnomaliesTapped, 1);
  });
  it('rift anomaly rewards TR, tokens, and shards', () => {
    const s = createState();
    s.activeAnomalies = [{ id: 'rift1', type: 'rift', x: 0.5, y: 0.5, spawnTime: Date.now(), lifetime: 10, age: 0 }];
    const reward = tapAnomaly(s, 'rift1');
    assert.strictEqual(reward.type, 'rift');
    assert.ok(reward.amount > 0);
    assert.ok(reward.tokenBonus > 0);
    assert.ok(reward.shardBonus > 0);
    assert.ok(s.residue > 0);
    assert.ok(s.anomalyTokens > 0);
    assert.ok(s.memoryShards > 0);
  });
});
