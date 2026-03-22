import { describe, it } from 'node:test';
import assert from 'node:assert';
import { tickCatastrophe, getCatastrophePhase, CATASTROPHE_DURATION } from '../../js/engine/catastrophe.js';
import { createState } from '../../js/engine/state.js';

describe('tickCatastrophe', () => {
  it('increments catastrophe timer by dt', () => {
    const s = createState();
    tickCatastrophe(s, 1.0);
    assert.strictEqual(s.catastropheTimer, 1.0);
  });
  it('returns trigger when timer exceeds chapter duration', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] - 0.5;
    const result = tickCatastrophe(s, 1.0);
    assert.strictEqual(result, 'trigger');
  });
  it('returns paused when temporal anchor is active', () => {
    const s = createState();
    s.activeBuffs = [{ id: 'temporalAnchor' }];
    const result = tickCatastrophe(s, 1.0);
    assert.strictEqual(result, 'paused');
    assert.strictEqual(s.catastropheTimer, 0);
  });
});

describe('getCatastrophePhase', () => {
  it('returns calm below 50%', () => {
    const s = createState();
    s.catastropheTimer = 100;
    assert.strictEqual(getCatastrophePhase(s), 'calm');
  });
  it('returns warning at 75-90%', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] * 0.8;
    assert.strictEqual(getCatastrophePhase(s), 'warning');
  });
  it('returns critical above 90%', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] * 0.95;
    assert.strictEqual(getCatastrophePhase(s), 'critical');
  });
});
