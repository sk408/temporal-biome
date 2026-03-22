# Phase 3: Chapter 3 "Fungal Dominion" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Chapter 3 ("Fungal Dominion") with a new Mycelium Network mechanic, 10 new species, 3 generators, chapter-conditional visuals, and full progression content.

**Architecture:** Chapter 3 introduces the **Mycelium Network** — a player-directed system where species are connected via underground links for scaling production bonuses. This is distinct from symbiosis (automatic fixed pairs) because the player chooses which species to connect and cross-chapter links give higher bonuses, creating strategic depth. All new content follows established patterns: data in `js/data/`, logic in `js/engine/`, UI wiring in `js/main.js`.

**Tech Stack:** Vanilla JS (ES modules), SVG procedural creatures, Node.js `node:test` runner, no build step.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `js/engine/mycelium.js` | **Create** | Mycelium network logic: create/validate links, calculate bonuses |
| `js/data/species.js` | Modify | Add 6 Ch3 discoverable + 4 Ch3 combination species with SVG |
| `js/data/generators.js` | Modify | Add 3 Ch3 generators |
| `js/data/narrative.js` | Modify | Add ch3Early/ch3Mid/ch3Late quote pools |
| `js/engine/symbiosis.js` | Modify | Add 4 Ch3 symbiosis pairs |
| `js/engine/progress.js` | Modify | Add Ch3 objectives, achievements, chronicle entries |
| `js/engine/economy.js` | Modify | Integrate mycelium bonus into production and EM calc |
| `js/engine/state.js` | Modify | Add `myceliumLinks` to defaults |
| `js/ui/biome.js` | Modify | Add Ch3 cavern biome rendering |
| `js/main.js` | Modify | Wire network UI, Ch3 quotes, chronicle triggers |
| `index.html` | Modify | Add mycelium network section in Codex |
| `css/game.css` | Modify | Add mycelium network styles |
| `tests/engine/mycelium.test.js` | **Create** | Tests for mycelium network module |

---

## Task 1: Mycelium Network Engine

**Files:**
- Create: `js/engine/mycelium.js`
- Create: `tests/engine/mycelium.test.js`

### Step 1.1: Write failing tests for mycelium network

- [ ] Create `tests/engine/mycelium.test.js`:

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canCreateLink, createLink, getMyceliumBonus, getSpeciesLinkCount, removeLink, getNetworkStats } from '../../js/engine/mycelium.js';

function makeState(overrides = {}) {
  return {
    discoveredSpecies: ['luminmoss', 'driftspore', 'poolworm', 'sporecap', 'glowshroom'],
    myceliumLinks: [],
    anomalyTokens: 50,
    ...overrides,
  };
}

describe('canCreateLink', () => {
  it('returns true for two discovered species with enough tokens', () => {
    const state = makeState();
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), true);
  });

  it('returns false if species not discovered', () => {
    const state = makeState({ discoveredSpecies: ['luminmoss'] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if not enough anomaly tokens', () => {
    const state = makeState({ anomalyTokens: 2 });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if link already exists', () => {
    const state = makeState({ myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if link exists in reverse order', () => {
    const state = makeState({ myceliumLinks: [{ a: 'driftspore', b: 'luminmoss' }] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if species has 3 links already', () => {
    const state = makeState({
      discoveredSpecies: ['luminmoss', 'driftspore', 'poolworm', 'sporecap', 'glowshroom'],
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'poolworm' },
        { a: 'luminmoss', b: 'sporecap' },
      ],
    });
    assert.equal(canCreateLink(state, 'luminmoss', 'glowshroom'), false);
  });

  it('returns false if same species used for both slots', () => {
    const state = makeState();
    assert.equal(canCreateLink(state, 'luminmoss', 'luminmoss'), false);
  });

  it('returns false if max 15 total links reached', () => {
    const links = [];
    const species = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];
    for (let i = 0; i < 15; i++) {
      links.push({ a: species[i], b: species[i + 1] });
    }
    const state = makeState({
      discoveredSpecies: [...species, 'luminmoss', 'driftspore'],
      myceliumLinks: links,
    });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });
});

describe('createLink', () => {
  it('creates a link and deducts tokens', () => {
    const state = makeState({ anomalyTokens: 10 });
    const result = createLink(state, 'luminmoss', 'driftspore');
    assert.equal(result, true);
    assert.equal(state.myceliumLinks.length, 1);
    assert.deepEqual(state.myceliumLinks[0], { a: 'luminmoss', b: 'driftspore' });
    assert.equal(state.anomalyTokens, 5);
  });

  it('returns false if cannot create link', () => {
    const state = makeState({ anomalyTokens: 2 });
    assert.equal(createLink(state, 'luminmoss', 'driftspore'), false);
    assert.equal(state.myceliumLinks.length, 0);
  });
});

describe('getMyceliumBonus', () => {
  it('returns 0 with no links', () => {
    const state = makeState();
    assert.equal(getMyceliumBonus(state), 0);
  });

  it('returns 0.03 for one same-chapter link', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.03) < 0.001);
  });

  // NOTE: Cross-chapter tests require Ch3 species in SPECIES data (Task 2).
  // These tests use Ch1 species only until then.
  it('stacks bonuses for multiple same-chapter links', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'poolworm' },
      ],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.06) < 0.001);  // 2 same-chapter links: 2 * 0.03
  });
});

describe('getSpeciesLinkCount', () => {
  it('returns 0 for unlinked species', () => {
    const state = makeState();
    assert.equal(getSpeciesLinkCount(state, 'luminmoss'), 0);
  });

  it('counts links where species appears as a or b', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'poolworm', b: 'luminmoss' },
      ],
    });
    assert.equal(getSpeciesLinkCount(state, 'luminmoss'), 2);
  });
});

describe('removeLink', () => {
  it('removes an existing link', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    removeLink(state, 'luminmoss', 'driftspore');
    assert.equal(state.myceliumLinks.length, 0);
  });

  it('removes link regardless of order', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    removeLink(state, 'driftspore', 'luminmoss');
    assert.equal(state.myceliumLinks.length, 0);
  });
});

