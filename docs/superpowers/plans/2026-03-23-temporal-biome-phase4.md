# Phase 4: Chapter 4 "The Coral Epoch" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Chapter 4 of Temporal Biome, introducing synergy chains, invasive species, manual loop trigger, Erosion catastrophe, Coral Essence resource, underwater reef biome, and 12 new species.

**Architecture:** Chapter 4 builds on the established chapter pattern: new engine modules for synergy chains and invasive species, data extensions for species/generators/synergies, and UI integration. The manual loop trigger is a permanent upgrade gated to Ch4+. Invasive species introduce the first negative persistent mechanic (survives a loop if unchecked). All new systems follow the pure-function engine pattern established in Phases 1-3.

**Tech Stack:** Vanilla JS (ES modules), SVG procedural creatures, Node.js `node:test` for TDD, localStorage persistence.

### Design Decisions & Spec Notes
- **Invasive Species at Ch4:** The spec overview table places invasives at Ch5, but the detailed section 9.2 says "Starting in Chapter 4." We follow section 9.2 as the more specific reference.
- **Manual Loop Trigger:** The spec says this is "VERY RARELY" earned through "specific achievement chains." We gate it behind the `ch4Complete` achievement (completing all Ch4 objectives) + 2000 EM cost, making it a late-Ch4/early-Ch5 unlock rather than routine.
- **Coral Essence Spending:** The spec says Coral Essence is used to "unlock synergy chains, craft items." In this plan, synergy chains activate automatically at generator thresholds. Coral Essence will be used in Ch5+ for crafting/synergy enhancements. For now it accumulates as a visible progress metric.
- **Introduce Predator:** Simplified from spec's "remove weakest, boost strongest" to a flat 3x production buff for 45s. Full species removal/targeting would need complex undo logic for minimal gameplay value.
- **Erosion Stacks:** Decay 1 per non-erosion loop to prevent permanent stuck states. Max 3 stacks (12.5% production floor).

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `js/engine/synergy-chains.js` | Synergy chain detection, bonus calculation, discovery tracking |
| `js/engine/invasive.js` | Invasive species spawn, spread, removal, persistence logic |
| `tests/engine/synergy-chains.test.js` | Tests for synergy chain engine |
| `tests/engine/invasive.test.js` | Tests for invasive species engine |

### Modified Files
| File | Changes |
|------|---------|
| `js/engine/state.js` | Add Ch4 state defaults (coralEssence, invasive fields, synergyChainsDiscovered, erosionStacks), update resetLoop for Erosion and invasive persistence |
| `js/engine/catastrophe.js` | Add Erosion catastrophe type, update type randomization weights |
| `js/engine/interventions.js` | Add Introduce Predator and Remove Invasive interventions |
| `js/engine/economy.js` | Integrate synergy chain bonuses, invasive drain, Coral Essence generation, erosion debuff |
| `js/engine/progress.js` | Ch4 objectives, achievements, chronicle entries |
| `js/data/generators.js` | 3 Ch4 generators with coralOutput field |
| `js/data/species.js` | 7 discoverable + 5 combination Ch4 species with SVG |
| `js/data/upgrades.js` | Loop Déjà Vu permanent upgrade |
| `js/data/narrative.js` | Ch4 quote pools (early/mid/late) |
| `js/engine/symbiosis.js` | 4 Ch4 synergy pairs |
| `js/ui/biome.js` | Ch4 underwater reef biome visuals |
| `js/ui/overlays.js` | Erosion catastrophe overlay variant |
| `js/ui/renderer.js` | Erosion catastrophe label/tint, invasive indicator |
| `js/main.js` | UI integration for all Ch4 systems |
| `index.html` | Coral Essence counter, invasive alert bar, manual loop button, synergy chains section |
| `css/game.css` | Styles for Ch4 UI elements |

---

## Task Breakdown

### Task 1: State Defaults & Erosion Catastrophe

**Files:**
- Modify: `js/engine/state.js` — add Ch4 fields to `createState()` and `resetLoop()`
- Modify: `js/engine/catastrophe.js` — add Erosion type, update randomization
- Modify: `js/ui/overlays.js` — add Erosion overlay variant
- Test: `tests/engine/catastrophe.test.js` (extend)
- Test: `tests/engine/state.test.js` (extend)

- [ ] **Step 1: Add Ch4 state defaults to `createState()`**

In `js/engine/state.js`, add new fields to `createState()`:
- After `myceliumThreads: 0` on line 4, add: `coralEssence: 0,`
- After `catastropheType: 'fog'` on line 19, add: `synergyChainsDiscovered: [], erosionStacks: 0, totalInvasivesRemoved: 0,`
- Add `loopDejaVu: 0` to the `permanentUpgrades` object on line 9

Note: `invasiveSpecies: null` already exists on line 16 — do NOT re-add it.

- [ ] **Step 2: Update `resetLoop()` for Erosion and invasive persistence**

In `resetLoop()`:

**IMPORTANT:** The existing code at line 63 (`state.invasiveSpecies = null`) must be changed to conditional persistence:
```javascript
// Line 63: Replace `state.invasiveSpecies = null;` with:
if (!state.invasiveSpecies) {
  // No invasive — nothing to do
} else {
  // Invasive persists into next loop if not removed (Ch4+ mechanic)
  // invasiveSpecies object is NOT cleared
}
```

**Apply erosion stacks** — add before the catastrophe type randomization (before the `if (state.chapter >= 3)` block at line 72):
```javascript
// Erosion: increment stack. Non-erosion: decay 1 stack
if (state.catastropheType === 'erosion') {
  state.erosionStacks = Math.min((state.erosionStacks || 0) + 1, 3);
} else if ((state.erosionStacks || 0) > 0) {
  state.erosionStacks -= 1; // Decay 1 stack per non-erosion loop
}
```

**Replace the existing catastrophe type randomization block** (lines 72-76) with:
```javascript
if (state.chapter >= 4) {
  const roll = Math.random();
  if (roll < 0.50) state.catastropheType = 'fog';
  else if (roll < 0.75) state.catastropheType = 'storm';
  else state.catastropheType = 'erosion';
} else if (state.chapter >= 3) {
  state.catastropheType = Math.random() < 0.6 ? 'fog' : 'storm';
} else {
  state.catastropheType = 'fog';
}
```

- [ ] **Step 3: Add Erosion to CATASTROPHE_TYPES in `catastrophe.js`**

```javascript
export const CATASTROPHE_TYPES = {
  fog: { name: 'Fog Wipe', desc: 'Full TR reset, all generators reset', color: '#8040c0' },
  storm: { name: 'Temporal Storm', desc: 'Keeps 25% of TR', color: '#f0d040' },
  erosion: { name: 'Erosion', desc: 'Halves production next loop (stacks)', color: '#a08060' },
};
```

- [ ] **Step 4: Add Erosion overlay variant to `overlays.js`**

In `showCatastrophe(callback, catastropheType)`, add erosion branch:
```javascript
if (catastropheType === 'erosion') {
  textEl.style.color = '#a08060';
  textEl.textContent = 'THE GROUND CRUMBLES';
  subTextEl.textContent = 'Production halved next loop...';
}
```

- [ ] **Step 5: Write tests for erosion stacks in resetLoop**

In `tests/engine/state.test.js`, add:
```javascript
it('increments erosionStacks when catastropheType is erosion', () => {
  const state = createState();
  state.catastropheType = 'erosion';
  state.erosionStacks = 0;
  resetLoop(state);
  assert.equal(state.erosionStacks, 1);
});

it('caps erosionStacks at 3', () => {
  const state = createState();
  state.catastropheType = 'erosion';
  state.erosionStacks = 3;
  resetLoop(state);
  assert.equal(state.erosionStacks, 3);
});

it('preserves invasiveSpecies across loop if not removed', () => {
  const state = createState();
  state.invasiveSpecies = { id: 'test', drainPct: 0.15, age: 30 };
  resetLoop(state);
  assert.ok(state.invasiveSpecies); // NOT cleared
});

it('decays erosionStacks by 1 on non-erosion catastrophe', () => {
  const state = createState();
  state.catastropheType = 'fog';
  state.erosionStacks = 2;
  resetLoop(state);
  assert.equal(state.erosionStacks, 1);
});
```

