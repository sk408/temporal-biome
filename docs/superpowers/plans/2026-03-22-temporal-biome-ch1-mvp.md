# Temporal Biome — Chapter 1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable Chapter 1 idle game with the complete core loop: tap to collect, buy generators, discover species, survive catastrophes, earn Echo Matter, buy permanent upgrades, progress toward chapter objectives.

**Architecture:** Multi-file vanilla JS using ES modules (`<script type="module">`). Pure logic modules (no DOM) in `js/engine/`, data definitions in `js/data/`, UI/rendering in `js/ui/`. Logic modules are testable in Node.js. Game state is a single object serialized to localStorage.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), SVG (procedural), Canvas (particles only), no external dependencies.

**Spec:** `docs/superpowers/specs/2026-03-22-temporal-biome-design.md`

**Live URL:** `https://claude.stevesinfo.com/idle-game/` (served via nginx on the VPS)

---

## File Structure

```
temporal-biome/
├── index.html                  # HTML skeleton, loads main.js as module
├── css/
│   └── game.css                # All styles (dark theme, glows, animations, mobile)
├── js/
│   ├── data/
│   │   ├── generators.js       # Ch1 generator definitions (5 generators)
│   │   ├── species.js          # Ch1 species definitions + SVG factory functions
│   │   ├── upgrades.js         # Multipliers, automation, permanent upgrade definitions
│   │   ├── achievements.js     # Ch1 achievement definitions (~30)
│   │   └── narrative.js        # Protagonist quotes, chronicle entries, chapter config
│   ├── engine/
│   │   ├── state.js            # Game state object, save/load, loop reset, offline calc
│   │   ├── economy.js          # Cost scaling, production calc, purchase logic, EM formula
│   │   ├── discovery.js        # Species discovery checks, combination logic, hints
│   │   ├── anomalies.js        # Anomaly spawning, types, chains, bursts, rewards
│   │   ├── catastrophe.js      # Catastrophe timer, fog wipe, loop reset orchestration
│   │   ├── progress.js         # Chapter objectives check, achievement check, chronicle triggers
│   │   └── utils.js            # Shared utilities (formatNum)
│   ├── ui/
│   │   ├── renderer.js         # DOM update batching, panel switching, resource display
│   │   ├── biome.js            # SVG biome background, creature placement, ambient animation
│   │   ├── particles.js        # Canvas particle system (tap burst, ambient spores)
│   │   ├── shop.js             # Generator/upgrade buy buttons, marketplace UI
│   │   ├── overlays.js         # Discovery popup, catastrophe animation, loop summary, chapter header
│   │   └── notifications.js    # Toast notification system
│   └── main.js                 # Init, game loop (rAF), wire modules together
└── tests/
    └── engine/
        ├── economy.test.js     # Cost scaling, production, EM formula tests
        ├── state.test.js       # Save/load, reset, offline progress tests
        ├── discovery.test.js   # Discovery check, combination logic tests
        ├── anomalies.test.js   # Anomaly spawn timing, chain logic tests
        ├── catastrophe.test.js # Timer, reset rules tests
        └── progress.test.js    # Objective check, achievement check tests
```

**Responsibilities per file:**
- `state.js` — Owns the canonical game state object. Exports `createState()`, `save()`, `load()`, `resetLoop()`, `calcOfflineProgress()`. No DOM access.
- `economy.js` — Pure math. Exports `getCost(baseCost, owned, scaling)`, `getTotalProduction(state)`, `canAfford(state, cost)`, `purchase(state, type, id)`, `calcEchoMatter(state)`. No DOM access.
- `discovery.js` — Exports `runDiscoveryCheck(state)`, `tryCombination(state, speciesA, speciesB)`, `getHint(speciesA, speciesB)`. No DOM access.
- `anomalies.js` — Exports `spawnAnomaly(state)`, `shouldBurst(state, elapsed)`, `tapAnomaly(state, anomaly)`, `updateChain(state, now)`. No DOM access.
- `catastrophe.js` — Exports `tickCatastrophe(state, dt)`, `triggerCatastrophe(state)`, `getCatastrophePhase(state)`. No DOM access.
- `progress.js` — Exports `checkObjectives(state)`, `checkAchievements(state)`, `addChronicleEntry(state, trigger)`. No DOM access.
- `renderer.js` — Reads state, updates DOM elements. Owns `updateUI(state)`, `switchPanel(panelId)`.
- `biome.js` — SVG generation. Owns `renderBiome(state, svgElement)`, `addCreature(species, svgElement)`.
- `particles.js` — Canvas. Owns `initParticles(canvas)`, `spawnBurst(x, y, color)`, `tick(dt)`, `draw()`.
- `shop.js` — DOM for buy buttons. Owns `renderGenerators(state)`, `renderMultipliers(state)`, `renderMarketplace(state)`.
- `overlays.js` — Full-screen overlays. Owns `showDiscovery(species)`, `showCatastrophe()`, `showLoopSummary(stats)`.
- `notifications.js` — Toast queue. Owns `showToast(text, type)`, `tickToasts()`.
- `main.js` — Imports everything, runs init, owns the `requestAnimationFrame` loop.

---

## Task 1: Project Scaffold + HTML Skeleton

**Files:**
- Create: `index.html`
- Create: `css/game.css`
- Create: `js/main.js`

- [ ] **Step 1: Create index.html with complete HTML structure**

All the DOM elements the game needs, organized by section. No JS logic yet.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0">
<title>Temporal Biome</title>
<link rel="stylesheet" href="css/game.css">
</head>
<body>
<div id="game">
  <!-- Chapter Header -->
  <header id="chapter-header">
    <div id="chapter-label">Chapter <span id="chapter-num">1</span></div>
    <div id="chapter-title">Primordial Soup</div>
    <div id="chapter-subtitle">"Why do I keep waking up here?"</div>
  </header>

  <!-- Resource Bar -->
  <div id="resource-bar">
    <div class="resource" id="res-tr"><span class="res-icon">&#9679;</span> <span id="tr-count">0</span></div>
    <div class="resource" id="res-em"><span class="res-icon">&#9670;</span> <span id="em-count">0</span></div>
    <div class="resource" id="res-loop">Loop <span id="loop-count">0</span></div>
  </div>

  <!-- Biome View (default panel) -->
  <div id="panel-biome" class="panel active">
    <div id="biome-container">
      <svg id="biome-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      <canvas id="particle-canvas"></canvas>
      <div id="quote-bar"></div>
    </div>
    <!-- Catastrophe Bar -->
    <div id="catastrophe-bar">
      <div id="catastrophe-fill"></div>
      <div id="catastrophe-label"></div>
    </div>
    <!-- Chapter Objectives -->
    <div id="objectives">
      <div id="objectives-title">Chapter Objectives</div>
      <div id="objectives-list"></div>
    </div>
  </div>

  <!-- Upgrades Panel -->
  <div id="panel-upgrades" class="panel">
    <div class="panel-scroll">
      <div id="generators-section"><h3>Generators</h3><div id="generators-list"></div></div>
      <div id="multipliers-section"><h3>Multipliers</h3><div id="multipliers-list"></div></div>
      <div id="automation-section"><h3>Automation</h3><div id="automation-list"></div></div>
      <div id="permanent-section"><h3>Permanent (Echo Matter)</h3><div id="permanent-list"></div></div>
    </div>
  </div>

  <!-- Codex Panel -->
  <div id="panel-codex" class="panel">
    <div class="panel-scroll">
      <div id="codex-species"><h3>Species</h3><div id="species-grid"></div></div>
      <div id="codex-combine"><h3>Combine</h3>
        <div id="combine-slots"><div id="slot-a" class="combine-slot">?</div><span>+</span><div id="slot-b" class="combine-slot">?</div></div>
        <button id="combine-btn" disabled>Combine</button>
        <div id="combine-result"></div>
      </div>
      <div id="codex-chronicle"><h3>Chronicle</h3><div id="chronicle-list"></div></div>
    </div>
  </div>

  <!-- Market Panel -->
  <div id="panel-market" class="panel">
    <div class="panel-scroll">
      <div id="market-permanent"><h3>Permanent Stock</h3><div id="market-permanent-list"></div></div>
      <div id="market-rotating"><h3>This Loop's Offerings</h3><div id="market-rotating-list"></div></div>
    </div>
  </div>

  <!-- Stats Panel -->
  <div id="panel-stats" class="panel">
    <div class="panel-scroll">
      <div id="stats-achievements"><h3>Achievements</h3><div id="achievements-list"></div></div>
      <div id="stats-summary"><h3>Stats</h3><div id="stats-detail"></div></div>
    </div>
  </div>

  <!-- Bottom Nav -->
  <nav id="bottom-nav">
    <button class="nav-btn active" data-panel="biome">Biome</button>
    <button class="nav-btn" data-panel="upgrades">Upgrades</button>
    <button class="nav-btn" data-panel="codex">Codex</button>
    <button class="nav-btn" data-panel="market">Market</button>
    <button class="nav-btn" data-panel="stats">Stats</button>
  </nav>