describe('getNetworkStats', () => {
  it('returns zero stats with no links', () => {
    const state = makeState();
    const stats = getNetworkStats(state);
    assert.equal(stats.totalLinks, 0);
    assert.equal(stats.sameChapterLinks, 0);
    assert.equal(stats.crossChapterLinks, 0);
    assert.equal(stats.connectedSpecies, 0);
  });

  it('counts connected species and link types', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'sporecap' },
      ],
    });
    const stats = getNetworkStats(state);
    assert.equal(stats.totalLinks, 2);
    assert.equal(stats.sameChapterLinks, 1);
    assert.equal(stats.crossChapterLinks, 1);
    assert.equal(stats.connectedSpecies, 3);
  });
});
```

- [ ] Run tests to verify they fail:

```bash
cd /home/claude/idle-game && node --test tests/engine/mycelium.test.js
```

Expected: FAIL — module not found.

### Step 1.2: Implement mycelium network module

- [ ] Create `js/engine/mycelium.js`:

```js
// Mycelium Network — player-directed species connections for production bonuses
import { SPECIES } from '../data/species.js';

const LINK_COST = 5;          // anomaly tokens per link
const MAX_LINKS = 15;         // total network cap
const MAX_PER_SPECIES = 3;    // max links per species
const SAME_CHAPTER_BONUS = 0.03;   // +3% production per same-chapter link
const CROSS_CHAPTER_BONUS = 0.05;  // +5% production per cross-chapter link

function linkExists(state, a, b) {
  return (state.myceliumLinks || []).some(
    l => (l.a === a && l.b === b) || (l.a === b && l.b === a)
  );
}

export function getSpeciesLinkCount(state, speciesId) {
  return (state.myceliumLinks || []).filter(
    l => l.a === speciesId || l.b === speciesId
  ).length;
}

export function canCreateLink(state, speciesA, speciesB) {
  if (speciesA === speciesB) return false;
  if (!state.discoveredSpecies.includes(speciesA)) return false;
  if (!state.discoveredSpecies.includes(speciesB)) return false;
  if ((state.anomalyTokens || 0) < LINK_COST) return false;
  if (linkExists(state, speciesA, speciesB)) return false;
  if ((state.myceliumLinks || []).length >= MAX_LINKS) return false;
  if (getSpeciesLinkCount(state, speciesA) >= MAX_PER_SPECIES) return false;
  if (getSpeciesLinkCount(state, speciesB) >= MAX_PER_SPECIES) return false;
  return true;
}

export function createLink(state, speciesA, speciesB) {
  if (!canCreateLink(state, speciesA, speciesB)) return false;
  if (!state.myceliumLinks) state.myceliumLinks = [];
  state.myceliumLinks.push({ a: speciesA, b: speciesB });
  state.anomalyTokens -= LINK_COST;
  return true;
}

export function removeLink(state, speciesA, speciesB) {
  if (!state.myceliumLinks) return;
  state.myceliumLinks = state.myceliumLinks.filter(
    l => !((l.a === speciesA && l.b === speciesB) || (l.a === speciesB && l.b === speciesA))
  );
}

function isCrossChapter(speciesA, speciesB) {
  const sA = SPECIES[speciesA];
  const sB = SPECIES[speciesB];
  if (!sA || !sB) return false;
  return sA.chapter !== sB.chapter;
}

export function getMyceliumBonus(state) {
  const links = state.myceliumLinks || [];
  let bonus = 0;
  for (const link of links) {
    bonus += isCrossChapter(link.a, link.b) ? CROSS_CHAPTER_BONUS : SAME_CHAPTER_BONUS;
  }
  return bonus;
}

export function getNetworkStats(state) {
  const links = state.myceliumLinks || [];
  const connected = new Set();
  let sameChapter = 0;
  let crossChapter = 0;
  for (const link of links) {
    connected.add(link.a);
    connected.add(link.b);
    if (isCrossChapter(link.a, link.b)) crossChapter++;
    else sameChapter++;
  }
  return {
    totalLinks: links.length,
    sameChapterLinks: sameChapter,
    crossChapterLinks: crossChapter,
    connectedSpecies: connected.size,
  };
}
```

### Step 1.3: Run tests and verify they pass

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/mycelium.test.js
```

Expected: All tests PASS.

### Step 1.4: Commit

```bash
git add js/engine/mycelium.js tests/engine/mycelium.test.js
git commit -m "feat: add mycelium network engine with tests"
```

---

## Task 2: Ch3 Species & SVG Creatures

**Files:**
- Modify: `js/data/species.js`

### Step 2.1: Add Ch3 discoverable species to SPECIES object

- [ ] Add these 6 entries to `SPECIES` in `js/data/species.js`, before the closing `};`:

```js
  // ─── Chapter 3: Fungal Dominion ───
  sporecap: {
    id: 'sporecap', name: 'Sporecap', chapter: 3, type: 'flora', discoverable: true,
    desc: 'A mushroom that releases spores in rhythmic bursts.',
    quote: "It breathes. The mushroom breathes. Every few seconds, a puff of spores. I'm standing in a mushroom's exhale.",
    color: '#b8a040', production: 3.0,
  },
  glowshroom: {
    id: 'glowshroom', name: 'Glowshroom', chapter: 3, type: 'flora', discoverable: true,
    desc: 'A bioluminescent mushroom that pulses with green light.',
    quote: "It's a nightlight. Nature made a nightlight. Down here in the dark, that feels like a gift.",
    color: '#40f0a0', production: 4.0,
  },
  mycelworm: {
    id: 'mycelworm', name: 'Mycelworm', chapter: 3, type: 'fauna', discoverable: true,
    desc: 'A pale worm that travels through mycelium networks.',
    quote: "This worm uses the fungal network like a highway. It's commuting. Underground commuting.",
    color: '#d0c080', production: 3.5,
  },
  lichenveil: {
    id: 'lichenveil', name: 'Lichenveil', chapter: 3, type: 'flora', discoverable: true,
    desc: 'Curtains of pale lichen that hang from cavern walls.',
    quote: "It hangs like curtains. The cave has curtains now. Interior decorating by nature.",
    color: '#90b888', production: 2.5,
  },
  moldweaver: {
    id: 'moldweaver', name: 'Moldweaver', chapter: 3, type: 'microbe', discoverable: true,
    desc: 'A mold that weaves intricate fractal patterns as it grows.',
    quote: "The mold makes art. Better art than I could. I'm being outperformed by fungus.",
    color: '#708048', production: 2.8,
  },
  trufflekin: {
    id: 'trufflekin', name: 'Trufflekin', chapter: 3, type: 'fauna', discoverable: true,
    desc: 'A small truffle-shaped creature that burrows and hoards nutrients.',
    quote: "A truffle with legs. It collects things and hides them. We have a lot in common.",
    color: '#c08860', production: 3.2,
  },
```

### Step 2.2: Add Ch3 combination species