- [ ] **Step 6: Run tests**

```bash
node --test tests/engine/state.test.js tests/engine/catastrophe.test.js
```
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add js/engine/state.js js/engine/catastrophe.js js/ui/overlays.js tests/engine/state.test.js tests/engine/catastrophe.test.js
git commit -m "feat(ch4): add erosion catastrophe type and Ch4 state defaults"
```

---

### Task 2: Synergy Chains Engine

**Files:**
- Create: `js/engine/synergy-chains.js`
- Create: `tests/engine/synergy-chains.test.js`

Synergy chains activate when 3+ specific generators are each at level 10+. They provide a multiplicative bonus to all generators in the chain. Chains are "discovered" when first triggered — not revealed upfront.

- [ ] **Step 1: Write failing tests**

`tests/engine/synergy-chains.test.js`:
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SYNERGY_CHAINS, getActiveChains, getSynergyChainBonus, checkNewChains } from '../../js/engine/synergy-chains.js';

function makeState(overrides = {}) {
  return {
    chapter: 4,
    generators: {},
    synergyChainsDiscovered: [],
    ...overrides,
  };
}

describe('SYNERGY_CHAINS', () => {
  it('defines at least 3 chains', () => {
    assert.ok(SYNERGY_CHAINS.length >= 3);
  });
  it('each chain has id, generators array, bonus, name, desc', () => {
    for (const chain of SYNERGY_CHAINS) {
      assert.ok(chain.id);
      assert.ok(Array.isArray(chain.generators));
      assert.ok(chain.generators.length >= 3);
      assert.ok(typeof chain.bonus === 'number');
      assert.ok(chain.name);
    }
  });
});

describe('getActiveChains', () => {
  it('returns empty when no generators at threshold', () => {
    const state = makeState({ generators: { mossPatch: 5, rootCluster: 3 } });
    assert.deepEqual(getActiveChains(state), []);
  });
  it('returns chain when all generators at 10+', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 10, symbioticPair: 10 },
    });
    const active = getActiveChains(state);
    assert.ok(active.length >= 1);
    assert.ok(active.some(c => c.id === 'undergroundNetwork'));
  });
  it('does not return chain when one generator below threshold', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 9, symbioticPair: 10 },
    });
    assert.deepEqual(getActiveChains(state), []);
  });
});

describe('getSynergyChainBonus', () => {
  it('returns 0 with no active chains', () => {
    const state = makeState({ generators: {} });
    assert.equal(getSynergyChainBonus(state, 'mossPatch'), 0);
  });
  it('returns bonus for generators in an active chain', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 10, symbioticPair: 10 },
    });
    const bonus = getSynergyChainBonus(state, 'mossPatch');
    assert.ok(bonus > 0);
  });
  it('returns 0 for generators not in any active chain', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 10, symbioticPair: 10, puddleFarm: 5 },
    });
    assert.equal(getSynergyChainBonus(state, 'puddleFarm'), 0);
  });
});

describe('checkNewChains', () => {
  it('returns newly discovered chain ids', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 10, symbioticPair: 10 },
      synergyChainsDiscovered: [],
    });
    const newChains = checkNewChains(state);
    assert.ok(newChains.length >= 1);
    assert.ok(state.synergyChainsDiscovered.includes('undergroundNetwork'));
  });
  it('does not re-report already discovered chains', () => {
    const state = makeState({
      generators: { mossPatch: 10, rootCluster: 10, symbioticPair: 10 },
      synergyChainsDiscovered: ['undergroundNetwork'],
    });
    const newChains = checkNewChains(state);
    assert.equal(newChains.length, 0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test tests/engine/synergy-chains.test.js
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement synergy-chains.js**

```javascript
// js/engine/synergy-chains.js — Synergy chain detection (Ch4+)
// When 3+ specific generators are each at level 10+, they form a chain
// providing multiplicative bonus to all generators in the chain.

const THRESHOLD = 10;

export const SYNERGY_CHAINS = [
  {
    id: 'undergroundNetwork',
    name: 'Underground Network',
    generators: ['mossPatch', 'rootCluster', 'symbioticPair'],
    bonus: 0.50,
    desc: '+50% output to Moss Patch, Root Cluster, Symbiotic Pair',
    chapter: 4,
  },
  {
    id: 'gardenEngine',
    name: 'Garden Engine',
    generators: ['gardenMatrix', 'growthAccelerator', 'myceliumWeb'],
    bonus: 0.50,
    desc: '+50% output to Garden Matrix, Growth Accelerator, Mycelium Web',
    chapter: 4,
  },
  {
    id: 'deepCurrent',
    name: 'Deep Current',
    generators: ['coralWeave', 'reefEngine', 'tidalForge'],
    bonus: 0.75,
    desc: '+75% output to Coral Weave, Reef Engine, Tidal Forge',
    chapter: 4,
  },
  {
    id: 'primordialCore',
    name: 'Primordial Core',
    generators: ['puddleFarm', 'sporeColony', 'primordialEngine'],
    bonus: 0.60,
    desc: '+60% output to Puddle Farm, Spore Colony, Primordial Engine',
    chapter: 5,
  },
  {
    id: 'fungalOvermind',
    name: 'Fungal Overmind',
    generators: ['fungalReactor', 'sporeCannon', 'symbioticPair'],
    bonus: 0.55,
    desc: '+55% output to Fungal Reactor, Spore Cannon, Symbiotic Pair',
    chapter: 5,
  },
];

export function getActiveChains(state) {
  return SYNERGY_CHAINS.filter(chain => {
    if (chain.chapter > (state.chapter || 1)) return false;
    return chain.generators.every(genId => (state.generators[genId] || 0) >= THRESHOLD);
  });
}

export function getSynergyChainBonus(state, generatorId) {
  const active = getActiveChains(state);
  let bonus = 0;
  for (const chain of active) {
    if (chain.generators.includes(generatorId)) {
      bonus += chain.bonus;
    }
  }
  return bonus;
}

export function checkNewChains(state) {
  const active = getActiveChains(state);
  const newlyDiscovered = [];
  for (const chain of active) {
    if (!state.synergyChainsDiscovered.includes(chain.id)) {
      state.synergyChainsDiscovered.push(chain.id);
      newlyDiscovered.push(chain);
    }
  }
  return newlyDiscovered;
}
```

- [ ] **Step 4: Run tests**

```bash
node --test tests/engine/synergy-chains.test.js
```
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add js/engine/synergy-chains.js tests/engine/synergy-chains.test.js
git commit -m "feat(ch4): add synergy chain engine"
```

---

### Task 3: Invasive Species Engine

**Files:**
- Create: `js/engine/invasive.js`
- Create: `tests/engine/invasive.test.js`

Invasive species spawn with 30% chance per loop (Ch4+). They drain 10-25% of production, spread 5%/minute if not removed, and persist into the next loop if unchecked.

- [ ] **Step 1: Write failing tests**

`tests/engine/invasive.test.js`:
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldSpawnInvasive, spawnInvasive, tickInvasive, removeInvasive, getInvasiveDrain } from '../../js/engine/invasive.js';

function makeState(overrides = {}) {
  return {
    chapter: 4,
    invasiveSpecies: null,
    invasiveCarryover: false,
    discoveredSpecies: ['luminmoss', 'driftspore', 'coralbloom'],
    ...overrides,
  };
}