</div>

<!-- Overlays -->
<div id="discovery-overlay" class="overlay"></div>
<div id="catastrophe-overlay" class="overlay"></div>
<div id="loop-summary-overlay" class="overlay"></div>
<div id="toast-container"></div>

<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create css/game.css with the complete dark theme**

Mobile-first. Dark navy background, bioluminescent accents, glow effects, panel transitions, animations. Include all keyframe animations (pulse, float, breathe, fadeIn, shake, ripple). Bottom nav styling. Panel show/hide. Overlay styles. Toast styles. Generator/upgrade buy button styles. Species grid. Combine slots. The full CSS for the game — this is a large file but all visual styling lives here.

Key design tokens:
- `--bg: #0a0e1a`, `--surface: rgba(15, 20, 35, 0.9)`, `--border: rgba(122, 248, 212, 0.1)`
- `--accent: #7af8d4`, `--purple: #b088f0`, `--amber: #f0c860`, `--coral: #f06080`, `--danger: #ff5050`
- `--glow-accent: 0 0 12px rgba(122,248,212,0.5), 0 0 24px rgba(122,248,212,0.2)`
- Font: `'Georgia', 'Times New Roman', serif`
- All panels use `display: none` by default, `.active` shows them
- Overlays use `position: fixed; z-index: 100+; display: none`, `.visible` shows them
- Bottom nav fixed at bottom, safe-area-inset padding
- `.panel-scroll` uses `overflow-y: auto` with `-webkit-overflow-scrolling: touch`
- Buy buttons: dark surface with border, glow on hover/active, disabled state when can't afford
- Resource bar: sticky top, semi-transparent background

- [ ] **Step 3: Create js/main.js stub**

```javascript
// js/main.js — Entry point
console.log('Temporal Biome loading...');
```

- [ ] **Step 4: Verify in browser**

Open `https://claude.stevesinfo.com/idle-game/` (the old index.html) — we need to move the new game to the root. Move old prototypes into `prototypes/` and put the new `index.html` at root.

Run: Visit the URL, verify dark background, chapter header, bottom nav visible, no JS errors in console.

- [ ] **Step 5: Commit**

```bash
git add index.html css/game.css js/main.js
git commit -m "feat: project scaffold with HTML skeleton and dark theme CSS"
```

---

## Task 2: Game State Module

**Files:**
- Create: `js/engine/state.js`
- Create: `tests/engine/state.test.js`

- [ ] **Step 1: Write failing tests for state module**

```javascript
// tests/engine/state.test.js
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
    s.permanentUpgrades = { residualMemory: 2 }; // 2 levels = 2% of prev TR
    s.trEarnedThisLoop = 1000;
    resetLoop(s);
    assert.strictEqual(s.residue, 20); // 2% of 1000
  });
});

describe('calcOfflineProgressWithRate', () => {
  it('returns TR earned at 50% generator efficiency', () => {
    const s = createState();
    const productionPerSecond = 5; // 10 moss patches * 0.5/s
    const elapsedSeconds = 3600; // 1 hour
    const result = calcOfflineProgressWithRate(s, elapsedSeconds, productionPerSecond);
    assert.strictEqual(result.trEarned, Math.floor(5 * 3600 * 0.5)); // 9000
  });

  it('caps offline time at 8 hours', () => {
    const s = createState();
    const productionPerSecond = 5;
    const elapsedSeconds = 100000; // ~28 hours
    const result = calcOfflineProgressWithRate(s, elapsedSeconds, productionPerSecond);
    const cappedResult = calcOfflineProgressWithRate(s, 8 * 3600, productionPerSecond);
    assert.strictEqual(result.trEarned, cappedResult.trEarned);
  });

  it('uses 100% efficiency with Offline Beacon', () => {
    const s = createState();
    s.automation = { offlineBeacon: true };
    const result = calcOfflineProgressWithRate(s, 3600, 5);
    assert.strictEqual(result.trEarned, Math.floor(5 * 3600 * 1.0)); // 18000
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/claude/idle-game && node --test tests/engine/state.test.js`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement state.js**

```javascript
// js/engine/state.js
export function createState() {
  return {
    chapter: 1, loop: 0,
    residue: 0, echoMatter: 0, anomalyTokens: 0, memoryShards: 0,
    generators: {},
    unlockedGenerators: ['mossPatch', 'puddleFarm', 'sporeColony', 'rootCluster', 'primordialEngine'],
    multipliers: { sharpEyes: 0, ecosystemHarmony: 0, temporalSensitivity: 0, dejaVu: 0, speciesAffinity: 0 },
    automation: { harvester1: false, harvester2: false, harvester3: false, anomalyMagnet: false, offlineBeacon: false, discoveryDrone: false },
    permanentUpgrades: { residualMemory: 0, echoAmplifier: 0, speciesInstinct: 0, generatorBlueprint: 0, catastropheInsight: 0, chronicleExpansion: 0, marketConnections: 0 },
    discoveredSpecies: [], combinationsFound: [], speciesUpgrades: {},
    temporalTools: [],
    chapterObjectives: {},
    achievements: [], chronicleEntries: [],
    catastropheTimer: 0, activeBuffs: [],
    interventionCooldowns: {},
    invasiveSpecies: null, anomalyChain: 0, anomalyChainExpiry: 0,
    flowBoostTargets: [],
    trEarnedThisLoop: 0, speciesDiscoveredThisLoop: 0,
    objectivesCompletedThisLoop: 0, anomalyTokensEarnedThisLoop: 0,
    marketRotationSeed: 0, marketPurchasedThisLoop: [],
    lastSaveTime: Date.now(), totalPlayTime: 0, totalLoops: 0, totalTrEarned: 0,
    totalAnomaliesTapped: 0, totalSpeciesDiscovered: 0,
    activeAnomalies: [],
    dashboardMode: false,
  };
}

export function resetLoop(state) {
  // Calculate starting TR from Residual Memory
  const residualMemoryLevel = state.permanentUpgrades?.residualMemory || 0;
  const startingTr = Math.floor(state.trEarnedThisLoop * residualMemoryLevel * 0.01);

  // Calculate starting generators from Generator Blueprint
  const blueprintLevel = state.permanentUpgrades?.generatorBlueprint || 0;
  const startingGenLevel = blueprintLevel > 0 ? [0, 5, 10, 25][blueprintLevel] || 0 : 0;

  // Capture Déjà Vu level before resetting multipliers
  const dejaVuLevel = state.multipliers?.dejaVu || 0;

  state.loop += 1;
  state.totalLoops += 1;
  state.residue = startingTr;
  state.trEarnedThisLoop = 0;
  state.speciesDiscoveredThisLoop = 0;
  state.objectivesCompletedThisLoop = 0;
  state.anomalyTokensEarnedThisLoop = 0;

  // Reset all generator counts
  for (const key of Object.keys(state.generators)) {
    state.generators[key] = startingGenLevel;
  }

  // Reset multipliers
  for (const key of Object.keys(state.multipliers)) {
    state.multipliers[key] = 0;
  }

  // Reset automation
  for (const key of Object.keys(state.automation)) {
    state.automation[key] = false;
  }

  // Reset catastrophe + active state
  state.catastropheTimer = 0;
  state.activeBuffs = [];
  state.interventionCooldowns = {};
  state.invasiveSpecies = null;
  state.anomalyChain = 0;
  state.anomalyChainExpiry = 0;
  state.flowBoostTargets = [];
  state.activeAnomalies = [];
  state.marketPurchasedThisLoop = [];
  state.marketRotationSeed = Date.now();

  // Apply Déjà Vu flat starting TR bonus (captured before reset)
  if (dejaVuLevel > 0) {
    state.residue += dejaVuLevel * 50;
  }
}

export function save(state) {
  state.lastSaveTime = Date.now();
  try { localStorage.setItem('temporal_biome_save', JSON.stringify(state)); } catch (e) { /* quota exceeded */ }
}

export function load() {
  try {
    const raw = localStorage.getItem('temporal_biome_save');
    if (raw) {
      const saved = JSON.parse(raw);
      const defaults = createState();
      return { ...defaults, ...saved };
    }
  } catch (e) { /* corrupt save */ }
  return createState();
}

export function calcOfflineProgress(state, elapsedSeconds) {
  // Import generator data inline to avoid circular deps in this pure function
  // We receive production rate as a param instead
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const offlineEfficiency = state.automation?.offlineBeacon ? 1.0 : 0.5;

  // Calculate total production/s from generators
  // This needs generator definitions — we'll accept a productionRate param
  // For now, stub: caller passes in current production rate
  return { trEarned: 0, elapsed: capped };
}

// Overload: accepts precomputed production rate
export function calcOfflineProgressWithRate(state, elapsedSeconds, productionPerSecond) {
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const offlineEfficiency = state.automation?.offlineBeacon ? 1.0 : 0.5;
  const trEarned = Math.floor(productionPerSecond * capped * offlineEfficiency);
  return { trEarned, elapsed: capped };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/claude/idle-game && node --test tests/engine/state.test.js`