- [ ] Add 4 hybrid species to `SPECIES`:

```js
  sporeling: {
    id: 'sporeling', name: 'Sporeling', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['sporecap', 'driftspore'],
    desc: 'A floating mushroom fragment that drifts through cavern air.',
    quote: "A mushroom learned to fly. Or a spore learned to be a mushroom. Either way, it's showing off.",
    color: '#a898c0', production: 6.0,
  },
  glowthread: {
    id: 'glowthread', name: 'Glowthread', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['glowshroom', 'luminmoss'],
    desc: 'Bioluminescent threads that weave through rock and soil.',
    quote: "Glowing threads everywhere. The underground is wired for light now.",
    color: '#60f0a8', production: 7.0,
  },
  rootfungus: {
    id: 'rootfungus', name: 'Rootfungus', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['mycelworm', 'rootweaver'],
    desc: 'A symbiotic fusion of root and fungus, sharing nutrients both ways.',
    quote: "Root and fungus merged. They were already helping each other, now they're the same thing.",
    color: '#c09858', production: 8.0,
  },
  thornmold: {
    id: 'thornmold', name: 'Thornmold', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['moldweaver', 'thornsprout'],
    desc: 'Armored mold with defensive spikes. Touch it and regret it.',
    quote: "The mold grew thorns. Even fungus can learn to fight back. Noted.",
    color: '#608848', production: 5.5,
  },
```

### Step 2.3: Add Ch3 combination recipes

- [ ] Add to `COMBINATIONS` array in `js/data/species.js`:

```js
  { a: 'sporecap', b: 'driftspore', result: 'sporeling' },
  { a: 'glowshroom', b: 'luminmoss', result: 'glowthread' },
  { a: 'mycelworm', b: 'rootweaver', result: 'rootfungus' },
  { a: 'moldweaver', b: 'thornsprout', result: 'thornmold' },
```

### Step 2.4: Add SVG generation cases

- [ ] Add SVG generation cases to the `switch` statement in `generateSpeciesSVG`, before the `default:` case:

```js
    case 'sporecap':
      // Mushroom cap with spore puffs
      return `<g><ellipse cx="${cx}" cy="${cy-2}" rx="12" ry="7" fill="${c}" opacity="0.7"><animate attributeName="ry" values="7;8;7" dur="3s" repeatCount="indefinite"/></ellipse><rect x="${cx-2}" y="${cy+2}" width="4" height="10" rx="1" fill="#8a7030" opacity="0.6"/>${Array.from({length: 3}, (_, i) => {
        const sx = cx - 6 + i * 6;
        return `<circle cx="${sx}" cy="${cy-8}" r="1" fill="${c}" opacity="0.3"><animateTransform attributeName="transform" type="translate" values="0,0;${(i-1)*3},-8;0,0" dur="${2+i*0.5}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'glowshroom':
      // Bioluminescent mushroom with pulsing glow
      return `<g><ellipse cx="${cx}" cy="${cy-3}" rx="10" ry="6" fill="${c}" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/></ellipse><rect x="${cx-1.5}" y="${cy+1}" width="3" height="9" rx="1" fill="#30a070" opacity="0.5"/><circle cx="${cx}" cy="${cy-3}" r="14" fill="${c}" opacity="0.08"><animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/></circle></g>`;

    case 'mycelworm':
      // Pale worm weaving through mycelium threads
      return `<g><path d="M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"><animate attributeName="d" values="M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy};M${cx-14},${cy-1} Q${cx-7},${cy+5} ${cx},${cy-2} Q${cx+7},${cy-5} ${cx+14},${cy+1};M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy}" dur="2.5s" repeatCount="indefinite"/></path><circle cx="${cx+13}" cy="${cy}" r="1.5" fill="#f0e0a0" opacity="0.8"/><line x1="${cx-5}" y1="${cy+8}" x2="${cx+5}" y2="${cy+10}" stroke="#705830" stroke-width="0.8" opacity="0.3"/></g>`;

    case 'lichenveil':
      // Hanging curtain-like strands
      return `<g>${Array.from({length: 5}, (_, i) => {
        const lx = cx - 10 + i * 5;
        const len = 10 + (i % 3) * 4;
        return `<line x1="${lx}" y1="${cy-8}" x2="${lx + (i%2===0?2:-2)}" y2="${cy-8+len}" stroke="${c}" stroke-width="1.5" opacity="${0.3+i*0.1}" stroke-linecap="round"><animate attributeName="x2" values="${lx+(i%2===0?2:-2)};${lx+(i%2===0?-1:1)};${lx+(i%2===0?2:-2)}" dur="${3+i*0.4}s" repeatCount="indefinite"/></line>`;
      }).join('')}<line x1="${cx-12}" y1="${cy-8}" x2="${cx+12}" y2="${cy-8}" stroke="${c}" stroke-width="1" opacity="0.4"/></g>`;

    case 'moldweaver':
      // Fractal branching pattern
      return `<g>${Array.from({length: 4}, (_, i) => {
        const angle = (i/4)*Math.PI*2;
        const ex = cx + Math.cos(angle) * 12;
        const ey = cy + Math.sin(angle) * 10;
        const mx = cx + Math.cos(angle) * 6;
        const my = cy + Math.sin(angle) * 5;
        return `<path d="M${cx},${cy} L${mx},${my} L${ex},${ey}" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="${2+i*0.6}s" repeatCount="indefinite"/></path><circle cx="${ex}" cy="${ey}" r="1.5" fill="${c}" opacity="0.6"/>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="2.5" fill="${c}" opacity="0.7"/></g>`;

    case 'trufflekin':
      // Rotund body with tiny legs and stash
      return `<g><ellipse cx="${cx}" cy="${cy}" rx="8" ry="6" fill="${c}" opacity="0.7"/><ellipse cx="${cx}" cy="${cy+1}" rx="6" ry="4.5" fill="#d8a870" opacity="0.5"/>${Array.from({length: 4}, (_, i) => {
        const lx = cx - 5 + i * 3.3;
        return `<line x1="${lx}" y1="${cy+5}" x2="${lx}" y2="${cy+9}" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>`;
      }).join('')}<circle cx="${cx+3}" cy="${cy-2}" r="1" fill="#1a1a1a" opacity="0.7"/><animateTransform attributeName="transform" type="translate" values="0,0;1,0;0,0;-1,0;0,0" dur="2s" repeatCount="indefinite"/></g>`;

    case 'sporeling':
      // Floating mushroom fragment with spore trail
      return `<g><ellipse cx="${cx}" cy="${cy}" rx="8" ry="5" fill="#a898c0" opacity="0.6"/>${Array.from({length: 4}, (_, i) => `<circle cx="${cx-3+i*2}" cy="${cy+6+i*2}" r="${0.8+i*0.2}" fill="#b088f0" opacity="${0.4-i*0.08}"/>`).join('')}<rect x="${cx-1}" y="${cy+3}" width="2" height="4" fill="#8878a0" opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="3s" repeatCount="indefinite"/></g>`;

    case 'glowthread':
      // Weaving bioluminescent threads
      return `<g>${Array.from({length: 5}, (_, i) => {
        const y = cy - 8 + i * 4;
        const amp = (i % 2 === 0 ? 1 : -1) * 6;
        return `<path d="M${cx-15},${y} Q${cx},${y+amp} ${cx+15},${y}" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="${1.5+i*0.4}s" repeatCount="indefinite"/></path>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="3" fill="${c}" opacity="0.6"><animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/></circle></g>`;

    case 'rootfungus':
      // Fused root and fungus mass
      return `<g>${Array.from({length: 3}, (_, i) => {
        const angle = (i/3)*Math.PI*2 - Math.PI/2;
        const ex = cx + Math.cos(angle) * 12;
        const ey = cy + Math.sin(angle) * 10;
        return `<path d="M${cx},${cy} Q${cx+Math.cos(angle)*6},${cy+Math.sin(angle)*3} ${ex},${ey}" stroke="#c49348" stroke-width="2" fill="none" opacity="0.5"/><ellipse cx="${ex}" cy="${ey}" rx="4" ry="3" fill="${c}" opacity="0.6"><animate attributeName="opacity" values="0.6;0.9;0.6" dur="${2+i*0.5}s" repeatCount="indefinite"/></ellipse>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="4" fill="${c}" opacity="0.7"/></g>`;

    case 'thornmold':
      // Spiky mold cluster
      return `<g><circle cx="${cx}" cy="${cy}" r="7" fill="${c}" opacity="0.5"/>${Array.from({length: 6}, (_, i) => {
        const angle = (i/6)*Math.PI*2;
        const sx = cx + Math.cos(angle) * 7;
        const sy = cy + Math.sin(angle) * 7;
        const ex = cx + Math.cos(angle) * 13;
        const ey = cy + Math.sin(angle) * 13;
        return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="#3a8848" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>`;
      }).join('')}<animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/></g>`;
```

### Step 2.5: Add cross-chapter mycelium tests (now that Ch3 species exist)

- [ ] Add to `tests/engine/mycelium.test.js`, inside the `getMyceliumBonus` describe block:

```js
  it('returns 0.05 for one cross-chapter link', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'sporecap' }],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.05) < 0.001);
  });

  it('stacks mixed same-chapter and cross-chapter bonuses', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },      // same chapter: +3%
        { a: 'luminmoss', b: 'sporecap' },         // cross chapter: +5%
      ],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.08) < 0.001);
  });
```

### Step 2.6: Run full test suite to ensure no regressions

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/*.test.js
```

Expected: All tests PASS (existing + mycelium tests including cross-chapter).

### Step 2.7: Commit

```bash
git add js/data/species.js tests/engine/mycelium.test.js
git commit -m "feat: add 10 Ch3 fungal species with SVG creatures and combinations"
```

---

## Task 3: Ch3 Generators

**Files:**
- Modify: `js/data/generators.js`

### Step 3.1: Add Ch3 generators

- [ ] Add to `GENERATORS` in `js/data/generators.js`, before the closing `};`:

```js
  // ─── Chapter 3: Fungal Dominion ───
  fungalColony: {
    id: 'fungalColony', name: 'Fungal Colony', chapter: 3,
    baseCost: 2000000, costScaling: 1.15, baseOutput: 30000,
    flavor: "An entire civilization. Of mushrooms. They have politics.",
  },
  sporeDisperser: {
    id: 'sporeDisperser', name: 'Spore Disperser', chapter: 3,
    baseCost: 10000000, costScaling: 1.15, baseOutput: 120000,
    flavor: "It launches spores like tiny missiles. Biological warfare, but productive.",
  },
  myceliumEngine: {
    id: 'myceliumEngine', name: 'Mycelium Engine', chapter: 3,
    baseCost: 50000000, costScaling: 1.15, baseOutput: 500000,
    flavor: "The network itself generates energy. I plugged into the underground.",
  },
```

### Step 3.2: Commit

```bash
git add js/data/generators.js
git commit -m "feat: add 3 Ch3 fungal generators"
```

---

## Task 4: Ch3 Symbiosis Pairs

**Files:**
- Modify: `js/engine/symbiosis.js`

### Step 4.1: Add Ch3 synergy pairs

- [ ] Add to the `SYNERGIES` array in `js/engine/symbiosis.js`:

```js
  // Chapter 3 synergies
  { a: 'sporecap', b: 'glowshroom', bonus: 0.10, desc: '+10% all generator output', type: 'generatorMult' },
  { a: 'mycelworm', b: 'trufflekin', bonus: 0.08, desc: '+8% discovery chance', type: 'discoveryChance' },
  { a: 'lichenveil', b: 'fogbell', bonus: 0.06, desc: '+6% anomaly frequency', type: 'anomalyFreq' },
  { a: 'moldweaver', b: 'rootweaver', bonus: 0.12, desc: '+12% all generator output', type: 'generatorMult' },
```

### Step 4.2: Run symbiosis tests

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/symbiosis.test.js
```

Expected: All existing tests PASS.

### Step 4.3: Commit

```bash
git add js/engine/symbiosis.js
git commit -m "feat: add 4 Ch3 symbiosis pairs"
```

---

## Task 5: Ch3 Narrative

**Files:**
- Modify: `js/data/narrative.js`

### Step 5.1: Add Ch3 quote pools

- [ ] Add to `QUOTES` in `js/data/narrative.js`, after the `ch2Late` array:

```js
  // Chapter 3 quotes
  ch3Early: [
    "It's dark down here. But not empty.",
    "The ground above seems very far away now.",
    "Mushrooms. Everywhere, mushrooms. I'm outnumbered by fungi.",
    "Something glows in the dark. A mushroom. A friendly mushroom.",
    "The air smells like earth and old things growing.",
    "I think the mycelium is watching me. Can fungus watch?",
    "Everything is connected down here. By threads I can barely see.",
    "A worm just used a fungal highway. I'm not even the weirdest thing here.",
  ],
  ch3Mid: [
    "The network grows. I can almost feel it thinking.",
    "I connected two species through the mycelium. They seem... grateful?",
    "Underground, nothing is wasted. Everything feeds something else.",
    "The fungal colony has organized itself. Better than I organize anything.",
    "I'm building an underground internet. Made of mushrooms. Peak career achievement.",
    "The glow down here is beautiful. Bioluminescent everything.",
  ],
  ch3Late: [
    "The fog reaches even here. Even underground. There's no hiding from it.",
    "The network is strong. If anything survives the fog, it'll be the connections.",
    "I built something in the dark. Something that connects everything.",
    "When the fog comes, the mushrooms glow brighter. Defiant little things.",
  ],
```

### Step 5.2: Commit

```bash
git add js/data/narrative.js
git commit -m "feat: add Ch3 fungal narrative quotes"
```

---

## Task 6: Ch3 Objectives, Achievements & Chronicle

**Files:**
- Modify: `js/engine/progress.js`

### Step 6.1: Write failing tests for Ch3 progression

- [ ] Add tests to `tests/engine/chapter-progression.test.js`:

```js
describe('Ch3 objectives', () => {
  it('has 5 objectives for chapter 3', () => {
    const objs = getChapterObjectives(3);
    assert.equal(objs.length, 5);
  });

  it('ch3_discover4 checks for 4 Ch3 species', () => {
    const objs = getChapterObjectives(3);
    const obj = objs.find(o => o.id === 'ch3_discover4');
    const state = { discoveredSpecies: ['sporecap', 'glowshroom', 'mycelworm', 'lichenveil'] };
    assert.equal(obj.check(state), true);
  });

  it('ch3_mycelium3 checks for 3 mycelium links', () => {
    const objs = getChapterObjectives(3);
    const obj = objs.find(o => o.id === 'ch3_mycelium3');
    const state = { myceliumLinks: [{a:'a',b:'b'}, {a:'c',b:'d'}, {a:'e',b:'f'}] };
    assert.equal(obj.check(state), true);
  });

  it('ch3_combo checks for Ch3 combination', () => {
    const objs = getChapterObjectives(3);
    const obj = objs.find(o => o.id === 'ch3_combo');
    const state = { combinationsFound: ['sporeling'] };
    assert.equal(obj.check(state), true);
  });
});
```

- [ ] Run to verify failure:

```bash
cd /home/claude/idle-game && node --test tests/engine/chapter-progression.test.js
```

### Step 6.2: Add Ch3 objectives to CHAPTER_OBJECTIVES

- [ ] Add to `CHAPTER_OBJECTIVES` in `js/engine/progress.js`:

```js
  3: [
    { id: 'ch3_discover4', desc: 'Discover 4 Chapter 3 species', check: s => {
      const ch3Species = ['sporecap','glowshroom','mycelworm','lichenveil','moldweaver','trufflekin'];
      return s.discoveredSpecies.filter(id => ch3Species.includes(id)).length >= 4;
    }},
    { id: 'ch3_mycelium3', desc: 'Create 3 mycelium links', check: s => (s.myceliumLinks || []).length >= 3 },
    { id: 'ch3_earn5m', desc: 'Earn 5,000,000 TR in a single loop', check: s => s.trEarnedThisLoop >= 5000000 },
    { id: 'ch3_gens', desc: 'Own 3 of each Ch3 generator', check: s => ['fungalColony','sporeDisperser','myceliumEngine'].every(g => (s.generators[g] || 0) >= 3) },
    { id: 'ch3_combo', desc: 'Create a Ch3 combination species', check: s => {
      const ch3Combos = ['sporeling','glowthread','rootfungus','thornmold'];
      return (s.combinationsFound || []).some(id => ch3Combos.includes(id));
    }},
  ],
```

### Step 6.3: Add Ch3 achievements

- [ ] Add to the `getAchievementDefs()` return array in `js/engine/progress.js`:

```js
    // Discovery - Ch3
    { id: 'fullDominion', name: 'Full Dominion', desc: 'Discover all Ch3 species', category: 'discovery', check: s => ['sporecap','glowshroom','mycelworm','lichenveil','moldweaver','trufflekin'].every(id => s.discoveredSpecies.includes(id)) },
    { id: 'species18', name: 'Biodiversity Expert', desc: 'Discover 18 species', category: 'discovery', check: s => s.discoveredSpecies.length >= 18 },
    { id: 'combo7', name: 'Mad Scientist', desc: 'Create 7 combinations', category: 'discovery', check: s => (s.combinationsFound || []).length >= 7 },

    // Mycelium Network
    { id: 'firstLink', name: 'Network Node', desc: 'Create your first mycelium link', category: 'secret', check: s => (s.myceliumLinks || []).length >= 1 },
    { id: 'links10', name: 'Web Weaver', desc: 'Create 10 mycelium links', category: 'secret', check: s => (s.myceliumLinks || []).length >= 10 },

    // Economy - Ch3
    { id: 'tr1mLoop', name: 'Seven Figures', desc: 'Earn 1,000,000 TR in one loop', category: 'economy', check: s => s.trEarnedThisLoop >= 1000000 },
    { id: 'em1000', name: 'Echo Resonance', desc: 'Hold 1,000 Echo Matter', category: 'economy', check: s => s.echoMatter >= 1000 },

    // Chapter
    { id: 'ch3Complete', name: 'Fungal Lord', desc: 'Complete Chapter 3', category: 'chapter', check: s => s.chapter >= 4 },
```

### Step 6.4: Add Ch3 chronicle entries

- [ ] Add to the `ENTRIES` object inside `addChronicleEntry`:

```js
    chapter3Complete: "The network runs deeper than I realized. Every living thing is connected. Even me.",
    firstMyceliumLink: "I connected them. Underground, through the mycelium. They can share now. Resources, information... maybe even memories.",
    fungalReflection: "The darkness isn't empty. It's full of life I couldn't see. I just had to learn to look differently.",
```

### Step 6.5: Run chapter progression tests

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/chapter-progression.test.js
```

Expected: All tests PASS.

### Step 6.6: Commit

```bash
git add js/engine/progress.js tests/engine/chapter-progression.test.js
git commit -m "feat: add Ch3 objectives, achievements, and chronicle entries"
```

---

## Task 7: Ch3 Biome Visuals

**Files:**
- Modify: `js/ui/biome.js`

### Step 7.1: Add Ch3 cavern biome rendering

- [ ] In `renderBiome()` in `js/ui/biome.js`, restructure the chapter conditional to add Ch3. Change the `if (state.chapter >= 2)` block to:

```js
  if (state.chapter >= 3) {
    // Ch3: Fungal Dominion — dark cavern, bioluminescent fungi
    defs.innerHTML = `
      <radialGradient id="bg-glow" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#0a0f08"/>
        <stop offset="100%" stop-color="#050804"/>
      </radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
  } else if (state.chapter >= 2) {
    // Ch2: Garden — earthy browns and warm greens
    defs.innerHTML = `
      ...existing Ch2 gradient...
    `;
  } else {
    // Ch1: Primordial Soup — dark water
    defs.innerHTML = `
      ...existing Ch1 gradient...
    `;
  }
```

- [ ] Similarly, restructure the environment elements. Add a `Ch3` block above the existing `if (state.chapter >= 2)`:

```js
  if (state.chapter >= 3) {
    // Ch3: Stalactites
    for (let i = 0; i < 5; i++) {
      const sx = w * (0.1 + i * 0.2 + Math.sin(i * 1.8) * 0.03);
      const sLen = 15 + (i % 3) * 10;
      const stalactite = createSVG('path', {
        d: `M${sx-4},0 L${sx},${sLen} L${sx+4},0`,
        fill: 'rgba(80, 90, 70, 0.2)',
      });
      svgEl.appendChild(stalactite);
    }
    // Mushroom clusters on ground
    for (let i = 0; i < 4; i++) {
      const mx = w * (0.15 + i * 0.22);
      const my = h * (0.78 + Math.sin(i * 2.5) * 0.05);
      const cap = createSVG('ellipse', {
        cx: mx, cy: my - 4, rx: 6 + i * 2, ry: 3 + i,
        fill: `rgba(100, 180, 80, ${0.1 + i * 0.03})`,
      });
      const stem = createSVG('rect', {
        x: mx - 1.5, y: my - 2, width: 3, height: 6, rx: 1,
        fill: 'rgba(80, 120, 60, 0.1)',
      });
      svgEl.appendChild(stem);
      svgEl.appendChild(cap);
    }
    // Mycelium threads on ground
    for (let i = 0; i < 6; i++) {
      const tx1 = w * (0.05 + (i / 6) * 0.9);
      const ty = h * (0.82 + Math.sin(i * 3.2) * 0.06);
      const tx2 = tx1 + w * 0.15;
      const thread = createSVG('path', {
        d: `M${tx1},${ty} Q${(tx1+tx2)/2},${ty - 5 + (i%2)*10} ${tx2},${ty + 3}`,
        stroke: `rgba(100, 200, 80, ${0.06 + Math.random() * 0.06})`,
        'stroke-width': 0.8, fill: 'none',
      });
      svgEl.appendChild(thread);
    }
    // Bioluminescent floating spores
    for (let i = 0; i < 14; i++) {
      const dot = createSVG('circle', {
        cx: Math.random() * w, cy: Math.random() * h * 0.8,
        r: 0.5 + Math.random() * 1.2,
        fill: `rgba(80, 240, 160, ${0.06 + Math.random() * 0.08})`,
      });
      const anim = createSVG('animateTransform', {
        attributeName: 'transform', type: 'translate',
        values: `0,0;${(Math.random()-0.5)*6},${-2-Math.random()*6};0,0`,
        dur: `${4+Math.random()*5}s`, repeatCount: 'indefinite',
      });
      dot.appendChild(anim);
      svgEl.appendChild(dot);
    }
  } else if (state.chapter >= 2) {
    // ... existing Ch2 environment ...
  } else {
    // ... existing Ch1 environment ...
  }
```

### Step 7.2: Commit

```bash
git add js/ui/biome.js
git commit -m "feat: add Ch3 cavern biome with stalactites, mushrooms, and mycelium threads"
```

---

## Task 8: State Defaults & Economy Integration

**Files:**
- Modify: `js/engine/state.js`
- Modify: `js/engine/economy.js`

### Step 8.1: Add myceliumLinks to createState

- [ ] In `js/engine/state.js`, add `myceliumLinks: [],` to `createState()` return object, after the `flowBoostTargets` line.

Note: Do NOT add `myceliumLinks` to the `resetLoop()` function — links persist across loops.

### Step 8.2: Integrate mycelium bonus into production

- [ ] In `js/engine/economy.js`, add import at the top:

```js
import { getMyceliumBonus } from './mycelium.js';
```

- [ ] In `getTotalProduction()`, after the symbiosis bonus block, add:

```js
  // Mycelium network bonus
  const myceliumBonus = getMyceliumBonus(state);
  if (myceliumBonus > 0) total *= (1 + myceliumBonus);
```

### Step 8.3: Integrate mycelium bonus into EM calculation

- [ ] In `calcEchoMatter()`, after `achieveBonus` calculation, add:

```js
  const networkBonus = 1 + ((state.myceliumLinks || []).length * 0.02);
```

- [ ] Update the return to multiply by `networkBonus`:

```js
  return Math.floor(baseEm * chapterMult * echoAmpBonus * achieveBonus * networkBonus);
```

### Step 8.4: Run economy tests

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/economy.test.js
```

Expected: All existing tests PASS.

### Step 8.5: Commit

```bash
git add js/engine/state.js js/engine/economy.js
git commit -m "feat: integrate mycelium network bonus into production and EM calculation"
```

---

## Task 9: Mycelium Network UI

**Files:**
- Modify: `index.html`
- Modify: `css/game.css`
- Modify: `js/main.js`

### Step 9.1: Add mycelium section to Codex in index.html

- [ ] In `index.html`, after the `codex-synergies` div (line ~63), add:

```html
      <div id="codex-mycelium" style="display:none;"><h3>Mycelium Network</h3>
        <div id="mycelium-stats"></div>
        <div id="mycelium-species-picker" class="species-grid mini-grid"></div>
        <div id="mycelium-link-builder">
          <div id="mycelium-slots"><div id="mycelium-slot-a" class="combine-slot">?</div><span>&#8594;</span><div id="mycelium-slot-b" class="combine-slot">?</div></div>
          <button id="mycelium-link-btn" disabled>Link (5 ★)</button>
        </div>
        <div id="mycelium-links-list"></div>
      </div>
```

### Step 9.2: Add mycelium CSS styles

- [ ] Add to `css/game.css`:

```css
/* Mycelium Network */
#codex-mycelium h3 { color: #40f0a0; }
#mycelium-stats {
  font-size: 0.8rem; color: #8a9a7a; padding: 4px 8px;
  background: rgba(40, 80, 40, 0.1); border-radius: 6px; margin-bottom: 8px;
}
#mycelium-link-builder {
  display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 10px;
}
#mycelium-slots {
  display: flex; align-items: center; gap: 8px;
}
#mycelium-slots span { color: #40f0a0; font-size: 1.2rem; }
#mycelium-link-btn {
  background: rgba(40, 120, 60, 0.3); color: #40f0a0;
  border: 1px solid rgba(64, 240, 160, 0.3); border-radius: 6px;
  padding: 6px 16px; font-size: 0.85rem; cursor: pointer;
}
#mycelium-link-btn:disabled { opacity: 0.4; cursor: default; }
#mycelium-link-btn:not(:disabled):hover { background: rgba(40, 120, 60, 0.5); }
.mycelium-link-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 8px; font-size: 0.8rem; border-bottom: 1px solid rgba(64, 240, 160, 0.08);
}
.mycelium-link-row .link-bonus { color: #40f0a0; font-size: 0.75rem; }
.mycelium-link-row .link-remove {
  color: #f06060; cursor: pointer; font-size: 0.7rem; opacity: 0.5;
}
.mycelium-link-row .link-remove:hover { opacity: 1; }
.mini-grid {
  display: flex; flex-wrap: wrap; gap: 4px; padding: 4px;
  max-height: 80px; overflow-y: auto;
}
.species-card.mini {
  width: 36px; height: 36px; padding: 3px; cursor: pointer;
  border-radius: 4px; background: rgba(40, 80, 40, 0.15);
}
.species-card.mini:hover { background: rgba(40, 120, 60, 0.3); }
```

### Step 9.3: Wire mycelium UI in main.js

- [ ] Add imports at the top of `js/main.js`:

```js
import { canCreateLink, createLink, removeLink, getMyceliumBonus, getNetworkStats } from './engine/mycelium.js';
```

- [ ] Add mycelium slot state variables near the existing `combineSlotA/B`:

```js
let myceliumSlotA = null;
let myceliumSlotB = null;
```

- [ ] Add `renderMyceliumNetwork` function:

```js
function renderMyceliumNetwork() {
  const container = document.getElementById('codex-mycelium');
  if (!container) return;

  // Only show in Ch3+
  container.style.display = state.chapter >= 3 ? '' : 'none';
  if (state.chapter < 3) return;

  // Stats
  const stats = getNetworkStats(state);
  const bonus = getMyceliumBonus(state);
  const statsEl = document.getElementById('mycelium-stats');
  if (statsEl) {
    statsEl.innerHTML = `Links: ${stats.totalLinks}/15 | Bonus: +${(bonus * 100).toFixed(0)}% production | Connected: ${stats.connectedSpecies} species`;
  }

  // Links list
  const listEl = document.getElementById('mycelium-links-list');
  if (listEl) {
    const links = state.myceliumLinks || [];
    if (links.length === 0) {
      listEl.innerHTML = '<div style="color:#6a7a5a;font-size:0.8rem;padding:6px;">Select two species above to create a mycelium link...</div>';
    } else {
      listEl.innerHTML = links.map((link, idx) => {
        const sA = SPECIES[link.a];
        const sB = SPECIES[link.b];
        const cross = sA && sB && sA.chapter !== sB.chapter;
        return `<div class="mycelium-link-row"><span><span style="color:${sA?.color || '#fff'}">${sA?.name || link.a}</span> &#8594; <span style="color:${sB?.color || '#fff'}">${sB?.name || link.b}</span></span><span class="link-bonus">${cross ? '+5%' : '+3%'}</span><span class="link-remove" data-idx="${idx}">&#10005;</span></div>`;
      }).join('');

      // Attach remove handlers
      listEl.querySelectorAll('.link-remove').forEach(el => {
        el.addEventListener('pointerup', (e) => {
          e.stopPropagation();
          const idx = parseInt(el.dataset.idx);
          const link = state.myceliumLinks[idx];
          if (link) {
            removeLink(state, link.a, link.b);
            save(state);
            renderMyceliumNetwork();
          }
        });
      });
    }
  }
}
```

- [ ] Modify `selectForCombine` to also feed mycelium slots when in Ch3+. Better approach: add a separate `selectForMycelium` handler. In `renderCodex`, when chapter >= 3, species cards get a second click behavior for mycelium. To keep it simple, reuse the species grid — tapping a species when combine slots are full fills mycelium slots instead.

Actually, simpler: add a dedicated selection flow for mycelium. When mycelium section is visible, species cards in the grid have dual purpose. Add this logic:

- [ ] Add `selectForMycelium` function:

```js
function selectForMycelium(speciesId) {
  const species = SPECIES[speciesId];
  if (!species) return;

  const slotA = document.getElementById('mycelium-slot-a');
  const slotB = document.getElementById('mycelium-slot-b');
  const svgHtml = `<svg viewBox="0 0 60 60" width="40" height="40" xmlns="http://www.w3.org/2000/svg">${generateSpeciesSVG(speciesId, 60)}</svg>`;

  if (!myceliumSlotA) {
    myceliumSlotA = speciesId;
    slotA.innerHTML = svgHtml;
    slotA.classList.add('filled');
  } else if (!myceliumSlotB && speciesId !== myceliumSlotA) {
    myceliumSlotB = speciesId;
    slotB.innerHTML = svgHtml;
    slotB.classList.add('filled');
    const btn = document.getElementById('mycelium-link-btn');
    if (btn) btn.disabled = !canCreateLink(state, myceliumSlotA, myceliumSlotB);
  } else {
    myceliumSlotA = speciesId;
    myceliumSlotB = null;
    slotA.innerHTML = svgHtml;
    slotA.classList.add('filled');
    slotB.innerHTML = '?';
    slotB.classList.remove('filled');
    const btn = document.getElementById('mycelium-link-btn');
    if (btn) btn.disabled = true;
  }
}
```

- [ ] In `renderCodex`, the existing species card `pointerup` handler calls `selectForCombine`. Do NOT also call `selectForMycelium` from the same handler — the two selection flows would conflict (both advance their slots simultaneously). Instead, render a **second species picker** inside the mycelium section. In `renderMyceliumNetwork`, add a mini species grid specific to mycelium linking:

```js
  // Mini species picker for mycelium linking (inside renderMyceliumNetwork)
  const pickerEl = document.getElementById('mycelium-species-picker');
  if (pickerEl) {
    pickerEl.innerHTML = '';
    const discovered = state.discoveredSpecies || [];
    for (const speciesId of discovered) {
      const sp = SPECIES[speciesId];
      if (!sp) continue;
      const btn = document.createElement('div');
      btn.className = 'species-card mini';
      btn.innerHTML = `<svg viewBox="0 0 60 60" width="28" height="28" xmlns="http://www.w3.org/2000/svg">${generateSpeciesSVG(speciesId, 60)}</svg>`;
      btn.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        selectForMycelium(speciesId);
      });
      pickerEl.appendChild(btn);
    }
  }