describe('shouldSpawnInvasive', () => {
  it('returns false for chapter < 4', () => {
    assert.equal(shouldSpawnInvasive({ chapter: 3 }), false);
  });
  it('returns false if invasive already active', () => {
    const state = makeState({ invasiveSpecies: { id: 'x', drainPct: 0.15, age: 0 } });
    assert.equal(shouldSpawnInvasive(state), false);
  });
  it('returns boolean for chapter >= 4 with no active invasive', () => {
    const state = makeState();
    const result = shouldSpawnInvasive(state);
    assert.equal(typeof result, 'boolean');
  });
});

describe('spawnInvasive', () => {
  it('creates invasive with drain between 0.10 and 0.25', () => {
    const state = makeState();
    spawnInvasive(state);
    assert.ok(state.invasiveSpecies);
    assert.ok(state.invasiveSpecies.drainPct >= 0.10);
    assert.ok(state.invasiveSpecies.drainPct <= 0.25);
    assert.equal(state.invasiveSpecies.age, 0);
  });
});

describe('tickInvasive', () => {
  it('increments age and increases drain over time', () => {
    const state = makeState({
      invasiveSpecies: { id: 'inv1', drainPct: 0.15, age: 0 },
    });
    tickInvasive(state, 60); // 1 minute
    assert.equal(state.invasiveSpecies.age, 60);
    assert.ok(state.invasiveSpecies.drainPct > 0.15); // spread: +5% per minute
  });
  it('does nothing if no invasive', () => {
    const state = makeState();
    tickInvasive(state, 60);
    assert.equal(state.invasiveSpecies, null);
  });
  it('caps drain at 0.75', () => {
    const state = makeState({
      invasiveSpecies: { id: 'inv1', drainPct: 0.70, age: 600 },
    });
    tickInvasive(state, 120);
    assert.ok(state.invasiveSpecies.drainPct <= 0.75);
  });
});

describe('removeInvasive', () => {
  it('clears invasive species from state', () => {
    const state = makeState({
      invasiveSpecies: { id: 'inv1', drainPct: 0.15, age: 30 },
    });
    removeInvasive(state);
    assert.equal(state.invasiveSpecies, null);
  });
});

