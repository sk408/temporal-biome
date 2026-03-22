# Phase 2: Chapter 2 — "The First Garden"

## Overview

Phase 2 adds Chapter 2 content and the progression system to advance between chapters. The player should feel a meaningful transition from the dark primordial water world to a soil/grass/roots garden biome. Key new systems: chapter progression/transition, combination system depth, symbiosis bonuses, new generators, new species, and expanded narrative.

**Estimated scope:** ~8-10 tasks, buildable in 2-3 sessions.

---

## Prerequisites (from Phase 1)

All complete:
- [x] Core game loop, state, save/load
- [x] 5 generators, 5 multipliers, 6 automation, 7 permanent upgrades
- [x] 8 Ch1 species (5 discoverable + 3 combos)
- [x] 5 anomaly types including Temporal Rift
- [x] Marketplace with temporal tools
- [x] Catastrophe with visual warnings
- [x] 56 passing tests

---

## Task 1: Chapter Progression System

**Goal:** Allow players to complete Chapter 1 and advance to Chapter 2.

### Files to modify
- `js/engine/progress.js` — add `checkChapterComplete(state)`, `advanceChapter(state)`
- `js/ui/overlays.js` — add `showChapterTransition(chapter, callback)`
- `js/main.js` — wire chapter completion check into progress timer
- `css/game.css` — chapter transition overlay styles

### Details
- Chapter completion requires ALL 5 objectives complete
- Current Ch1 objectives: discover 3 species, earn 1k TR, own 10 generators, survive 2 catastrophes, earn 50 EM
- Update Ch1 objectives to match spec: discover 5 species, complete 3 loops, collect 500 TR, purchase 3 upgrades, tap 50 anomalies
- `advanceChapter(state)` increments `state.chapter`, resets chapter-specific objectives, triggers chronicle entry
- Chapter transition overlay: white flash → new chapter header fades in → protagonist reflection → tap to continue
- Update chapter header UI (title, subtitle, number) after transition

### Tests
- `checkChapterComplete` returns false when objectives incomplete
- `checkChapterComplete` returns true when all objectives complete
- `advanceChapter` increments chapter and resets objective tracking

---

## Task 2: Chapter 2 Generators

**Goal:** Add 3 new generators unlocked in Chapter 2.

### Files to modify
- `js/data/generators.js` — add Ch2 generators
- `js/engine/state.js` — update `createState` unlocked generators logic

### New generators (from spec)
| Generator | Base Cost | Base Output | Flavor |
|-----------|-----------|-------------|--------|
| Symbiotic Pair | 20,000 TR | 500/s | "They need each other. I get that now." |
| Garden Matrix | 100,000 TR | 2,000/s | "I organized the chaos. It's... organized chaos." |
| Growth Accelerator | 500,000 TR | 8,000/s | "Time moves differently near this thing." |

### Details
- Each has `chapter: 2` so they only appear in Ch2+
- Cost scaling: 1.15x per level (consistent with Ch1)
- Add milestone entries for new generators
- Generators unlock automatically when `state.chapter >= 2`

### Tests
- New generators cost and output calculations
- Generators hidden when `state.chapter < 2`

---

## Task 3: Chapter 2 Species & Combinations

**Goal:** Add 10 Chapter 2 species (6 discoverable + 4 combinations).

### Files to modify
- `js/data/species.js` — add Ch2 species definitions with procedural SVG

### New species (garden/growth themed)
**Discoverable (6):**
1. `rootweaver` — tangled root creature, brown/amber
2. `petalfly` — flying flower-petal insect, pink/white
3. `thornsprout` — defensive spiky plant, dark green
4. `dewdrop` — water-storing blobby organism, light blue
5. `soilmite` — tiny underground burrower, earthy orange
6. `vinerunner` — fast-growing vine with tiny eyes, green/yellow

**Combinations (4):**
1. `rootweaver` + `luminmoss` → `glowroot` (bioluminescent root network)
2. `petalfly` + `driftspore` → `pollenswarm` (cloud of pollinating spores)
3. `thornsprout` + `copperlichen` → `ironbark` (metal-encrusted tree)
4. `dewdrop` + `poolworm` → `tidecrawler` (amphibious water creature)