```

This requires adding a `<div id="mycelium-species-picker"></div>` to the mycelium HTML section in index.html (see Step 9.1 update below).

- [ ] Add mycelium link button handler in `setupEventListeners`:

```js
  const myceliumLinkBtn = document.getElementById('mycelium-link-btn');
  if (myceliumLinkBtn) {
    myceliumLinkBtn.addEventListener('pointerup', () => {
      if (!myceliumSlotA || !myceliumSlotB) return;
      const success = createLink(state, myceliumSlotA, myceliumSlotB);
      if (success) {
        showToast('Mycelium link created!', 'achievement');

        // Check for first link chronicle
        if (state.myceliumLinks.length === 1) addChronicleEntry(state, 'firstMyceliumLink');

        // Check for first link achievement
        const newAch = checkAchievements(state);
        for (const ach of newAch) showToast(`Achievement: ${ach.name}`, 'achievement');

        save(state);
      } else {
        showToast('Cannot create this link', 'story');
      }

      // Reset slots
      myceliumSlotA = null;
      myceliumSlotB = null;
      document.getElementById('mycelium-slot-a').innerHTML = '?';
      document.getElementById('mycelium-slot-a').classList.remove('filled');
      document.getElementById('mycelium-slot-b').innerHTML = '?';
      document.getElementById('mycelium-slot-b').classList.remove('filled');
      document.getElementById('mycelium-link-btn').disabled = true;

      renderCodex();  // renderMyceliumNetwork is called from within renderCodex
    });
  }