describe('getInvasiveDrain', () => {
  it('returns 0 with no invasive', () => {
    assert.equal(getInvasiveDrain(makeState()), 0);
  });
  it('returns drain percentage when invasive active', () => {
    const state = makeState({
      invasiveSpecies: { id: 'inv1', drainPct: 0.20, age: 10 },
    });
    assert.equal(getInvasiveDrain(state), 0.20);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test tests/engine/invasive.test.js
```

- [ ] **Step 3: Implement invasive.js**

```javascript
// js/engine/invasive.js — Invasive species mechanic (Ch4+)
// 30% chance per loop to spawn. Drains production, spreads over time.
// Removed via intervention or marketplace item. Persists if unchecked.

const SPAWN_CHANCE = 0.30;
const MIN_DRAIN = 0.10;
const MAX_DRAIN = 0.25;
const SPREAD_RATE = 0.05 / 60; // +5% per minute = per-second rate
const MAX_TOTAL_DRAIN = 0.75;

const INVASIVE_NAMES = [
  'Stranglecreep', 'Blightvine', 'Parasitic Bloom',
  'Choking Moss', 'Shadow Mold', 'Toxicap',
];

export function shouldSpawnInvasive(state) {
  if ((state.chapter || 1) < 4) return false;
  if (state.invasiveSpecies) return false;
  return Math.random() < SPAWN_CHANCE;
}

export function spawnInvasive(state) {
  const drain = MIN_DRAIN + Math.random() * (MAX_DRAIN - MIN_DRAIN);
  const name = INVASIVE_NAMES[Math.floor(Math.random() * INVASIVE_NAMES.length)];
  state.invasiveSpecies = {
    id: 'invasive_' + Date.now(),
    name,
    drainPct: Math.round(drain * 100) / 100,
    age: 0,
    x: 0.15 + Math.random() * 0.7,
    y: 0.15 + Math.random() * 0.6,
  };
}

export function tickInvasive(state, dt) {
  if (!state.invasiveSpecies) return;
  state.invasiveSpecies.age += dt;
  // Spread: +5% drain per minute
  const spread = SPREAD_RATE * dt;
  state.invasiveSpecies.drainPct = Math.min(
    state.invasiveSpecies.drainPct + spread,
    MAX_TOTAL_DRAIN
  );
}

export function removeInvasive(state) {
  if (state.invasiveSpecies) {
    state.totalInvasivesRemoved = (state.totalInvasivesRemoved || 0) + 1;
  }
  state.invasiveSpecies = null;
}

export function getInvasiveDrain(state) {
  if (!state.invasiveSpecies) return 0;
  return state.invasiveSpecies.drainPct;
}
```

- [ ] **Step 4: Run tests**

```bash
node --test tests/engine/invasive.test.js
```
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add js/engine/invasive.js tests/engine/invasive.test.js
git commit -m "feat(ch4): add invasive species engine"
```

---

### Task 4: Manual Loop Trigger & Loop Déjà Vu Upgrade

**Files:**
- Modify: `js/data/upgrades.js` — add Loop Déjà Vu permanent upgrade
- Modify: `js/engine/state.js` — add `manualLoopUnlocked` computed check
- Test: `tests/engine/state.test.js` (extend)

- [ ] **Step 1: Add Loop Déjà Vu to PERMANENT_UPGRADES**

In `js/data/upgrades.js`, add to `PERMANENT_UPGRADES`:
```javascript
loopDejaVu: {
  id: 'loopDejaVu',
  name: 'Loop Déjà Vu',
  desc: 'Unlock manual loop trigger (Ch4+ only, requires ch4Complete achievement)',
  maxLevel: 1,
  costs: [2000],
  effect: 'manualLoop',
  requiresAchievement: 'ch4Complete',
},
```

- [ ] **Step 2: Verify loopDejaVu is in permanent upgrades and purchaseable**

```bash
node -e "import('/home/claude/idle-game/js/data/upgrades.js').then(m => { const d = m.PERMANENT_UPGRADES.loopDejaVu; console.log('loopDejaVu:', d.name, 'cost:', d.costs[0], 'max:', d.maxLevel); })"
```
Expected: `loopDejaVu: Loop Déjà Vu cost: 2000 max: 1`

- [ ] **Step 3: Run tests**

```bash
node --test tests/engine/state.test.js
```

- [ ] **Step 4: Commit**

```bash
git add js/data/upgrades.js tests/engine/state.test.js
git commit -m "feat(ch4): add Loop Déjà Vu permanent upgrade for manual loop trigger"
```

---

### Task 5: Ch4 Interventions (Introduce Predator, Remove Invasive)

**Files:**
- Modify: `js/engine/interventions.js` — add 2 Ch4 interventions
- Modify: `tests/engine/interventions.test.js` — extend with Ch4 tests

- [ ] **Step 1: Write failing tests**

Add to `tests/engine/interventions.test.js`:
```javascript
describe('Ch4 interventions', () => {
  it('defines introducePredator for Ch4', () => {
    assert.ok(INTERVENTIONS.introducePredator);
    assert.equal(INTERVENTIONS.introducePredator.chapter, 4);
    assert.equal(INTERVENTIONS.introducePredator.cooldown, 180);
  });

  it('defines removeInvasive for Ch4', () => {
    assert.ok(INTERVENTIONS.removeInvasive);
    assert.equal(INTERVENTIONS.removeInvasive.chapter, 4);
    assert.equal(INTERVENTIONS.removeInvasive.cooldown, 90);
  });

  it('introducePredator adds predatorBoost buff and sets cooldown', () => {
    const state = {
      chapter: 4,
      activeBuffs: [],
      interventionCooldowns: {},
    };
    const result = useIntervention(state, 'introducePredator');
    assert.equal(result, true);
    assert.ok(state.activeBuffs.some(b => b.id === 'predatorBoost'));
    assert.equal(state.interventionCooldowns.introducePredator, 180);
  });

  it('removeInvasive clears invasive species and increments counter', () => {
    const state = {
      chapter: 4,
      activeBuffs: [],
      interventionCooldowns: {},
      invasiveSpecies: { id: 'inv1', drainPct: 0.20, age: 30 },
      totalInvasivesRemoved: 0,
    };
    const result = useIntervention(state, 'removeInvasive');
    assert.equal(result, true);
    assert.equal(state.invasiveSpecies, null);
    assert.equal(state.totalInvasivesRemoved, 1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement Ch4 interventions**

Add to `INTERVENTIONS` in `js/engine/interventions.js`:
```javascript
introducePredator: {
  id: 'introducePredator', name: 'Introduce Predator', chapter: 4,
  cooldown: 180,
  buffDuration: 45,
  desc: 'Remove weakest species, boost strongest 3x for 45s',
  flavor: "I introduced a predator. The ecosystem... adjusted.",
},
removeInvasive: {
  id: 'removeInvasive', name: 'Remove Invasive', chapter: 4,
  cooldown: 90,
  buffDuration: 0,
  desc: 'Eliminate an active invasive species',
  flavor: "The invasive is gone. For now.",
},
```

Add cases to `useIntervention()` switch:
```javascript
case 'introducePredator': {
  // Temporarily triples all production for duration (simplified from spec's
  // "remove weakest, boost strongest" — full species removal would require
  // complex undo logic; this captures the spirit: big temporary production spike)
  state.activeBuffs.push({ id: 'predatorBoost', remaining: def.buffDuration });
  break;
}
case 'removeInvasive': {
  if (state.invasiveSpecies) {
    state.totalInvasivesRemoved = (state.totalInvasivesRemoved || 0) + 1;
  }
  state.invasiveSpecies = null;
  break;
}
```

- [ ] **Step 4: Run tests**

```bash
node --test tests/engine/interventions.test.js
```

- [ ] **Step 5: Commit**

```bash
git add js/engine/interventions.js tests/engine/interventions.test.js
git commit -m "feat(ch4): add Introduce Predator and Remove Invasive interventions"
```

---

### Task 6: Ch4 Generators

**Files:**
- Modify: `js/data/generators.js` — add 3 Ch4 generators

Ch3 generators: Mycelium Web (30K/s), Fungal Reactor (120K/s), Spore Cannon (500K/s)
Ch4 follows ~4x progression: Coral Weave (2M/s), Reef Engine (8M/s), Tidal Forge (32M/s)

- [ ] **Step 1: Add Ch4 generators**

```javascript
coralWeave: {
  id: 'coralWeave', name: 'Coral Weave', chapter: 4,
  baseCost: 200000000, costScaling: 1.15, baseOutput: 2000000,
  coralOutput: 0.8,
  flavor: "Living architecture. The reef builds itself.",
},
reefEngine: {
  id: 'reefEngine', name: 'Reef Engine', chapter: 4,
  baseCost: 1000000000, costScaling: 1.15, baseOutput: 8000000,
  coralOutput: 3.0,
  flavor: "The reef has become a machine. Or the machine has become a reef.",
},
tidalForge: {
  id: 'tidalForge', name: 'Tidal Forge', chapter: 4,
  baseCost: 5000000000, costScaling: 1.15, baseOutput: 32000000,
  coralOutput: 12.0,
  flavor: "I'm forging reality with ocean currents. Normal Tuesday.",
},
```

- [ ] **Step 2: Verify generators load**

```bash
node -e "import('/home/claude/idle-game/js/data/generators.js').then(m => { console.log(Object.keys(m.GENERATORS).length, 'generators'); console.log('Ch4:', Object.values(m.GENERATORS).filter(g => g.chapter === 4).map(g => g.id)); })"
```
Expected: 14 generators total, Ch4: ['coralWeave', 'reefEngine', 'tidalForge']

- [ ] **Step 3: Commit**

```bash
git add js/data/generators.js
git commit -m "feat(ch4): add Ch4 generators (Coral Weave, Reef Engine, Tidal Forge)"
```

---

### Task 7: Ch4 Species Data & SVG

**Files:**
- Modify: `js/data/species.js` — add 7 discoverable + 5 combination species with SVG generation

Ch4 species (underwater/coral theme):
- Discoverable: coralbloom, anemostinger, tidalwyrm, brineshell, phosphoreel, reefwarden, abysswatcher
- Combinations: coralspore (coralbloom+sporecap), glowcoral (phosphoreel+glowshroom), tidalmoss (tidalwyrm+luminmoss), brineworm (brineshell+mycelworm), reefgarden (reefwarden+rootweaver)

- [ ] **Step 1: Add 7 discoverable Ch4 species to SPECIES object**

Each species needs: id, name, chapter: 4, type, discoverable: true, desc, quote, color, production.

```javascript
coralbloom: {
  id: 'coralbloom', name: 'Coralbloom', chapter: 4,
  type: 'flora', discoverable: true,
  desc: 'A flowering coral that opens and closes with the tides.',
  quote: "It blooms underwater. Even beauty adapts.",
  color: '#ff7090', production: 8,
},
anemostinger: {
  id: 'anemostinger', name: 'Anemostinger', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'A venomous anemone with whip-like tendrils that glow.',
  quote: "It stings. But it also protects. A complicated neighbor.",
  color: '#d060ff', production: 10,
},
tidalwyrm: {
  id: 'tidalwyrm', name: 'Tidalwyrm', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'A serpentine creature that rides the currents like a ribbon.',
  quote: "It doesn't swim so much as become the water.",
  color: '#40b0ff', production: 12,
},
brineshell: {
  id: 'brineshell', name: 'Brineshell', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'A hermit-crab-like organism that builds coral armor.',
  quote: "It carries its home. I understand that more than I'd like.",
  color: '#d0a060', production: 9,
},
phosphoreel: {
  id: 'phosphoreel', name: 'Phosphoreel', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'An electric eel that bioluminesces in rhythmic pulses.',
  quote: "The reef has its own heartbeat. This thing IS the heartbeat.",
  color: '#60ffa0', production: 14,
},
reefwarden: {
  id: 'reefwarden', name: 'Reefwarden', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'A massive stationary organism that filters water for the reef.',
  quote: "The reef's immune system. It keeps everything in balance.",
  color: '#70c0d0', production: 11,
},
abysswatcher: {
  id: 'abysswatcher', name: 'Abysswatcher', chapter: 4,
  type: 'fauna', discoverable: true,
  desc: 'A deep-sea eye-like organism that tracks movement in the dark.',
  quote: "It watches the abyss. And the abyss, apparently, watches back.",
  color: '#3060a0', production: 15,
},
```

- [ ] **Step 2: Add 5 combination species (discoverable: false, with ingredients)**

```javascript
coralspore: {
  id: 'coralspore', name: 'Coralspore', chapter: 4,
  type: 'hybrid', discoverable: false,
  ingredients: ['coralbloom', 'sporecap'],
  desc: 'A fungal coral — rigid structure that releases clouds of spores.',
  quote: "Underground meets underwater. The mycelium reaches everywhere.",
  color: '#ff90c0', production: 20,
},
glowcoral: {
  id: 'glowcoral', name: 'Glowcoral', chapter: 4,
  type: 'hybrid', discoverable: false,
  ingredients: ['phosphoreel', 'glowshroom'],
  desc: 'A bioluminescent reef structure that pulses with shared light.',
  quote: "The glow spreads from mushroom to coral. Connection made visible.",
  color: '#60ffb0', production: 22,
},
tidalmoss: {
  id: 'tidalmoss', name: 'Tidalmoss', chapter: 4,
  type: 'hybrid', discoverable: false,
  ingredients: ['tidalwyrm', 'luminmoss'],
  desc: 'Moss that flows like water, carried by tiny wyrm-like organisms.',
  quote: "The oldest life form meets the newest. They get along surprisingly well.",
  color: '#50c0a0', production: 18,
},
brineworm: {
  id: 'brineworm', name: 'Brineworm', chapter: 4,
  type: 'hybrid', discoverable: false,
  ingredients: ['brineshell', 'mycelworm'],
  desc: 'A tunneling worm that builds salt-crystal corridors through the reef.',
  quote: "It connects the underground to the undersea. Geography is just a suggestion.",
  color: '#c0a070', production: 19,
},
reefgarden: {
  id: 'reefgarden', name: 'Reefgarden', chapter: 4,
  type: 'hybrid', discoverable: false,
  ingredients: ['reefwarden', 'rootweaver'],
  desc: 'A living garden that spans reef and soil, roots and coral intertwined.',
  quote: "Roots and reef. Two worlds connected. I built this bridge.",
  color: '#80d0a0', production: 24,
},
```

- [ ] **Step 3: Add 5 combination recipes to COMBINATIONS**

```javascript
{ a: 'coralbloom', b: 'sporecap', result: 'coralspore' },
{ a: 'phosphoreel', b: 'glowshroom', result: 'glowcoral' },
{ a: 'tidalwyrm', b: 'luminmoss', result: 'tidalmoss' },
{ a: 'brineshell', b: 'mycelworm', result: 'brineworm' },
{ a: 'reefwarden', b: 'rootweaver', result: 'reefgarden' },
```

- [ ] **Step 4: Add 12 SVG generation cases to `generateSpeciesSVG` switch**

Each species needs a unique procedural SVG. Follow the pattern of existing cases (Ch1-3). Use the species' `color` field. Underwater theme: flowing shapes, tendrils, coral branches, bioluminescent dots.

Example for coralbloom (branching coral with flower-like tips):
```javascript
case 'coralbloom': {
  const c = SPECIES.coralbloom.color;
  return `
    <line x1="${s*0.5}" y1="${s*0.9}" x2="${s*0.5}" y2="${s*0.5}" stroke="${c}" stroke-width="${s*0.04}" stroke-linecap="round"/>
    <line x1="${s*0.5}" y1="${s*0.6}" x2="${s*0.3}" y2="${s*0.35}" stroke="${c}" stroke-width="${s*0.03}" stroke-linecap="round"/>
    <line x1="${s*0.5}" y1="${s*0.6}" x2="${s*0.7}" y2="${s*0.35}" stroke="${c}" stroke-width="${s*0.03}" stroke-linecap="round"/>
    <circle cx="${s*0.5}" cy="${s*0.45}" r="${s*0.08}" fill="${c}" opacity="0.8"/>
    <circle cx="${s*0.3}" cy="${s*0.3}" r="${s*0.06}" fill="${c}" opacity="0.7"/>
    <circle cx="${s*0.7}" cy="${s*0.3}" r="${s*0.06}" fill="${c}" opacity="0.7"/>
    <circle cx="${s*0.5}" cy="${s*0.25}" r="${s*0.05}" fill="${c}" opacity="0.5"/>
  `;
}
```

Generate unique SVGs for all 12 species. Each should be visually distinct and thematic (underwater/coral).

- [ ] **Step 5: Verify species data loads**

```bash
node -e "import('/home/claude/idle-game/js/data/species.js').then(m => { const ch4 = Object.values(m.SPECIES).filter(s => s.chapter === 4); console.log(ch4.length, 'Ch4 species'); console.log('Discoverable:', ch4.filter(s => s.discoverable).length); console.log('Combos:', ch4.filter(s => !s.discoverable).length); console.log('Combo recipes:', m.COMBINATIONS.filter(c => m.SPECIES[c.result]?.chapter === 4).length); })"
```
Expected: 12 Ch4 species, 7 discoverable, 5 combos, 5 recipes.

- [ ] **Step 6: Commit**

```bash
git add js/data/species.js
git commit -m "feat(ch4): add 12 Ch4 species with SVG and 5 combination recipes"
```

---

### Task 8: Ch4 Synergies

**Files:**
- Modify: `js/engine/symbiosis.js` — add 4 Ch4 synergy pairs

- [ ] **Step 1: Add Ch4 synergies**

```javascript
// Chapter 4 synergies
{ a: 'coralbloom', b: 'anemostinger', bonus: 0.12, desc: '+12% all generator output', type: 'generatorMult' },
{ a: 'tidalwyrm', b: 'phosphoreel', bonus: 0.08, desc: '+8% discovery chance', type: 'discoveryChance' },
{ a: 'brineshell', b: 'reefwarden', bonus: 0.10, desc: '+10% all generator output', type: 'generatorMult' },
{ a: 'abysswatcher', b: 'lichenveil', bonus: 0.15, desc: '+15% tap value', type: 'tapMult' },
```

- [ ] **Step 2: Verify synergies load**

```bash
node -e "import('/home/claude/idle-game/js/engine/symbiosis.js').then(m => { const state = { discoveredSpecies: ['coralbloom','anemostinger'] }; console.log('Active:', m.getActiveSynergies(state).length); console.log('Bonus:', m.getSymbiosisBonus(state, 'generatorMult')); })"
```

- [ ] **Step 3: Commit**

```bash
git add js/engine/symbiosis.js
git commit -m "feat(ch4): add 4 Ch4 synergy pairs"
```

---

### Task 9: Ch4 Narrative (Quotes & Chronicle)

**Files:**
- Modify: `js/data/narrative.js` — add ch4Early, ch4Mid, ch4Late quote pools
- Modify: `js/engine/progress.js` — add Ch4 chronicle entries

- [ ] **Step 1: Add Ch4 quote pools to narrative.js**

```javascript
// Chapter 4 quotes
ch4Early: [
  "Water everywhere. But this water is alive.",
  "The reef is building itself around me. I'm becoming furniture.",
  "Something with tentacles just waved at me. I waved back.",
  "The coral glows at night. It's the most beautiful thing I've seen in any loop.",
  "I used to be afraid of deep water. Now I live in it.",
  "The current carries information. I can almost read it.",
  "A fish made of light just swam through a wall. Normal.",
  "Everything down here is connected by water. The ultimate network.",
],
ch4Mid: [
  "The reef has moods. Today it's... contemplative.",
  "I built a chain reaction. Three generators, all feeding each other. Beautiful.",
  "An invasive species showed up. The reef is not happy. Neither am I.",
  "The tidal forge works with the ocean, not against it. I'm learning that lesson.",
  "Coral Essence tastes like memories. Not mine. Older.",
  "The synergy chains are singing. I can hear harmony in the production numbers.",
],
ch4Late: [
  "The storm reaches the reef. Even underwater, there's no shelter.",
  "The coral holds on. It's been holding on for longer than I've been looping.",
  "If the ground crumbles, the reef stands. Water finds a way.",
  "I built something beautiful down here. The catastrophe can't take that.",
],
```

- [ ] **Step 2: Add Ch4 chronicle entries to progress.js**

In `addChronicleEntry`, add to ENTRIES:
```javascript
chapter4Complete: "The reef remembers everything. Every current, every creature, every loop. It's been recording.",
firstInvasive: "Something uninvited arrived. Red-tinged and hungry. The reef shuddered.",
firstChain: "Three generators locked into sync. I felt the whole reef vibrate. Is this what harmony sounds like?",
coralReflection: "The reef isn't just alive. It's aware. I'm building something that knows I'm here.",
manualLoop: "I chose to end the loop. For the first time, I chose. The fog came because I called it.",
```

- [ ] **Step 3: Commit**

```bash
git add js/data/narrative.js js/engine/progress.js
git commit -m "feat(ch4): add Ch4 narrative quotes and chronicle entries"
```

---

### Task 10: Ch4 Objectives & Achievements

**Files:**
- Modify: `js/engine/progress.js` — add Ch4 objectives (5) and achievements (~12)

- [ ] **Step 1: Add Ch4 objectives to CHAPTER_OBJECTIVES**

```javascript
4: [
  { id: 'ch4_discover4', desc: 'Discover 4 Chapter 4 species', check: s => {
    const ch4Species = ['coralbloom','anemostinger','tidalwyrm','brineshell','phosphoreel','reefwarden','abysswatcher'];
    return s.discoveredSpecies.filter(id => ch4Species.includes(id)).length >= 4;
  }},
  { id: 'ch4_chain', desc: 'Activate a synergy chain', check: s =>
    (s.synergyChainsDiscovered || []).length >= 1
  },
  { id: 'ch4_earn50m', desc: 'Earn 50,000,000 TR in a single loop', check: s => s.trEarnedThisLoop >= 50000000 },
  { id: 'ch4_gens', desc: 'Own 3 of each Ch4 generator', check: s =>
    ['coralWeave', 'reefEngine', 'tidalForge'].every(g => (s.generators[g] || 0) >= 3)
  },
  { id: 'ch4_combo', desc: 'Create a Ch4 combination species', check: s => {
    const ch4Combos = ['coralspore', 'glowcoral', 'tidalmoss', 'brineworm', 'reefgarden'];
    return (s.combinationsFound || []).some(id => ch4Combos.includes(id));
  }},
],
```

- [ ] **Step 2: Add Ch4 achievements to getAchievementDefs()**

```javascript
// Discovery - Ch4
{ id: 'fullReef', name: 'Full Reef', desc: 'Discover all Ch4 discoverable species', category: 'discovery', check: s => ['coralbloom','anemostinger','tidalwyrm','brineshell','phosphoreel','reefwarden','abysswatcher'].every(id => s.discoveredSpecies.includes(id)) },
{ id: 'species30', name: 'Master Naturalist', desc: 'Discover 30 species', category: 'discovery', check: s => s.discoveredSpecies.length >= 30 },
{ id: 'combo10', name: 'Combination Artisan', desc: 'Create 10 combinations', category: 'discovery', check: s => (s.combinationsFound || []).length >= 10 },

// Economy - Ch4
{ id: 'tr10mLoop', name: 'Eight Figures', desc: 'Earn 10,000,000 TR in one loop', category: 'economy', check: s => s.trEarnedThisLoop >= 10000000 },
{ id: 'tr50mLoop', name: 'Nine Figures', desc: 'Earn 50,000,000 TR in one loop', category: 'economy', check: s => s.trEarnedThisLoop >= 50000000 },
{ id: 'em5000', name: 'Echo Vault', desc: 'Hold 5,000 Echo Matter', category: 'economy', check: s => s.echoMatter >= 5000 },
{ id: 'coralEssence50', name: 'Reef Builder', desc: 'Accumulate 50 Coral Essence', category: 'economy', check: s => (s.coralEssence || 0) >= 50 },

// Synergy Chains
{ id: 'firstChain', name: 'Chain Reaction', desc: 'Discover your first synergy chain', category: 'secret', check: s => (s.synergyChainsDiscovered || []).length >= 1 },
{ id: 'chains3', name: 'Chain Master', desc: 'Discover 3 synergy chains', category: 'secret', check: s => (s.synergyChainsDiscovered || []).length >= 3 },

// Invasive
{ id: 'survivedInvasive', name: 'Pest Control', desc: 'Remove an invasive species', category: 'tapping', check: s => (s.totalInvasivesRemoved || 0) >= 1 },

// Chapter
{ id: 'ch4Complete', name: 'Reef Lord', desc: 'Complete Chapter 4', category: 'chapter', check: s => s.chapter >= 5 },
```

- [ ] **Step 3: Commit**

```bash
git add js/engine/progress.js
git commit -m "feat(ch4): add Ch4 objectives and achievements"
```

---

### Task 11: Economy Integration

**Files:**
- Modify: `js/engine/economy.js` — integrate synergy chains, invasive drain, erosion debuff, Coral Essence production

- [ ] **Step 1: Add imports**

```javascript
import { getSynergyChainBonus } from './synergy-chains.js';
import { getInvasiveDrain } from './invasive.js';
```

- [ ] **Step 2: Integrate synergy chain per-generator bonus in getTotalProduction()**

Inside the generator loop, after the Flow Boost check:
```javascript
// Synergy chain bonus (Ch4+)
const chainBonus = getSynergyChainBonus(state, genId);
if (chainBonus > 0) genOutput *= (1 + chainBonus);
```

- [ ] **Step 3: Apply erosion debuff**

After all multipliers, before returning total:
```javascript
// Erosion debuff (halves production per stack)
const erosionStacks = state.erosionStacks || 0;
if (erosionStacks > 0) total *= Math.pow(0.5, erosionStacks);
```

- [ ] **Step 4: Apply invasive drain**

After erosion debuff:
```javascript
// Invasive species drain
const invasiveDrain = getInvasiveDrain(state);
if (invasiveDrain > 0) total *= (1 - invasiveDrain);
```

- [ ] **Step 5: Apply predatorBoost buff**

In the buff loop:
```javascript
if (buff.id === 'predatorBoost') total *= 3;
```

- [ ] **Step 6: Add Coral Essence production function**

```javascript
export function getCoralProduction(state) {
  let coral = 0;
  for (const [genId, count] of Object.entries(state.generators)) {
    const gen = GENERATORS[genId];
    if (!gen || !gen.coralOutput || count <= 0) continue;
    coral += gen.coralOutput * count;
  }
  return coral;
}
```

- [ ] **Step 7: Add economy integration tests**

Add to `tests/engine/economy.test.js`:
```javascript
describe('Ch4 economy integration', () => {
  it('erosion stacks reduce production', () => {
    const state = { generators: { mossPatch: 5 }, multipliers: {}, activeBuffs: [], erosionStacks: 1, discoveredSpecies: [] };
    const normal = getTotalProduction({ ...state, erosionStacks: 0 });
    const eroded = getTotalProduction(state);
    assert.ok(eroded < normal);
    assert.ok(Math.abs(eroded - normal * 0.5) < 1); // Halved by 1 stack
  });

  it('invasive species drains production', () => {
    const state = { generators: { mossPatch: 5 }, multipliers: {}, activeBuffs: [], erosionStacks: 0, discoveredSpecies: [], invasiveSpecies: { drainPct: 0.20, age: 0 } };
    const normal = getTotalProduction({ ...state, invasiveSpecies: null });
    const drained = getTotalProduction(state);
    assert.ok(drained < normal);
  });

  it('getCoralProduction returns coral from Ch4 generators', () => {
    const state = { generators: { coralWeave: 3 } };
    const coral = getCoralProduction(state);
    assert.ok(coral > 0);
  });
});
```

- [ ] **Step 8: Run all tests**

```bash
node --test tests/engine/*.test.js
```

- [ ] **Step 9: Commit**

```bash
git add js/engine/economy.js tests/engine/economy.test.js
git commit -m "feat(ch4): integrate synergy chains, erosion, invasive drain into economy"
```

---

### Task 12: Ch4 Biome Visuals

**Files:**
- Modify: `js/ui/biome.js` — add Ch4 underwater reef biome branch

- [ ] **Step 1: Add Ch4 biome rendering**

Insert before the Ch3 branch (state.chapter >= 3):
```javascript
if (state.chapter >= 4) {
  // Ch4: The Coral Epoch — underwater reef, bioluminescence
  defs.innerHTML = `
    <radialGradient id="bg-glow" cx="50%" cy="60%" r="60%">
      <stop offset="0%" stop-color="#081828"/>
      <stop offset="100%" stop-color="#040810"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
}
```

Add Ch4 environment elements (before the Ch3 else-if):
```javascript
if (state.chapter >= 4) {
  // Coral formations on ground
  for (let i = 0; i < 6; i++) {
    const cx = w * (0.1 + i * 0.15);
    const cy = h * (0.75 + Math.sin(i * 2.3) * 0.06);
    // Branching coral
    for (let b = 0; b < 3; b++) {
      const bx = cx + (b - 1) * 8;
      const bh = 10 + (i + b) % 4 * 5;
      const branch = createSVG('line', {
        x1: bx, y1: cy, x2: bx + (b - 1) * 4, y2: cy - bh,
        stroke: `rgba(255, 112, 144, ${0.15 + i * 0.02})`,
        'stroke-width': 2, 'stroke-linecap': 'round',
      });
      svgEl.appendChild(branch);
    }
  }
  // Water ripple lines
  for (let i = 0; i < 4; i++) {
    const ry = h * (0.1 + i * 0.2);
    const ripple = createSVG('path', {
      d: `M0,${ry} Q${w*0.25},${ry - 3} ${w*0.5},${ry} Q${w*0.75},${ry + 3} ${w},${ry}`,
      stroke: 'rgba(64, 176, 255, 0.06)', 'stroke-width': 1, fill: 'none',
    });
    svgEl.appendChild(ripple);
  }
  // Bioluminescent bubbles
  for (let i = 0; i < 16; i++) {
    const bx = (i / 16) * w + Math.sin(i * 2.1) * 15;
    const by = h * 0.2 + (i / 16) * h * 0.6 + Math.cos(i * 1.7) * 20;
    const dot = createSVG('circle', {
      cx: bx, cy: by, r: 0.8 + (i % 3) * 0.5,
      fill: `rgba(96, 255, 160, 0.06)`,
    });
    const anim = createSVG('animateTransform', {
      attributeName: 'transform', type: 'translate',
      values: `0,0;${Math.sin(i)*2},${-3-i%4*2};0,0`,
      dur: `${5+i%4}s`, repeatCount: 'indefinite',
    });
    dot.appendChild(anim);
    svgEl.appendChild(dot);
  }
  // Anemone clusters
  for (let i = 0; i < 3; i++) {
    const ax = w * (0.25 + i * 0.25);
    const ay = h * (0.8 + Math.sin(i * 1.5) * 0.05);
    for (let t = 0; t < 5; t++) {
      const angle = (t / 5) * Math.PI - Math.PI / 2;
      const tendril = createSVG('line', {
        x1: ax, y1: ay,
        x2: ax + Math.cos(angle) * 12, y2: ay + Math.sin(angle) * 12 - 5,
        stroke: `rgba(208, 96, 255, ${0.1 + t * 0.02})`,
        'stroke-width': 1.5, 'stroke-linecap': 'round',
      });
      svgEl.appendChild(tendril);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/biome.js
git commit -m "feat(ch4): add underwater reef biome visuals"
```

---

### Task 13: UI Integration

**Files:**
- Modify: `index.html` — add Coral Essence counter, invasive alert bar, manual loop button, synergy chains section
- Modify: `css/game.css` — styles for Ch4 UI elements
- Modify: `js/main.js` — imports, render functions, event handlers, game loop ticks
- Modify: `js/ui/renderer.js` — Erosion catastrophe labels/tint

This is the largest task. Follow the same pattern as Phase 3 Task 13.

- [ ] **Step 1: HTML changes to index.html**

Add Coral Essence counter in resource bar (after res-threads):
```html
<div class="resource" id="res-coral" style="display:none;"><span class="res-icon">&#9672;</span> <span id="coral-count">0</span></div>
```

Add invasive alert bar (after intervention-bar):
```html
<div id="invasive-bar" style="display:none;"></div>
```

Add manual loop button to biome panel (before catastrophe-bar):
```html
<button id="manual-loop-btn" style="display:none;">Trigger Loop</button>
```

Add synergy chains section to codex (after codex-mycelium):
```html
<div id="codex-chains" style="display:none;"><h3>Synergy Chains</h3><div id="chains-list"></div></div>
```

- [ ] **Step 2: CSS styles**

Add to `css/game.css`:
```css
/* Invasive alert bar */
#invasive-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  background: rgba(255, 50, 50, 0.1);
  border-bottom: 1px solid rgba(255, 50, 50, 0.3);
  font-size: 0.75rem;
  color: var(--coral);
  flex-shrink: 0;
}
.invasive-name { font-weight: bold; }
.invasive-drain { color: var(--danger); }

/* Manual loop button */
#manual-loop-btn {
  display: block;
  margin: 4px auto;
  padding: 4px 16px;
  background: var(--surface);
  border: 1px solid var(--coral);
  color: var(--coral);
  border-radius: 4px;
  font-family: var(--font);
  font-size: 0.7rem;
  cursor: pointer;
  flex-shrink: 0;
}
#manual-loop-btn:hover { background: rgba(240,96,128,0.1); }

/* Synergy chain rows */
.chain-row {
  padding: 6px 8px;
  margin: 2px 0;
  font-size: 0.8rem;
  background: rgba(240,200,96,0.06);
  border-radius: 4px;
  border-left: 2px solid var(--amber);
}
.chain-name { color: var(--amber); font-weight: bold; }
.chain-desc { font-size: 0.7rem; color: var(--text-dim); }
.chain-row.inactive { opacity: 0.3; border-left-color: var(--text-dim); }

/* Coral Essence resource */
#res-coral .res-icon { color: #ff7090; }
#coral-count { color: #ff7090; font-weight: bold; }

/* Erosion tint */
#catastrophe-tint.erosion-warning {
  opacity: 1;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(160, 128, 96, 0.06) 100%);
}
#catastrophe-tint.erosion-critical {
  opacity: 1;
  background: radial-gradient(ellipse at center, transparent 20%, rgba(160, 128, 96, 0.12) 100%);
  animation: tint-pulse 2s ease-in-out infinite;
}