Expected: All tests PASS

Note: The `calcOfflineProgress` test needs adjustment since we refactored to accept production rate. Update test to use `calcOfflineProgressWithRate` and pass the production rate (5/s for 10 moss patches at 0.5/s each).

- [ ] **Step 5: Commit**

```bash
git add js/engine/state.js tests/engine/state.test.js
git commit -m "feat: game state module with save/load, loop reset, offline progress"
```

---

## Task 3: Economy Engine

**Files:**
- Create: `js/engine/economy.js`
- Create: `js/data/generators.js`
- Create: `js/data/upgrades.js`
- Create: `tests/engine/economy.test.js`

- [ ] **Step 1: Write failing tests for economy**

```javascript
// tests/engine/economy.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCost, getTotalProduction, canAfford, purchaseGenerator, calcEchoMatter } from '../../js/engine/economy.js';
import { createState } from '../../js/engine/state.js';

describe('getCost', () => {
  it('returns base cost at level 0', () => {
    assert.strictEqual(getCost(10, 0, 1.15), 10);
  });
  it('scales cost by multiplier per level', () => {
    const cost = getCost(10, 5, 1.15);
    assert.strictEqual(cost, Math.floor(10 * Math.pow(1.15, 5)));
  });
});

describe('getTotalProduction', () => {
  it('returns 0 with no generators', () => {
    const s = createState();
    assert.strictEqual(getTotalProduction(s), 0);
  });
  it('sums production from all owned generators', () => {
    const s = createState();
    s.generators = { mossPatch: 10 }; // 10 * 0.5 = 5/s
    const prod = getTotalProduction(s);
    assert.ok(prod > 0);
  });
  it('applies milestone bonuses at 10 owned', () => {
    const s = createState();
    s.generators = { mossPatch: 10 }; // milestone: +100%
    const prod = getTotalProduction(s);
    assert.strictEqual(prod, 10); // 10 * 0.5 * 2 (100% bonus)
  });
});

describe('purchaseGenerator', () => {
  it('deducts cost and increments count', () => {
    const s = createState();
    s.residue = 100;
    const result = purchaseGenerator(s, 'mossPatch');
    assert.ok(result);
    assert.strictEqual(s.generators.mossPatch, 1);
    assert.strictEqual(s.residue, 90); // 100 - 10 base cost
  });
  it('returns false if cannot afford', () => {
    const s = createState();
    s.residue = 5;
    const result = purchaseGenerator(s, 'mossPatch');
    assert.ok(!result);
    assert.strictEqual(s.generators.mossPatch || 0, 0);
  });
});

describe('calcEchoMatter', () => {
  it('returns EM based on spec formula', () => {
    const s = createState();
    s.trEarnedThisLoop = 5000;
    s.speciesDiscoveredThisLoop = 2;
    s.objectivesCompletedThisLoop = 1;
    s.anomalyTokensEarnedThisLoop = 3;
    s.chapter = 1;
    const em = calcEchoMatter(s);
    // base_em = floor(5000/500) + 2*10 + 1*25 + 3*2 = 10 + 20 + 25 + 6 = 61
    // chapter_mult = 1 * 1.5 = 1.5
    // final = floor(61 * 1.5) = 91
    assert.strictEqual(em, 91);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/engine/economy.test.js`
Expected: FAIL

- [ ] **Step 3: Create generator definitions**

```javascript
// js/data/generators.js
export const GENERATORS = {
  mossPatch: {
    id: 'mossPatch', name: 'Moss Patch', chapter: 1,
    baseCost: 10, costScaling: 1.15, baseOutput: 0.5,
    flavor: "It grows. That's... something.",
  },
  puddleFarm: {
    id: 'puddleFarm', name: 'Puddle Farm', chapter: 1,
    baseCost: 50, costScaling: 1.15, baseOutput: 2,
    flavor: "I'm farming puddles now. This is my life.",
  },
  sporeColony: {
    id: 'sporeColony', name: 'Spore Colony', chapter: 1,
    baseCost: 250, costScaling: 1.15, baseOutput: 8,
    flavor: "They float upward. I try not to breathe.",
  },
  rootCluster: {
    id: 'rootCluster', name: 'Root Cluster', chapter: 1,
    baseCost: 1000, costScaling: 1.15, baseOutput: 30,
    flavor: "The roots hum. I don't want to know why.",
  },
  primordialEngine: {
    id: 'primordialEngine', name: 'Primordial Engine', chapter: 1,
    baseCost: 5000, costScaling: 1.15, baseOutput: 120,
    flavor: "I built this? I BUILT this??",
  },
};

// Milestone bonuses: quantity -> multiplier applied to that generator
export const MILESTONES = [
  { qty: 10, bonus: 1.0, label: '+100% output' },      // 2x
  { qty: 25, bonus: 0.05, label: '+5% to all Ch1', global: true },
  { qty: 50, bonus: 0, label: 'Visual upgrade', visual: true },
  { qty: 100, bonus: 0, label: 'Achievement', achievement: true },
  { qty: 200, bonus: 4.0, label: '+500% output' },      // 6x total
  { qty: 500, bonus: 0, label: 'Synergy unlock', synergy: true },
];
```

- [ ] **Step 4: Create upgrade definitions**

