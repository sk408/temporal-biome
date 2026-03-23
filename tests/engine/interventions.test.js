import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INTERVENTIONS, canUseIntervention, useIntervention, tickInterventionCooldowns, getInterventionState } from '../../js/engine/interventions.js';

function makeState(overrides = {}) {
  return {
    chapter: 3,
    interventionCooldowns: {},
    activeBuffs: [],
    generators: { mossPatch: 10, puddleFarm: 5, sporeColony: 3 },
    flowBoostTargets: [],
    ...overrides,
  };
}

describe('INTERVENTIONS', () => {
  it('defines nurturePulse for Ch3', () => {
    assert.ok(INTERVENTIONS.nurturePulse);
    assert.equal(INTERVENTIONS.nurturePulse.chapter, 3);
    assert.equal(INTERVENTIONS.nurturePulse.cooldown, 60);
  });

  it('defines redirectFlow for Ch3', () => {
    assert.ok(INTERVENTIONS.redirectFlow);
    assert.equal(INTERVENTIONS.redirectFlow.chapter, 3);
    assert.equal(INTERVENTIONS.redirectFlow.cooldown, 120);
  });
});

describe('canUseIntervention', () => {
  it('returns true when available and chapter unlocked', () => {
    const state = makeState();
    assert.equal(canUseIntervention(state, 'nurturePulse'), true);
  });

  it('returns false when chapter too low', () => {
    const state = makeState({ chapter: 2 });
    assert.equal(canUseIntervention(state, 'nurturePulse'), false);
  });

  it('returns false when on cooldown', () => {
    const state = makeState({ interventionCooldowns: { nurturePulse: 30 } });
    assert.equal(canUseIntervention(state, 'nurturePulse'), false);
  });
});

describe('useIntervention', () => {
  it('nurturePulse adds buff and sets cooldown', () => {
    const state = makeState();
    const result = useIntervention(state, 'nurturePulse');
    assert.equal(result, true);
    assert.equal(state.interventionCooldowns.nurturePulse, 60);
    assert.ok(state.activeBuffs.some(b => b.id === 'nurturePulse'));
  });

  it('redirectFlow boosts top 2 generators by count', () => {
    const state = makeState({
      generators: { mossPatch: 10, puddleFarm: 5, sporeColony: 3 },
    });
    const result = useIntervention(state, 'redirectFlow');
    assert.equal(result, true);
    assert.equal(state.interventionCooldowns.redirectFlow, 120);
    assert.deepEqual(state.flowBoostTargets.sort(), ['mossPatch', 'puddleFarm'].sort());
    assert.ok(state.activeBuffs.some(b => b.id === 'redirectFlow'));
  });

  it('returns false if cannot use', () => {
    const state = makeState({ chapter: 2 });
    assert.equal(useIntervention(state, 'nurturePulse'), false);
  });
});

describe('tickInterventionCooldowns', () => {
  it('reduces cooldowns by dt', () => {
    const state = makeState({ interventionCooldowns: { nurturePulse: 30, redirectFlow: 60 } });
    tickInterventionCooldowns(state, 10);
    assert.equal(state.interventionCooldowns.nurturePulse, 20);
    assert.equal(state.interventionCooldowns.redirectFlow, 50);
  });

  it('removes cooldown when it reaches zero', () => {
    const state = makeState({ interventionCooldowns: { nurturePulse: 5 } });
    tickInterventionCooldowns(state, 10);
    assert.equal(state.interventionCooldowns.nurturePulse, undefined);
  });
});

describe('getInterventionState', () => {
  it('returns available state', () => {
    const state = makeState();
    const info = getInterventionState(state, 'nurturePulse');
    assert.equal(info.available, true);
    assert.equal(info.cooldownRemaining, 0);
  });

  it('returns cooldown remaining', () => {
    const state = makeState({ interventionCooldowns: { nurturePulse: 30 } });
    const info = getInterventionState(state, 'nurturePulse');
    assert.equal(info.available, false);
    assert.equal(info.cooldownRemaining, 30);
  });

  it('returns locked for wrong chapter', () => {
    const state = makeState({ chapter: 2 });
    const info = getInterventionState(state, 'nurturePulse');
    assert.equal(info.locked, true);
  });
});