/* Erosion stack indicator */
.erosion-indicator {
  font-size: 0.65rem;
  color: #a08060;
  padding: 2px 8px;
  background: rgba(160,128,96,0.1);
  border-radius: 10px;
  border: 1px solid rgba(160,128,96,0.3);
}
```

- [ ] **Step 3: main.js — add imports**

```javascript
import { SYNERGY_CHAINS, getActiveChains, getSynergyChainBonus, checkNewChains } from './engine/synergy-chains.js';
import { shouldSpawnInvasive, spawnInvasive, tickInvasive, removeInvasive, getInvasiveDrain } from './engine/invasive.js';
import { getCoralProduction } from './engine/economy.js';
```

- [ ] **Step 4: main.js — add game loop ticks**

In the gameLoop, after thread production tick:
```javascript
// Coral Essence production tick (Ch4+)
if (state.chapter >= 4) {
  const coralProd = getCoralProduction(state);
  if (coralProd > 0) {
    state.coralEssence = (state.coralEssence || 0) + coralProd * dt;
  }
}

// Invasive species tick (Ch4+)
if (state.chapter >= 4) {
  tickInvasive(state, dt);
}
```

In the progress checks section (every 2 seconds), add synergy chain discovery:
```javascript
// Synergy chain discovery (Ch4+)
if (state.chapter >= 4) {
  const newChains = checkNewChains(state);
  for (const chain of newChains) {
    showToast(`Chain: ${chain.name}!`, 'achievement');
    addChronicleEntry(state, 'firstChain');
  }
}
```

- [ ] **Step 5: main.js — invasive spawn on loop start**

In the init function, after offline progress handling:
```javascript
// Spawn invasive (Ch4+, 30% chance per loop)
if (state.chapter >= 4 && !state.invasiveSpecies && !state.invasiveCarryover) {
  if (shouldSpawnInvasive(state)) {
    spawnInvasive(state);
    showToast(`Invasive: ${state.invasiveSpecies.name} appeared!`, 'warning');
    addChronicleEntry(state, 'firstInvasive');
  }
}
```

Also in the post-catastrophe callback (after resetLoop):
```javascript
// Spawn invasive for new loop
if (state.chapter >= 4 && !state.invasiveSpecies) {
  if (shouldSpawnInvasive(state)) {
    spawnInvasive(state);
  }
}
```

- [ ] **Step 6: main.js — render functions**

Add `updateInvasiveBar()`, `renderSynergyChains()`, `updateCoralCounter()`, `updateManualLoopButton()`:

```javascript
function updateInvasiveBar() {
  const bar = document.getElementById('invasive-bar');
  if (!bar) return;
  if (state.chapter < 4 || !state.invasiveSpecies) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  const inv = state.invasiveSpecies;
  bar.innerHTML = `
    <span><span class="invasive-name">${inv.name}</span> draining <span class="invasive-drain">${Math.round(inv.drainPct * 100)}%</span> production</span>
  `;
}