```javascript
// js/data/upgrades.js
export const MULTIPLIERS = {
  sharpEyes: { id: 'sharpEyes', name: 'Sharp Eyes', baseCost: 100, costScaling: 1.5, effect: 'tapMultiplier', value: 0.1, maxLevel: Infinity, desc: '+10% tap value' },
  ecosystemHarmony: { id: 'ecosystemHarmony', name: 'Ecosystem Harmony', baseCost: 500, costScaling: 1.8, effect: 'generatorMultiplier', value: 0.15, maxLevel: Infinity, desc: '+15% all generator output' },
  temporalSensitivity: { id: 'temporalSensitivity', name: 'Temporal Sensitivity', baseCost: 200, costScaling: 2.0, effect: 'anomalyFrequency', value: 0.2, maxLevel: 20, desc: '+20% anomaly frequency' },
  dejaVu: { id: 'dejaVu', name: 'Déjà Vu', baseCost: 1000, costScaling: 1.6, effect: 'flatStartingTr', value: 50, maxLevel: Infinity, desc: '+50 TR at loop start' },
  speciesAffinity: { id: 'speciesAffinity', name: 'Species Affinity', baseCost: 300, costScaling: 1.4, effect: 'discoveryChance', value: 0.1, maxLevel: 30, desc: '+10% discovery chance' },
};

export const AUTOMATION = {
  harvester1: { id: 'harvester1', name: 'Harvester Mk I', cost: 500, desc: 'Auto-taps missed anomalies (50% value)', harvesterEfficiency: 0.5 },
  harvester2: { id: 'harvester2', name: 'Harvester Mk II', cost: 5000, desc: 'Auto-taps anomalies (75% value)', harvesterEfficiency: 0.75 },
  harvester3: { id: 'harvester3', name: 'Harvester Mk III', cost: 50000, desc: 'Auto-taps anomalies (100% value)', harvesterEfficiency: 1.0 },
  anomalyMagnet: { id: 'anomalyMagnet', name: 'Anomaly Magnet', cost: 2000, desc: 'Anomalies appear 50% more often' },
  offlineBeacon: { id: 'offlineBeacon', name: 'Offline Beacon', cost: 25000, desc: 'Generators produce at 100% offline' },
  discoveryDrone: { id: 'discoveryDrone', name: 'Discovery Drone', cost: 10000, desc: 'Discover species 2x faster' },
};

export const PERMANENT_UPGRADES = {
  residualMemory: { id: 'residualMemory', name: 'Residual Memory', maxLevel: 10, costs: [10, 20, 40, 80, 150, 250, 400, 600, 800, 1000], desc: 'Start loops with {level}% of prev TR', currency: 'echoMatter' },
  echoAmplifier: { id: 'echoAmplifier', name: 'Echo Amplifier', maxLevel: 5, costs: [25, 75, 150, 300, 500], desc: '+20% Echo Matter per loop', currency: 'echoMatter' },
  speciesInstinct: { id: 'speciesInstinct', name: 'Species Instinct', maxLevel: 5, costs: [50, 75, 120, 180, 250], desc: 'Discover species 25% faster', currency: 'echoMatter' },
  generatorBlueprint: { id: 'generatorBlueprint', name: 'Generator Blueprint', maxLevel: 3, costs: [100, 250, 500], desc: 'Generators start at level {level}', currency: 'echoMatter' },
  catastropheInsight: { id: 'catastropheInsight', name: 'Catastrophe Insight', maxLevel: 3, costs: [200, 500, 1000], desc: 'See catastrophe timer earlier', currency: 'echoMatter' },
  chronicleExpansion: { id: 'chronicleExpansion', name: 'Chronicle Expansion', maxLevel: 3, costs: [75, 150, 300], desc: 'More story fragments', currency: 'echoMatter' },
  marketConnections: { id: 'marketConnections', name: 'Market Connections', maxLevel: 3, costs: [100, 200, 400], desc: 'Better marketplace offerings', currency: 'echoMatter' },
};
```

- [ ] **Step 5: Implement economy.js**

```javascript
// js/engine/economy.js
import { GENERATORS, MILESTONES } from '../data/generators.js';
import { MULTIPLIERS, AUTOMATION, PERMANENT_UPGRADES } from '../data/upgrades.js';

export function getCost(baseCost, owned, scaling) {
  return Math.floor(baseCost * Math.pow(scaling, owned));
}

export function getGeneratorCost(genId, owned) {
  const gen = GENERATORS[genId];
  return getCost(gen.baseCost, owned, gen.costScaling);
}

export function getMilestoneMultiplier(genId, owned) {
  let mult = 1;
  for (const m of MILESTONES) {
    if (owned >= m.qty && m.bonus > 0 && !m.global) {
      mult += m.bonus;
    }
  }
  return mult;
}

export function getGlobalMilestoneBonus(state) {
  let bonus = 0;
  for (const [genId, count] of Object.entries(state.generators)) {
    for (const m of MILESTONES) {
      if (count >= m.qty && m.global && m.bonus > 0) {
        bonus += m.bonus;
      }
    }
  }
  return bonus;
}

export function getMultiplierBonus(state, effectType) {
  let total = 0;
  for (const [id, def] of Object.entries(MULTIPLIERS)) {
    if (def.effect === effectType) {
      total += (state.multipliers[id] || 0) * def.value;
    }
  }
  return total;
}

export function getTotalProduction(state) {
  const globalBonus = getGlobalMilestoneBonus(state);
  const harmonyBonus = getMultiplierBonus(state, 'generatorMultiplier');
  let total = 0;

  for (const [genId, count] of Object.entries(state.generators)) {
    const gen = GENERATORS[genId];
    if (!gen || count <= 0) continue;
    const milestoneMult = getMilestoneMultiplier(genId, count);
    total += gen.baseOutput * count * milestoneMult;
  }

  total *= (1 + globalBonus + harmonyBonus);

  // Apply active buff multipliers
  for (const buff of (state.activeBuffs || [])) {
    if (buff.id === 'nurturePulse') total *= 2;
    if (buff.id === 'productionSurge') total *= 5;
  }

  return total;
}

export function canAfford(state, cost, currency = 'residue') {
  return (state[currency] || 0) >= cost;
}

export function purchaseGenerator(state, genId) {
  const count = state.generators[genId] || 0;
  const cost = getGeneratorCost(genId, count);
  if (!canAfford(state, cost)) return false;
  state.residue -= cost;
  state.generators[genId] = count + 1;
  return true;
}

export function purchaseMultiplier(state, multId) {
  const def = MULTIPLIERS[multId];
  if (!def) return false;
  const level = state.multipliers[multId] || 0;
  if (def.maxLevel !== Infinity && level >= def.maxLevel) return false;
  const cost = getCost(def.baseCost, level, def.costScaling);
  if (!canAfford(state, cost)) return false;
  state.residue -= cost;
  state.multipliers[multId] = level + 1;
  return true;
}

export function purchaseAutomation(state, autoId) {
  const def = AUTOMATION[autoId];
  if (!def || state.automation[autoId]) return false;
  if (!canAfford(state, def.cost)) return false;
  state.residue -= def.cost;
  state.automation[autoId] = true;
  return true;
}

export function purchasePermanentUpgrade(state, upgradeId) {
  const def = PERMANENT_UPGRADES[upgradeId];
  if (!def) return false;
  const level = state.permanentUpgrades[upgradeId] || 0;
  if (level >= def.maxLevel) return false;
  const cost = def.costs[level];
  if (!canAfford(state, cost, 'echoMatter')) return false;
  state.echoMatter -= cost;
  state.permanentUpgrades[upgradeId] = level + 1;
  return true;
}

export function calcEchoMatter(state) {
  const baseEm = Math.floor(state.trEarnedThisLoop / 500)
    + (state.speciesDiscoveredThisLoop * 10)
    + (state.objectivesCompletedThisLoop * 25)
    + (state.anomalyTokensEarnedThisLoop * 2);

  const chapterMult = state.chapter * 1.5;
  const echoAmpLevel = state.permanentUpgrades?.echoAmplifier || 0;
  const echoAmpBonus = 1 + (0.2 * echoAmpLevel);
  const achieveBonus = 1 + (0.01 * (state.achievements?.length || 0));

  return Math.floor(baseEm * chapterMult * echoAmpBonus * achieveBonus);
}

export function getTapValue(state) {
  const base = 1;
  const tapBonus = getMultiplierBonus(state, 'tapMultiplier');
  return Math.floor(base * (1 + tapBonus)) || 1;
}
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/engine/economy.test.js`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add js/engine/economy.js js/data/generators.js js/data/upgrades.js tests/engine/economy.test.js
git commit -m "feat: economy engine with generators, upgrades, cost scaling, EM formula"
```

---

## Task 4: Catastrophe & Discovery Engines

**Files:**
- Create: `js/engine/catastrophe.js`
- Create: `js/engine/discovery.js`
- Create: `js/data/species.js`
- Create: `tests/engine/catastrophe.test.js`
- Create: `tests/engine/discovery.test.js`

- [ ] **Step 1: Write catastrophe tests**

```javascript
// tests/engine/catastrophe.test.js
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
  it('returns "trigger" when timer exceeds chapter duration', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] - 0.5;
    const result = tickCatastrophe(s, 1.0);
    assert.strictEqual(result, 'trigger');
  });
});

describe('getCatastrophePhase', () => {
  it('returns "calm" below 50%', () => {
    const s = createState();
    s.catastropheTimer = 100;
    assert.strictEqual(getCatastrophePhase(s), 'calm');
  });
  it('returns "warning" at 75-90%', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] * 0.8;
    assert.strictEqual(getCatastrophePhase(s), 'warning');
  });
  it('returns "critical" above 90%', () => {
    const s = createState();
    s.catastropheTimer = CATASTROPHE_DURATION[1] * 0.95;
    assert.strictEqual(getCatastrophePhase(s), 'critical');
  });
});
```

- [ ] **Step 2: Write discovery tests**

```javascript
// tests/engine/discovery.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runDiscoveryCheck, tryCombination, getHint } from '../../js/engine/discovery.js';
import { createState } from '../../js/engine/state.js';