### Details
- Each species needs: id, name, chapter, discoverable, color, desc, quote, type
- Each needs `generateSpeciesSVG` case with procedural SVG (circles, paths, curves)
- Combinations need recipe entries in COMBINATIONS array
- Cross-chapter combinations (using Ch1 ingredients) are key to the depth

### Tests
- All Ch2 species exist in SPECIES object
- Combination recipes produce correct results
- Species only discoverable when `state.chapter >= 2`

---

## Task 4: Symbiosis Bonuses

**Goal:** Discovered species passively boost production based on pairs.

### Files to create/modify
- `js/engine/symbiosis.js` — new module for symbiosis calculations
- `js/engine/economy.js` — integrate symbiosis into `getTotalProduction`
- `js/data/species.js` — add `synergies` data to species

### Details
- Each discovered species gives a small passive TR bonus (1-5/s base)
- Specific pairs give synergy bonus when both discovered:
  - `luminmoss` + `driftspore` → +10% all generator output
  - `poolworm` + `fogbell` → +5% anomaly frequency
  - `rootweaver` + `soilmite` → +15% Ch2 generator output
  - `petalfly` + `dewdrop` → +10% discovery chance
- `getSymbiosyBonus(state)` returns a multiplier applied in `getTotalProduction`
- Show active synergies in Codex panel

### Tests
- `getSymbiosisBonus` returns 1.0 with no synergies
- Returns correct bonus when synergy pair discovered
- Multiple synergies stack correctly

---

## Task 5: Chapter 2 Biome Visual

**Goal:** Ch2 biome has a garden/soil aesthetic distinct from Ch1.

### Files to modify
- `js/ui/biome.js` — add chapter-conditional rendering in `renderBiome`

### Details
- Ch1: Dark water, rocks, puddles (current)
- Ch2: Soil ground, grass tufts, root tendrils, warmer palette
- Background gradient: `#1a1408` to `#0f0a04` (earthy dark browns)
- Ground elements: grass blades (green lines), soil mounds (brown ellipses)
- Ambient particles: floating pollen (yellow-green dots) instead of water dots
- Species placement remains the same algorithm, just different backdrop
- Use `state.chapter` to select which backdrop to render

### Tests
- None (visual only, tested by eye)

---

## Task 6: Chapter 2 Objectives & Narrative

**Goal:** Define Ch2 objectives and add narrative content.

### Files to modify
- `js/engine/progress.js` — add Ch2 objectives
- `js/data/narrative.js` — add Ch2 quotes and chronicle entries

### Chapter 2 Objectives
1. Discover 4 Chapter 2 species
2. Create 2 combinations
3. Earn 50,000 TR in a single loop
4. Own 5 of each Ch2 generator
5. Achieve a symbiosis bonus

### Chapter 2 Narrative
- Subtitle: "Can things grow together, or only apart?"
- 10 new quotes (garden/growth themed)
- 4 new chronicle entries:
  - `firstCombination` — "I put two things together and got... a third thing."
  - `firstSynergy` — "They're helping each other. Without me telling them to."
  - `gardenReflection` — "It's not a puddle anymore. It's a garden."
  - `chapter2Complete` — "The garden is full. But I can feel something under the soil..."

### Tests
- Ch2 objectives return correct count
- Ch2 objectives can be checked/completed

---

## Task 7: Expanded Achievements

**Goal:** Add Chapter 2 and cross-chapter achievements.

### Files to modify
- `js/engine/progress.js` — add new achievement definitions

### New Achievements (~15)
**Discovery:**
- "First Combination" — create your first combination
- "Combination Chef" — create 5 combinations
- "Cross-Pollinator" — combine species from different chapters
- "Full Garden" — discover all Ch2 species

**Economy:**
- "Five Figures" — earn 10,000 TR in one loop
- "Six Figures" — earn 100,000 TR in one loop
- "Market Regular" — buy 10 marketplace items
- "Echo Hoarder" — hold 500 EM at once

**Loop:**
- "Loop Veteran" — complete 10 loops
- "Loop Master" — complete 25 loops

**Tapping:**
- "Rift Walker" — tap a Temporal Rift
- "Market Maven" — buy from both permanent and rotating stock in one loop

**Chapter:**
- "Chapter 2 Complete" — advance to Chapter 3
- "Speed Reader" — complete Ch1 in under 30 minutes