function renderSynergyChains() {
  const section = document.getElementById('codex-chains');
  const list = document.getElementById('chains-list');
  if (!section || !list) return;
  if (state.chapter < 4) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = '';

  for (const chain of SYNERGY_CHAINS) {
    if (chain.chapter > state.chapter) continue;
    const isActive = chain.generators.every(g => (state.generators[g] || 0) >= 10);
    const isDiscovered = state.synergyChainsDiscovered.includes(chain.id);
    const row = document.createElement('div');
    row.className = `chain-row${isActive ? '' : ' inactive'}`;
    if (isDiscovered) {
      row.innerHTML = `<div class="chain-name">${chain.name}</div><div class="chain-desc">${chain.desc}</div>`;
    } else {
      row.innerHTML = `<div class="chain-name">???</div><div class="chain-desc">Reach generator thresholds to discover...</div>`;
    }
    list.appendChild(row);
  }
}

function updateCoralCounter() {
  const coralRes = document.getElementById('res-coral');
  const coralCount = document.getElementById('coral-count');
  if (!coralRes) return;
  if (state.chapter >= 4) {
    coralRes.style.display = '';
    if (coralCount) coralCount.textContent = Math.floor(state.coralEssence || 0);
  } else {
    coralRes.style.display = 'none';
  }
}