describe('runDiscoveryCheck', () => {
  it('returns null if all chapter species discovered', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss','driftspore','poolworm','copperlichen','fogbell'];
    const result = runDiscoveryCheck(s, 0.0); // roll doesn't matter, pool is empty
    assert.strictEqual(result, null);
  });
  it('returns a species id on success', () => {
    const s = createState();
    const result = runDiscoveryCheck(s, 0.01); // low roll = guaranteed success (below 15% chance)
    assert.ok(result !== null);
    assert.ok(typeof result === 'string');
  });
});

describe('tryCombination', () => {
  it('returns new species for valid combo', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'driftspore'];
    const result = tryCombination(s, 'luminmoss', 'driftspore');
    assert.ok(result.success);
    assert.ok(result.species);
  });
  it('returns failure for invalid combo', () => {
    const s = createState();
    s.discoveredSpecies = ['luminmoss', 'poolworm'];
    const result = tryCombination(s, 'luminmoss', 'poolworm');
    assert.ok(!result.success);
  });
});

describe('getHint', () => {
  it('returns "nothing" for species with no valid combos', () => {
    const hint = getHint('copperlichen', 'fogbell');
    assert.strictEqual(hint, 'nothing');
  });
});
```

- [ ] **Step 3: Create species data**

```javascript
// js/data/species.js — Chapter 1 species (8 total: 5 discoverable + 3 combinations)

export const SPECIES = {
  // Chapter 1 — Discoverable
  luminmoss: {
    id: 'luminmoss', name: 'Luminmoss', chapter: 1, type: 'flora', discoverable: true,
    desc: 'Faintly glowing moss that clings to nothing in particular.',
    quote: "Found moss that glows when I touch it. Called it 'Luminmoss.' Felt like naming things might help me stay sane.",
    color: '#4af090', production: 0.1,
  },
  driftspore: {
    id: 'driftspore', name: 'Driftspore', chapter: 1, type: 'microbe', discoverable: true,
    desc: 'Tiny floating spores that drift upward, attracted to warmth.',
    quote: "Tiny things floating upward. I tried to catch one. It dissolved in my hand.",
    color: '#b088f0', production: 0.15,
  },
  poolworm: {
    id: 'poolworm', name: 'Poolworm', chapter: 1, type: 'fauna', discoverable: true,
    desc: 'A translucent worm-like creature. Completely harmless. Probably.',
    quote: "Something moved in the puddle. It looked at me. Do worms look? This one did.",
    color: '#60c8f0', production: 0.2,
  },
  copperlichen: {
    id: 'copperlichen', name: 'Copperlichen', chapter: 1, type: 'flora', discoverable: true,
    desc: 'A rust-orange lichen that tastes like pennies. Not that I tasted it.',
    quote: "Orange stuff on the rocks. It smells like a handful of coins. Named it Copperlichen because I'm creative like that.",
    color: '#d08848', production: 0.12,
  },
  fogbell: {
    id: 'fogbell', name: 'Fogbell', chapter: 1, type: 'flora', discoverable: true,
    desc: 'A tiny bell-shaped flower that only opens when the fog is near.',
    quote: "This flower opens when the fog comes. It LIKES the fog. We are very different, this flower and I.",
    color: '#8888cc', production: 0.18,
  },

  // Chapter 1 — Combinations (unlocked in Chapter 2, defined here for data completeness)
  // These species exist in data but tryCombination() gates them to chapter >= 2
  glowspore: {
    id: 'glowspore', name: 'Glowspore', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['luminmoss', 'driftspore'],
    desc: 'A spore that glows with borrowed light. Drifts with purpose.',
    quote: "Two things got close and became a new thing. Is that... evolution? Or something else entirely?",
    color: '#80e8b0', production: 0.5,
  },
  puddlemoss: {
    id: 'puddlemoss', name: 'Puddlemoss', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['luminmoss', 'poolworm'],
    desc: 'Moss that grows in water, guided by worms. An unlikely friendship.',
    quote: "The worm grows the moss. The moss feeds the worm. This is nicer than most relationships I've seen.",
    color: '#58d8a0', production: 0.4,
  },
  foglichen: {
    id: 'foglichen', name: 'Foglichen', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['copperlichen', 'fogbell'],
    desc: 'A lichen that thrives in fog, growing copper-bright tendrils.',
    quote: "Great. Now the fog is making things GROW. This place has a very different relationship with destruction than I do.",
    color: '#c89060', production: 0.45,
  },
};

// SVG generator functions — each returns an SVG string for the species
export function generateSpeciesSVG(speciesId, size = 60) {
  const species = SPECIES[speciesId];
  if (!species) return '';
  const s = size;
  const cx = s/2, cy = s/2;

  switch (speciesId) {
    case 'luminmoss':
      return `<g>${Array.from({length: 7}, (_, i) => {
        const ox = (Math.random()-0.5)*s*0.5, oy = (Math.random()-0.5)*s*0.3;
        return `<circle cx="${cx+ox}" cy="${cy+oy}" r="${2+Math.random()*4}" fill="${species.color}" opacity="${0.4+Math.random()*0.4}"><animate attributeName="r" values="${2+Math.random()*3};${4+Math.random()*3};${2+Math.random()*3}" dur="${2+Math.random()*2}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'driftspore':
      return `<g>${Array.from({length: 5}, (_, i) => {
        const ox = (Math.random()-0.5)*s*0.4, oy = (Math.random()-0.5)*s*0.6;
        return `<circle cx="${cx+ox}" cy="${cy+oy}" r="${1+Math.random()*2}" fill="${species.color}" opacity="${0.5+Math.random()*0.3}"><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="${2+Math.random()*2}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'poolworm':
      return `<g><path d="M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy}" stroke="${species.color}" stroke-width="3" fill="none" stroke-linecap="round"><animate attributeName="d" values="M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy};M${cx-12},${cy} Q${cx-6},${cy+4} ${cx},${cy} Q${cx+6},${cy-4} ${cx+12},${cy};M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy}" dur="2s" repeatCount="indefinite"/></path><circle cx="${cx+11}" cy="${cy}" r="1.5" fill="${species.color}"/></g>`;

    case 'copperlichen':
      return `<g>${Array.from({length: 5}, (_, i) => {
        const angle = (i/5)*Math.PI*2;
        const r = 6+Math.random()*8;
        return `<ellipse cx="${cx+Math.cos(angle)*r}" cy="${cy+Math.sin(angle)*r}" rx="${3+Math.random()*4}" ry="${2+Math.random()*3}" fill="${species.color}" opacity="${0.3+Math.random()*0.4}" transform="rotate(${Math.random()*360},${cx+Math.cos(angle)*r},${cy+Math.sin(angle)*r})"/>`;
      }).join('')}</g>`;

    case 'fogbell':
      return `<g><path d="M${cx},${cy+10} L${cx},${cy-5}" stroke="#666" stroke-width="1.5"/><path d="M${cx-6},${cy-2} Q${cx-6},${cy-10} ${cx},${cy-12} Q${cx+6},${cy-10} ${cx+6},${cy-2}" fill="${species.color}" opacity="0.6"><animate attributeName="opacity" values="0.6;0.3;0.6" dur="4s" repeatCount="indefinite"/></path><circle cx="${cx}" cy="${cy-1}" r="1" fill="#fff" opacity="0.5"/></g>`;

    default:
      // Generic glow blob for hybrids
      return `<g><circle cx="${cx}" cy="${cy}" r="${s*0.25}" fill="${species.color}" opacity="0.5"><animate attributeName="r" values="${s*0.22};${s*0.28};${s*0.22}" dur="3s" repeatCount="indefinite"/></circle><circle cx="${cx}" cy="${cy}" r="${s*0.12}" fill="${species.color}" opacity="0.8"/></g>`;
  }
}