```

- [ ] Call `renderMyceliumNetwork()` at the end of `renderCodex()`. Since all call sites already use `renderCodex()`, the network UI updates automatically everywhere — do NOT add separate `renderMyceliumNetwork()` calls elsewhere.

### Step 9.4: Update getRandomQuote for Ch3

- [ ] In `getRandomQuote` function in `main.js`, add Ch3 branch:

```js
function getRandomQuote(state) {
  const progress = getCatastropheProgress(state);
  let pool;
  if (state.chapter >= 3) {
    if (progress < 0.5) pool = QUOTES.ch3Early || QUOTES.early;
    else if (progress < 0.8) pool = QUOTES.ch3Mid || QUOTES.midLoop;
    else pool = QUOTES.ch3Late || QUOTES.lateLoop;
  } else if (state.chapter >= 2) {
    if (progress < 0.5) pool = QUOTES.ch2Early || QUOTES.early;
    else if (progress < 0.8) pool = QUOTES.ch2Mid || QUOTES.midLoop;
    else pool = QUOTES.ch2Late || QUOTES.lateLoop;
  } else {
    if (progress < 0.5) pool = QUOTES.early;
    else if (progress < 0.8) pool = QUOTES.midLoop;
    else pool = QUOTES.lateLoop;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
```

### Step 9.5: Add fungalReflection chronicle trigger

- [ ] In the discovery timer section of `gameLoop`, after the existing `allSpecies` chronicle check, add:

```js
        // Ch3 fungal reflection when 4+ Ch3 species discovered
        const ch3Found = state.discoveredSpecies.filter(id => ['sporecap','glowshroom','mycelworm','lichenveil','moldweaver','trufflekin'].includes(id)).length;
        if (ch3Found >= 4) addChronicleEntry(state, 'fungalReflection');
```

### Step 9.6: Commit

```bash
git add index.html css/game.css js/main.js
git commit -m "feat: add mycelium network UI, Ch3 quotes, and chronicle triggers"
```

---

## Task 10: Full Integration Test

**Files:**
- All test files

### Step 10.1: Run complete test suite

- [ ] Run:

```bash
cd /home/claude/idle-game && node --test tests/engine/*.test.js
```

Expected: ALL tests pass. Note the total count (should be previous 78 + new mycelium tests + new chapter progression tests).

### Step 10.2: Verify in browser

- [ ] Start nginx or serve the files:

```bash
# Files are served via nginx at https://claude.stevesinfo.com/idle-game/
# Just verify no console errors
```

- [ ] Checklist:
  - Species grid shows undiscovered Ch3 species when in Chapter 3
  - Ch3 generators appear in shop when chapter >= 3
  - Mycelium network section appears in Codex when chapter >= 3
  - Ch3 biome renders (dark cavern, stalactites, mushroom clusters)
  - Ch3 narrative quotes rotate when chapter >= 3
  - Mycelium links can be created and show bonus
  - Cross-chapter links show +5%, same-chapter show +3%
  - Achievements fire for first link
  - Chapter 3 objectives display correctly

### Step 10.3: Final commit

```bash
git add -A
git commit -m "feat: complete Phase 3 — Chapter 3 'Fungal Dominion' with mycelium network"
git push origin master
```

---

## Summary of New Content

| Category | Items |
|----------|-------|
| **New Mechanic** | Mycelium Network — player creates links between species (5 ★ per link, max 15 links, max 3 per species). Same-chapter: +3% prod, cross-chapter: +5% prod. Links persist across loops. |
| **Species** | 6 discoverable (sporecap, glowshroom, mycelworm, lichenveil, moldweaver, trufflekin) + 4 combinations (sporeling, glowthread, rootfungus, thornmold) |
| **Generators** | 3 (Fungal Colony 30k/s, Spore Disperser 120k/s, Mycelium Engine 500k/s) |
| **Symbiosis** | 4 new pairs |
| **Objectives** | 5 (discover 4 Ch3, create 3 links, earn 5M TR, own 3 each gen, create Ch3 combo) |
| **Achievements** | 8 new (Full Dominion, Biodiversity Expert, Mad Scientist, Network Node, Web Weaver, Seven Figures, Echo Resonance, Fungal Lord) |
| **Chronicle** | 3 entries (chapter3Complete, firstMyceliumLink, fungalReflection) |
| **Narrative** | 18 quotes (8 early, 6 mid, 4 late) |
| **Biome** | Dark cavern with stalactites, mushroom clusters, mycelium threads, bioluminescent particles |
| **Tests** | ~20 new tests for mycelium + chapter progression |