function updateManualLoopButton() {
  const btn = document.getElementById('manual-loop-btn');
  if (!btn) return;
  const canManual = state.chapter >= 4 && (state.permanentUpgrades.loopDejaVu || 0) >= 1;
  btn.style.display = canManual ? '' : 'none';
}
```

- [ ] **Step 7: main.js — manual loop button handler in setupEventListeners**

```javascript
const manualLoopBtn = document.getElementById('manual-loop-btn');
if (manualLoopBtn) {
  manualLoopBtn.addEventListener('pointerup', () => {
    if (state.chapter >= 4 && (state.permanentUpgrades.loopDejaVu || 0) >= 1) {
      addChronicleEntry(state, 'manualLoop');
      triggerCatastrophe();
    }
  });
}
```

- [ ] **Step 8: Wire into updateAllUI and renderCodex**

In `updateAllUI()`:
```javascript
updateInvasiveBar();
updateCoralCounter();
updateManualLoopButton();
```

In `renderCodex()`, at the end:
```javascript
renderSynergyChains();
```

In the game loop render section:
```javascript
updateCoralCounter();
if (state.chapter >= 4) updateInvasiveBar();
```

- [ ] **Step 9: Update getRandomQuote for Ch4**

```javascript
if (state.chapter >= 4) {
  if (progress < 0.5) pool = QUOTES.ch4Early || QUOTES.early;
  else if (progress < 0.8) pool = QUOTES.ch4Mid || QUOTES.midLoop;
  else pool = QUOTES.ch4Late || QUOTES.lateLoop;
} else if (state.chapter >= 3) {
```

- [ ] **Step 10: Update renderer.js for Erosion catastrophe**

In `updateCatastropheBar()`, extend the `isStorm` logic:
```javascript
const isStorm = (state.catastropheType === 'storm' && state.chapter >= 3);
const isErosion = (state.catastropheType === 'erosion' && state.chapter >= 4);

if (label) {
  if (phase === 'calm') label.textContent = '';
  else if (phase === 'building') {
    label.textContent = isErosion ? 'The ground trembles...' : isStorm ? 'Static builds...' : 'The fog stirs...';
  }
  else if (phase === 'warning') {
    label.textContent = isErosion ? 'EROSION APPROACHING' : isStorm ? 'STORM APPROACHING' : 'FOG APPROACHING';
  }
  else label.textContent = 'CATASTROPHE IMMINENT';
}

// Tint
if (tint) {
  tint.className = '';
  if (isErosion) {
    if (phase === 'warning') tint.className = 'erosion-warning';
    else if (phase === 'critical') tint.className = 'erosion-critical';
  } else if (isStorm) {
    // ... existing storm tint
  } else {
    // ... existing fog tint
  }
}
```

Add erosion stack display in resource bar or buff bar:
```javascript
// Show erosion stacks as a buff pill
if ((state.erosionStacks || 0) > 0) {
  const erosionPill = `<span class="erosion-indicator">Erosion ×${state.erosionStacks}</span>`;
  // Append to buff bar display
}
```

- [ ] **Step 11: Update stats for Ch4**

In renderStats(), add Ch4 stats:
```javascript
if (state.chapter >= 4) {
  statsHtml += `<br>Coral Essence: <span>${Math.floor(state.coralEssence || 0)}</span>`;
  statsHtml += `<br>Synergy Chains: <span>${(state.synergyChainsDiscovered || []).length}</span>`;
  if (state.erosionStacks > 0) {
    statsHtml += `<br>Erosion Stacks: <span style="color:var(--coral)">${state.erosionStacks}</span>`;
  }
}
```

- [ ] **Step 12: Commit**

```bash
git add index.html css/game.css js/main.js js/ui/renderer.js
git commit -m "feat(ch4): full UI integration for Ch4 systems"
```

---

### Task 14: Full Test Suite & Verification

**Files:**
- All test files

- [ ] **Step 1: Run all engine tests**

```bash
node --test tests/engine/*.test.js
```
Expected: All tests pass (131 existing + ~25 new ≈ 156+).

- [ ] **Step 2: Syntax-check all modified JS files**

```bash
node --check js/main.js && node --check js/engine/economy.js && node --check js/engine/synergy-chains.js && node --check js/engine/invasive.js && node --check js/ui/biome.js && node --check js/ui/renderer.js && node --check js/ui/overlays.js
```
Expected: No output (no errors).

- [ ] **Step 3: Verify all module imports resolve**

```bash
node -e "Promise.all([
  import('./js/engine/synergy-chains.js'),
  import('./js/engine/invasive.js'),
  import('./js/engine/economy.js'),
  import('./js/data/species.js'),
  import('./js/data/generators.js'),
]).then(() => console.log('All OK')).catch(e => console.error(e))"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: implement Phase 4 — Chapter 4 'The Coral Epoch'"
```

---

## Summary of Ch4 New Systems

| System | Engine File | Data File | Tests |
|--------|-----------|-----------|-------|
| Synergy Chains | `synergy-chains.js` | (inline in engine) | `synergy-chains.test.js` |
| Invasive Species | `invasive.js` | (inline in engine) | `invasive.test.js` |
| Erosion Catastrophe | `catastrophe.js` (extend) | — | `catastrophe.test.js` (extend) |
| Manual Loop Trigger | `state.js` (check) | `upgrades.js` (Loop Déjà Vu) | `state.test.js` (extend) |
| Coral Essence | `economy.js` (extend) | `generators.js` (coralOutput) | existing economy tests |
| Ch4 Interventions | `interventions.js` (extend) | — | `interventions.test.js` (extend) |
| Ch4 Species (12) | — | `species.js` (extend) | — |
| Ch4 Generators (3) | — | `generators.js` (extend) | — |
| Ch4 Synergies (4) | `symbiosis.js` (extend) | — | — |
| Ch4 Biome Visuals | `biome.js` (extend) | — | — |
| Ch4 Narrative | — | `narrative.js` (extend) | — |
| Ch4 Objectives (5) | `progress.js` (extend) | — | — |
| Ch4 Achievements (12) | `progress.js` (extend) | — | — |