export const COMBINATIONS = [
  { a: 'luminmoss', b: 'driftspore', result: 'glowspore' },
  { a: 'luminmoss', b: 'poolworm', result: 'puddlemoss' },
  { a: 'copperlichen', b: 'fogbell', result: 'foglichen' },
];
```

- [ ] **Step 4: Implement catastrophe.js**

```javascript
// js/engine/catastrophe.js
export const CATASTROPHE_DURATION = { 1: 480, 2: 600, 3: 720, 4: 900, 5: 1080, 6: 1320, 7: 1800 }; // seconds

export function getDuration(state) {
  const base = CATASTROPHE_DURATION[state.chapter] || 480;
  // TODO: apply catastrophe delay upgrades
  return base;
}

export function tickCatastrophe(state, dt) {
  // Check if any active buff pauses catastrophe
  const anchored = (state.activeBuffs || []).some(b => b.id === 'temporalAnchor');
  if (anchored) return 'paused';

  state.catastropheTimer += dt;
  const duration = getDuration(state);
  if (state.catastropheTimer >= duration) {
    return 'trigger';
  }
  return 'ticking';
}

export function getCatastrophePhase(state) {
  const duration = getDuration(state);
  const pct = state.catastropheTimer / duration;
  if (pct < 0.5) return 'calm';
  if (pct < 0.75) return 'building';
  if (pct < 0.9) return 'warning';
  return 'critical';
}

export function getCatastropheProgress(state) {
  return state.catastropheTimer / getDuration(state);
}
```

- [ ] **Step 5: Implement discovery.js**

```javascript
// js/engine/discovery.js
import { SPECIES, COMBINATIONS } from '../data/species.js';

function getDiscoverablePool(state) {
  return Object.values(SPECIES).filter(s =>
    s.chapter <= state.chapter && s.discoverable && !state.discoveredSpecies.includes(s.id)
  );
}

export function getDiscoveryChance(state) {
  let chance = 0.15;
  // Species Affinity multiplier
  const affinityLevel = state.multipliers?.speciesAffinity || 0;
  chance *= (1 + affinityLevel * 0.1);
  // Species Instinct permanent upgrade
  const instinctLevel = state.permanentUpgrades?.speciesInstinct || 0;
  chance *= (1 + instinctLevel * 0.25);
  // Discovery Drone
  if (state.automation?.discoveryDrone) chance *= 2;
  return Math.min(chance, 0.95);
}

export function runDiscoveryCheck(state, forceRoll = null) {
  const pool = getDiscoverablePool(state);
  if (pool.length === 0) return null;

  const chance = getDiscoveryChance(state);
  const roll = forceRoll !== null ? forceRoll : Math.random();
  if (roll > chance) return null;

  const species = pool[Math.floor(Math.random() * pool.length)];
  return species.id;
}

export function getDiscoveryInterval(state) {
  let interval = 45; // base 45 seconds
  if (state.automation?.discoveryDrone) interval /= 2;
  const instinctLevel = state.permanentUpgrades?.speciesInstinct || 0;
  interval /= (1 + instinctLevel * 0.25);
  return Math.max(interval, 5);
}

export function discoverSpecies(state, speciesId) {
  if (state.discoveredSpecies.includes(speciesId)) return false;
  state.discoveredSpecies.push(speciesId);
  state.speciesDiscoveredThisLoop += 1;
  state.totalSpeciesDiscovered = state.discoveredSpecies.length;
  return true;
}

export function tryCombination(state, speciesA, speciesB) {
  const combo = COMBINATIONS.find(c =>
    (c.a === speciesA && c.b === speciesB) || (c.a === speciesB && c.b === speciesA)
  );
  if (!combo) return { success: false, hint: getHint(speciesA, speciesB) };
  if (state.discoveredSpecies.includes(combo.result)) {
    return { success: false, hint: 'already_discovered' };
  }
  // Check chapter requirement
  const resultSpecies = SPECIES[combo.result];
  if (resultSpecies && resultSpecies.chapter > state.chapter) {
    return { success: false, hint: 'future_chapter' };
  }
  discoverSpecies(state, combo.result);
  state.combinationsFound.push(combo.result);
  return { success: true, species: combo.result };
}

export function getHint(speciesA, speciesB) {
  const aInCombo = COMBINATIONS.some(c => c.a === speciesA || c.b === speciesA);
  const bInCombo = COMBINATIONS.some(c => c.a === speciesB || c.b === speciesB);
  if (aInCombo && bInCombo) return 'both_valid'; // "A form almost takes shape!"
  if (aInCombo || bInCombo) return 'one_valid';   // "Something stirs... but fades."
  return 'nothing';                                 // "Nothing happens."
}
```

- [ ] **Step 6: Run all tests**

Run: `node --test tests/engine/catastrophe.test.js tests/engine/discovery.test.js`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add js/engine/catastrophe.js js/engine/discovery.js js/data/species.js tests/engine/catastrophe.test.js tests/engine/discovery.test.js
git commit -m "feat: catastrophe timer, species discovery, combination system"
```

---

## Task 5: Anomalies & Progress Engines

**Files:**
- Create: `js/engine/anomalies.js`
- Create: `js/engine/progress.js`
- Create: `js/data/achievements.js`
- Create: `js/data/narrative.js`
- Create: `tests/engine/anomalies.test.js`
- Create: `tests/engine/progress.test.js`

- [ ] **Step 1: Write anomaly tests**

Test anomaly spawning, chain logic, burst timing, reward calculation.

- [ ] **Step 2: Write progress tests**

Test chapter objectives checking, achievement checking, chronicle entry triggers.

- [ ] **Step 3: Create achievement definitions**

~30 achievements for Chapter 1 covering loop milestones, discovery, economy, tapping, speed categories. Each with `{ id, name, desc, check: (state) => bool, reward: { em, multiplier } }`.

- [ ] **Step 4: Create narrative data**

Protagonist quotes (early game set), chronicle entry triggers and text, chapter 1 config.

- [ ] **Step 4b: Create shared utility (formatNum)**

```javascript
// js/engine/utils.js
export function formatNum(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}
```

- [ ] **Step 5: Implement anomalies.js**

Anomaly spawning logic: types with weighted probabilities, burst spawning every 30-90s, chain tracking (3s window), reward calculation based on type + tap multiplier + chain bonus. Exports: `updateAnomalies(state, dt)`, `spawnAnomaly(state)`, `shouldBurst(state)`, `tapAnomaly(state, anomalyId)`, `getActiveAnomalies(state)`.

State tracks anomalies as array: `state.activeAnomalies = [{ id, type, x, y, spawnTime, lifetime }]`.

- [ ] **Step 6: Implement progress.js**

Chapter objective definitions, check function that returns newly completed objectives. Achievement check function that returns newly earned achievements. Chronicle entry trigger function. Exports: `checkObjectives(state)`, `checkAchievements(state)`, `addChronicleEntry(state, trigger)`.

Chapter 1 objectives (5 total):
1. "Discover 3 species" — `state.discoveredSpecies.length >= 3`
2. "Reach 1,000 TR in a single loop" — `state.trEarnedThisLoop >= 1000`
3. "Own 10 generators" — total generators >= 10
4. "Survive 2 catastrophes" — `state.totalLoops >= 2`
5. "Earn 50 Echo Matter" — `state.echoMatter >= 50`

- [ ] **Step 7: Run all tests**