**Secret:**
- "Symbiosis" — discover your first species synergy

### Tests
- New achievements can be triggered
- Achievement conditions checked correctly

---

## Task 8: Chapter Transition Polish

**Goal:** Make the transition between chapters feel impactful.

### Files to modify
- `js/main.js` — chapter header update logic
- `js/ui/renderer.js` — update chapter title/subtitle display
- `css/game.css` — transition animation

### Details
- When chapter advances:
  1. White flash overlay (0.5s)
  2. "Chapter 2" text fades in with glow
  3. "The First Garden" subtitle appears
  4. Protagonist quote: "The puddles are drying up. Something else is growing."
  5. Tap to continue
- All shop panels refresh with new generators
- Biome re-renders with Ch2 aesthetic
- Achievement toast: "Chapter 2 Complete" (or "Chapter 1 Complete")
- Chapter header in UI updates

---

## Task 9: Balance Pass

**Goal:** Ensure pacing feels right across Ch1→Ch2 progression.

### Details
- Ch1 should take ~1 hour of casual play to complete all objectives
- Catastrophe timer: 8 min base (Ch1), 10 min base (Ch2)
- EM economy: player should have ~200-500 EM when reaching Ch2
- Ch2 generators should feel like a significant power jump but not trivialize Ch1 generators
- Verify EM formula gives expected values per spec
- Marketplace prices should be affordable but meaningful
- Run full playtest: start fresh, complete Ch1, enter Ch2, play 30+ min
- Adjust costs/rates based on playtest

### Key balance targets (from spec)
- Ch1 early: 5-15 EM per loop
- Ch1 late: 30-60 EM per loop
- Ch2 generators: ~4x output vs Ch1 top tier
- Ch2 catastrophe: 10 min base

---

## Task 10: Tests & QA

**Goal:** Comprehensive test coverage for Phase 2 features.

### New test files
- `tests/engine/symbiosis.test.js`
- `tests/engine/chapter-progression.test.js`

### Test targets
- Chapter progression: advance, objective reset, generator unlock
- Symbiosis: bonus calculation, pair detection
- New species: all exist, combinations work
- New generators: costs, outputs
- New achievements: conditions, triggers
- State save/load: Ch2 state persists correctly

### Target: 75+ total tests passing

---

## Implementation Order

```
Task 1 (Chapter Progression) ─┐
                               ├── can run in parallel
Task 2 (Ch2 Generators) ──────┘

Task 3 (Ch2 Species) ─────────┐
                               ├── can run in parallel
Task 4 (Symbiosis) ───────────┘

Task 5 (Ch2 Biome Visual) ────── depends on Task 3

Task 6 (Objectives & Narrative) ── depends on Tasks 1, 3

Task 7 (Achievements) ──────── depends on Tasks 1, 3, 4

Task 8 (Chapter Transition) ── depends on Tasks 1, 5, 6

Task 9 (Balance Pass) ──────── depends on ALL above

Task 10 (Tests & QA) ─────── depends on ALL above
```

### Parallel execution plan
- **Batch 1:** Tasks 1 + 2 (in parallel)
- **Batch 2:** Tasks 3 + 4 (in parallel)
- **Batch 3:** Tasks 5 + 6 + 7 (in parallel, with dependencies from batch 1-2)
- **Batch 4:** Task 8 (chapter transition polish)
- **Batch 5:** Tasks 9 + 10 (balance and QA)

---

## Architecture Notes

### State changes for Ch2
No new top-level state fields needed. Existing fields handle it:
- `state.chapter` already supports values > 1
- `state.generators` supports any generator keys
- `state.discoveredSpecies` supports any species IDs
- `state.combinationsFound` tracks combo history
- `state.chapterObjectives` resets per chapter
- `state.marketRotationSeed` refreshes per loop

### Module boundaries
- Species data stays in `js/data/species.js` (grows per chapter)
- Generator data stays in `js/data/generators.js` (grows per chapter)
- New `js/engine/symbiosis.js` handles species synergy calculations
- Chapter progression logic in `js/engine/progress.js`
- Biome visuals branch on `state.chapter` in `js/ui/biome.js`

### Save compatibility
- Existing saves will load fine — `{ ...defaults, ...saved }` merge handles missing Ch2 fields
- Players in Ch1 see no change until they complete all objectives