Run: `node --test tests/engine/anomalies.test.js tests/engine/progress.test.js`
Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add js/engine/anomalies.js js/engine/progress.js js/data/achievements.js js/data/narrative.js tests/engine/
git commit -m "feat: anomaly system, achievement tracking, narrative data"
```

---

## Task 6: Particle System + Biome Renderer

**Files:**
- Create: `js/ui/particles.js`
- Create: `js/ui/biome.js`

- [ ] **Step 1: Implement particles.js**

Canvas-based particle system. Manages a pool of particles (max 100). Each particle has position, velocity, life, decay, size, color. Supports:
- `initParticles(canvas)` — get context, resize handler
- `spawnBurst(x, y, count, color)` — tap feedback particles
- `spawnAmbient()` — occasional floating spore particles
- `tick(dt)` — update positions, decay life
- `draw()` — render all particles
- `spawnFloatingNumber(x, y, text, color)` — "+5" floating text (tracked separately)

- [ ] **Step 2: Implement biome.js**

SVG biome rendering for Chapter 1 (Primordial Soup):
- `renderBiome(state, svgElement)` — clears SVG, draws background (dark water gradient, rocks, puddles), places discovered species as procedural SVG creatures, adds ambient dots
- `renderAnomalies(state, svgElement)` — adds/removes anomaly shapes (circles, stars, hexagons) with glow animation
- Uses `generateSpeciesSVG()` from species.js data
- Species creatures placed at semi-random positions, gentle CSS animation

- [ ] **Step 3: Test visually in browser**

Visit URL, verify: dark biome background renders, ambient particles float, tapping anywhere produces particle burst.

- [ ] **Step 4: Commit**

```bash
git add js/ui/particles.js js/ui/biome.js
git commit -m "feat: canvas particles and SVG biome renderer"
```

---

## Task 7: UI Shell — Renderer, Shop, Overlays, Notifications

**Files:**
- Create: `js/ui/renderer.js`
- Create: `js/ui/shop.js`
- Create: `js/ui/overlays.js`
- Create: `js/ui/notifications.js`

- [ ] **Step 1: Implement notifications.js**

Toast notification system. Queue of toasts, displayed one at a time from bottom-up. Each toast has text, type (discovery/achievement/warning/story), auto-dismiss after 3s. `showToast(text, type)` appends to DOM, animates in, auto-removes.

- [ ] **Step 2: Implement renderer.js**

Core DOM updater. Called every frame or on state change.
- `updateResourceBar(state)` — updates TR, EM, loop count displays
- `updateCatastropheBar(state)` — updates fill width, color, label based on phase
- `updateObjectives(state)` — renders chapter objective checkboxes
- `updateQuoteBar(state, quote)` — rotates protagonist quote
- `switchPanel(panelId)` — shows one panel, hides others, updates nav button active states

- [ ] **Step 3: Implement shop.js**

Generates buy buttons for generators, multipliers, automation, permanent upgrades.
- `renderGenerators(state, container)` — list of generator buttons with name, count, cost, output, buy button
- `renderMultipliers(state, container)` — multiplier upgrade buttons
- `renderAutomation(state, container)` — automation checkboxes/buttons
- `renderPermanentUpgrades(state, container)` — EM-cost upgrades
- `renderMarketplace(state, container)` — rotating + permanent marketplace items
- All buy buttons call the appropriate `purchase*` function from economy.js and re-render
- Buttons show `:disabled` when can't afford, with cost in red

- [ ] **Step 4: Implement overlays.js**

Full-screen overlays for major events:
- `showDiscovery(species)` — species SVG, name, description, quote, "tap to continue"
- `showCatastrophe(callback)` — screen shake, fog animation, fade to white, then callback
- `showLoopSummary(stats, callback)` — TR earned, species found, EM earned, "Continue" button
- `showChapterTransition(fromCh, toCh, callback)` — slow white out, new title fades in
- Each overlay manages its own show/dismiss lifecycle

- [ ] **Step 5: Test visually**

Visit URL. Tap bottom nav buttons — panels switch. Mock data should show generator buy buttons. Toast notification appears on load.

- [ ] **Step 6: Commit**

```bash
git add js/ui/renderer.js js/ui/shop.js js/ui/overlays.js js/ui/notifications.js
git commit -m "feat: UI shell — shop, overlays, notifications, DOM renderer"
```

---

## Task 8: Main Game Loop — Wire Everything Together

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Implement main.js — the game loop**

This is the orchestrator. It imports all modules and runs the game:

```javascript
// js/main.js
import { createState, load, save, resetLoop, calcOfflineProgressWithRate } from './engine/state.js';
import { getTotalProduction, getTapValue, calcEchoMatter, purchaseGenerator, purchaseMultiplier, purchaseAutomation, purchasePermanentUpgrade } from './engine/economy.js';
import { tickCatastrophe, getCatastrophePhase, getCatastropheProgress } from './engine/catastrophe.js';
import { runDiscoveryCheck, discoverSpecies, tryCombination, getDiscoveryInterval } from './engine/discovery.js';
import { updateAnomalies, tapAnomaly, getActiveAnomalies } from './engine/anomalies.js';
import { checkObjectives, checkAchievements, addChronicleEntry } from './engine/progress.js';
import { GENERATORS } from './data/generators.js';
import { SPECIES, generateSpeciesSVG } from './data/species.js';
import { MULTIPLIERS, AUTOMATION, PERMANENT_UPGRADES } from './data/upgrades.js';
import { QUOTES, CHRONICLE_TRIGGERS } from './data/narrative.js';
import { initParticles, spawnBurst, spawnFloatingNumber, tickParticles, drawParticles } from './ui/particles.js';
import { renderBiome, renderAnomalies } from './ui/biome.js';
import { updateResourceBar, updateCatastropheBar, updateObjectives, updateQuoteBar, switchPanel } from './ui/renderer.js';
import { renderGenerators, renderMultipliers, renderAutomation, renderPermanentUpgrades, renderMarketplace } from './ui/shop.js';
import { showDiscovery, showCatastrophe, showLoopSummary } from './ui/overlays.js';
import { showToast } from './ui/notifications.js';
import { formatNum } from './engine/utils.js';

let state;
let lastTime = 0;
let discoveryTimer = 0;
let quoteTimer = 0;
let saveTimer = 0;
let isOverlayActive = false;

function init() {
  state = load();
  // Handle offline progress
  const elapsed = (Date.now() - state.lastSaveTime) / 1000;
  if (elapsed > 10) {
    const prod = getTotalProduction(state);
    const offline = calcOfflineProgressWithRate(state, elapsed, prod);
    if (offline.trEarned > 0) {
      state.residue += offline.trEarned;
      state.trEarnedThisLoop += offline.trEarned;
      showToast(`Welcome back! +${formatNum(offline.trEarned)} TR while away`, 'story');
    }
  }

  initParticles(document.getElementById('particle-canvas'));
  renderBiome(state, document.getElementById('biome-svg'));
  setupEventListeners();
  renderAllShops();
  updateAllUI();

  if (state.loop === 0 && state.chronicleEntries.length === 0) {
    addChronicleEntry(state, 'start');
    showToast("You wake up. The ground is wet.", 'story');
  }

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = timestamp;

  if (!isOverlayActive) {
    // Production tick
    const production = getTotalProduction(state);
    const trGained = production * dt;
    state.residue += trGained;
    state.trEarnedThisLoop += trGained;
    state.totalTrEarned += trGained;
    state.totalPlayTime += dt;

    // Catastrophe tick
    const catResult = tickCatastrophe(state, dt);
    if (catResult === 'trigger') {
      triggerCatastrophe();
    }

    // Anomaly tick
    updateAnomalies(state, dt);

    // Discovery tick
    discoveryTimer += dt;
    const discoveryInterval = getDiscoveryInterval(state);
    if (discoveryTimer >= discoveryInterval) {
      discoveryTimer = 0;
      const discovered = runDiscoveryCheck(state);
      if (discovered) {
        discoverSpecies(state, discovered);
        const species = SPECIES[discovered];
        isOverlayActive = true;
        showDiscovery(species, () => {
          isOverlayActive = false;
          renderBiome(state, document.getElementById('biome-svg'));
          showToast(`Discovered: ${species.name}`, 'discovery');
        });
      }
    }

    // Progress checks
    const newObjectives = checkObjectives(state);
    const newAchievements = checkAchievements(state);
    for (const obj of newObjectives) showToast(`Objective complete: ${obj}`, 'achievement');
    for (const ach of newAchievements) showToast(`Achievement: ${ach.name}`, 'achievement');

    // Quote rotation
    quoteTimer += dt;
    if (quoteTimer >= 20) {
      quoteTimer = 0;
      updateQuoteBar(state, getRandomQuote(state));
    }

    // Save
    saveTimer += dt;
    if (saveTimer >= 10) {
      saveTimer = 0;
      save(state);
    }
  }

  // Render
  tickParticles(dt);
  drawParticles();
  renderAnomalies(state, document.getElementById('biome-svg'));
  updateResourceBar(state);
  updateCatastropheBar(state);

  requestAnimationFrame(gameLoop);
}

function triggerCatastrophe() {
  isOverlayActive = true;
  const emEarned = calcEchoMatter(state);

  showCatastrophe(() => {
    const stats = {
      trEarned: state.trEarnedThisLoop,
      speciesFound: state.speciesDiscoveredThisLoop,
      emEarned,
      loop: state.loop + 1,
    };

    state.echoMatter += emEarned;
    resetLoop(state);
    save(state);

    showLoopSummary(stats, () => {
      isOverlayActive = false;
      renderBiome(state, document.getElementById('biome-svg'));
      renderAllShops();
      updateAllUI();
    });
  });
}

function setupEventListeners() {
  // Biome tap — use pointerup to avoid click+touchend double-fire on mobile
  document.getElementById('biome-container').addEventListener('pointerup', handleBiomeTap);

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  // Combine button
  document.getElementById('combine-btn')?.addEventListener('click', handleCombine);

  // Visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save(state);
    else {
      const elapsed = (Date.now() - state.lastSaveTime) / 1000;
      if (elapsed > 5) {
        const prod = getTotalProduction(state);
        const offline = calcOfflineProgressWithRate(state, elapsed, prod);
        if (offline.trEarned > 0) {
          state.residue += offline.trEarned;
          state.trEarnedThisLoop += offline.trEarned;
          showToast(`+${formatNum(offline.trEarned)} TR while away`, 'story');
        }
      }
      lastTime = performance.now();
    }
  });
}

function handleBiomeTap(e) {
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check anomaly hit first — find nearest anomaly within 40px
  const anomalies = getActiveAnomalies(state);
  const hitRadius = 40;
  for (const a of anomalies) {
    const ax = a.x * rect.width, ay = a.y * rect.height;
    const dist = Math.hypot(x - ax, y - ay);
    if (dist < hitRadius) {
      const reward = tapAnomaly(state, a.id);
      if (reward) {
        state.totalAnomaliesTapped += 1;
        const color = reward.type === 'token' ? '#f0c860' : '#7af8d4';
        spawnBurst(x, y, 12, color);
        spawnFloatingNumber(x, y - 20, `+${reward.amount}`, color);
        updateResourceBar(state);
        return; // anomaly tap consumes the tap
      }
    }
  }

  // Base tap
  const value = getTapValue(state);
  state.residue += value;
  state.trEarnedThisLoop += value;
  state.totalTrEarned += value;

  spawnBurst(x, y, 8, '#7af8d4');
  spawnFloatingNumber(x, y - 20, `+${value}`, '#7af8d4');
  updateResourceBar(state);
}

function handleCombine() { /* wired in shop.js */ }

function renderAllShops() {
  renderGenerators(state, document.getElementById('generators-list'), purchaseGenerator, renderAllShops);
  renderMultipliers(state, document.getElementById('multipliers-list'), purchaseMultiplier, renderAllShops);
  renderAutomation(state, document.getElementById('automation-list'), purchaseAutomation, renderAllShops);
  renderPermanentUpgrades(state, document.getElementById('permanent-list'), purchasePermanentUpgrade, renderAllShops);
}

function updateAllUI() {
  updateResourceBar(state);
  updateCatastropheBar(state);
  updateObjectives(state);
}

function getRandomQuote(state) {
  const pool = QUOTES.early; // TODO: select by chapter/progress
  return pool[Math.floor(Math.random() * pool.length)];
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: Test the full game loop in browser**

Visit `https://claude.stevesinfo.com/idle-game/`. Verify:
1. Dark biome renders with chapter header
2. Tapping biome produces particles and "+1" floating numbers
3. TR counter increments on tap
4. Generators appear in Upgrades panel, can be purchased
5. Production ticks TR upward passively
6. Catastrophe bar fills over ~8 minutes
7. Species discovery popup appears after ~45 seconds
8. Catastrophe triggers loop reset with summary screen
9. Echo Matter is earned and shown
10. Permanent upgrades are purchasable with EM
11. Save persists on page refresh

- [ ] **Step 3: Fix any integration issues**

Debug and fix any wiring issues between modules.

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: main game loop wiring all systems together"
```

---

## Task 9: Anomaly Visual Rendering + Hit Detection

**Files:**
- Modify: `js/ui/biome.js`
- Modify: `js/main.js`

- [ ] **Step 1: Add anomaly DOM elements**

Anomalies rendered as absolutely-positioned SVG elements overlaid on the biome. Each anomaly gets a DOM element with `data-anomaly-id`, glow animation, and a tap/click handler.

- [ ] **Step 2: Implement hit detection**

In `handleBiomeTap`, check if tap coordinates are near any active anomaly. If so, call `tapAnomaly(state, anomalyId)` and trigger appropriate reward particles (teal for TR, gold for tokens, purple for fragments).

- [ ] **Step 3: Implement chain visual feedback**

Show chain counter when chain > 1 (e.g. "3-CHAIN! 2x" with glow text). Reset chain display when chain expires.

- [ ] **Step 4: Test in browser**

Verify anomalies appear as glowing shapes, tapping them gives rewards, chains work, bursts create multiple tappable anomalies.

- [ ] **Step 5: Commit**

```bash
git add js/ui/biome.js js/main.js
git commit -m "feat: anomaly rendering, hit detection, chain visuals"
```

---

## Task 10: Combination UI + Codex + Chronicle

**Files:**
- Modify: `js/ui/shop.js`
- Modify: `js/ui/renderer.js`

- [ ] **Step 1: Implement species grid in Codex**

Render all Chapter 1 species in a grid. Discovered species show SVG icon + name + production rate. Undiscovered show "???" with silhouette.

- [ ] **Step 2: Implement combination UI**

Two "slots" — tap a discovered species in the grid to fill slot A, tap another for slot B. "Combine" button attempts the combination. Show result overlay on success, hint text on failure.

- [ ] **Step 3: Implement chronicle display**

Chronologically ordered journal entries with timestamps. Each entry shows the protagonist's text. Newest at top.

- [ ] **Step 4: Implement stats panel**

Achievement list (earned vs locked). Stats: total TR earned, total loops, play time, species discovered.

- [ ] **Step 5: Test in browser**

Verify: species grid shows discovered/undiscovered, combination works, chronicle fills with entries, achievements display.

- [ ] **Step 6: Commit**

```bash
git add js/ui/shop.js js/ui/renderer.js
git commit -m "feat: codex, combination UI, chronicle, stats panel"
```

---

## Task 11: Polish, Balance, and Deploy

**Files:**
- Modify: various

- [ ] **Step 1: Balance pass**

Play through Chapter 1 manually. Verify:
- First species discovered within 30 seconds
- First generator purchasable within 1 minute
- First loop completes in ~8 minutes
- 5 achievements in first 10 minutes
- All Chapter 1 objectives completable within ~1 hour
- Enough buyables that player never has "nothing to buy"

Adjust costs, production rates, discovery timers as needed.

- [ ] **Step 2: Mobile polish**

Test on actual phone. Fix:
- Touch event handling (prevent double-fire from click+touchend)
- Safe area insets (notch, bottom bar)
- Scroll behavior in panels
- Font sizes readable on small screens
- Tap targets large enough (min 44px)

- [ ] **Step 3: Add .gitignore**

```
.superpowers/
node_modules/
*.swp
.DS_Store
```

- [ ] **Step 4: Move old prototypes**

Move `approach-a/`, `approach-b/`, `approach-c/`, old `index.html` into `prototypes/` directory.

- [ ] **Step 5: Run all engine tests**

Run: `node --test tests/engine/*.test.js`
Expected: All PASS

- [ ] **Step 6: Final commit and push**

```bash
git add -A
git commit -m "feat: Chapter 1 MVP — complete playable idle game with core loop"
git push
```

- [ ] **Step 7: Verify live deployment**

Visit `https://claude.stevesinfo.com/idle-game/` on phone. Play through one complete loop. Verify save/load works across page refresh.

---

## Future Phases (not in this plan)

- **Phase 2:** Chapter 2 — combination system depth, symbiosis bonuses, new generators/species
- **Phase 3:** Chapters 3-4 — intervention system, synergy chains, species upgrade trees
- **Phase 4:** Chapters 5-6 — ecosystem balance, risk/reward species, temporal tools, invasives
- **Phase 5:** Chapter 7 — endgame, temporal equations, final intervention, victory screen
- **Phase 6:** Post-game — prestige layers, cosmetics, New Game+, sound design
