# Temporal Biome — Game Design Specification

## 1. Concept

You are a confused, ordinary person trapped in a time loop. Each cycle, an ecosystem grows around you — strange plants, impossible creatures, glowing spores. Then a catastrophe wipes everything out and you wake up again. But you remember. Each loop, you understand a little more. Each loop, you get a little further.

**Genre:** Idle / incremental web game with narrative progression
**Platform:** Mobile-first web app (smartphone browser)
**Tech:** Vanilla HTML + CSS + JS, procedural SVG creatures, CSS particle effects, no external dependencies
**Pacing:** First hour yields many achievements. Full game completion ~1 week of casual play.
**Tone:** Mysterious and atmospheric, with natural humor from the bewildered protagonist. The player character doesn't understand science but intuitively grasps the time loop.

---

## 2. Core Loop

```
┌──────────────────────────────────────────────┐
│                  THE LOOP                     │
│                                               │
│  Observe → Intervene → Discover → Grow → ...  │
│          ↑                              │     │
│          │     CATASTROPHE              │     │
│          └──────────────────────────────┘     │
│                                               │
│  Retained: Knowledge, Echo Matter, Codex,     │
│            Permanent Upgrades, Story Progress  │
└──────────────────────────────────────────────┘
```

### 2.1 Within a Loop

1. **Ecosystem auto-grows** — species appear, interact, produce resources
2. **Player observes** — watches the biome, spots events, reads protagonist commentary
3. **Player taps anomalies** — glowing shapes appear periodically for bonus rewards
4. **Player buys upgrades** — scaling generators, multipliers, automation
5. **Player discovers** — new species found through time, combinations, and chapter progress
6. **Player intervenes** — redirect rivers, introduce predators, remove invasives (unlocked mid-game)
7. **Catastrophe builds** — visual warnings escalate until the loop resets

### 2.2 Between Loops

- **Loop Summary** — what you earned, what you discovered
- **Echo Matter** — meta-currency banked based on loop performance
- **Permanent upgrades** — spend Echo Matter on cross-loop progression
- **Story beat** — protagonist reflects, new chronicle entry

### 2.3 Catastrophe Mechanics

- **Early game (Ch 1-3):** Catastrophes are FORCED. Timer-based, visible countdown. Player has zero control. "Here we go again."
- **Mid game (Ch 4-5):** Player VERY RARELY unlocks the ability to trigger a loop manually. This is a major milestone, not a routine button. Earned through specific achievement chains.
- **Late game (Ch 6-7):** Player works toward PREVENTING catastrophes entirely. This is the endgame mystery.

### 2.4 Catastrophe Timer Durations

| Chapter | Base Timer | With Max Upgrades |
|---------|-----------|-------------------|
| 1 | 8 minutes | ~10 minutes |
| 2 | 10 minutes | ~14 minutes |
| 3 | 12 minutes | ~18 minutes |
| 4 | 15 minutes | ~25 minutes |
| 5 | 18 minutes | ~30 minutes |
| 6 | 22 minutes | ~40 minutes |
| 7 | 30 minutes | Preventable |

The timer is visible as a subtle progress bar that becomes more ominous (color shift, pulsing) as it fills. At 75%, warning text appears. At 90%, screen tinting and ambient shake begin. Timer does NOT progress while the app is backgrounded.

### 2.5 Catastrophe Types (Chapter 3+)

Early chapters have only one catastrophe type (Fog Wipe — full reset). Starting in Chapter 3, catastrophe types are introduced:

| Type | Effect | Visual | First Appears |
|------|--------|--------|---------------|
| **Fog Wipe** | Full TR reset, all generators reset | Purple fog rolls in | Ch 1 |
| **Temporal Storm** | Resets generators but keeps 25% of TR | Lightning, screen flicker | Ch 3 |
| **Erosion** | Halves all production rates for next loop (stacks) | Ground crumbles, brown overlay | Ch 4 |
| **Spore Plague** | Disables one random species for next loop | Green toxic clouds | Ch 5 |
| **Crystal Fracture** | Resets chapter-specific resources only | Shattering glass effect | Ch 6 |

The catastrophe type for each loop is determined randomly (weighted toward Fog Wipe). The "Fog Reading" intervention reveals the upcoming type.

### 2.6 Loop Reset Rules

**RESETS every loop:**
- Temporal Residue (TR) — to zero (modified by Residual Memory permanent upgrade)
- All generator counts — to zero (modified by Generator Blueprint permanent upgrade)
- All TR-cost multiplier levels (Sharp Eyes, Ecosystem Harmony, etc.)
- All TR-cost automation purchases (Auto-Collectors, Anomaly Magnet, etc.)
- Catastrophe timer — to zero
- Intervention cooldowns — to zero (fresh start)
- Species present in biome — biome starts empty, species re-populate as discovered species auto-appear
- Active buff timers (Temporal Tools, Nurture Pulse, etc.)

**PERSISTS across loops (permanent):**
- Echo Matter (EM)
- Anomaly Tokens
- Memory Shards
- Discovered species (Codex entries)
- Combinations found
- Species upgrade tree progress (Ch 3+)
- All EM-cost permanent upgrades
- Chronicle entries
- Achievements
- Chapter progress and objectives completed
- Chapter-specific resources (Mycelium Threads, etc.)
- Marketplace rotation seed (refreshes per loop, but unlocked tiers persist)
- Total stats (lifetime TR earned, total loops, total play time)

**KEY RULE:** If it costs TR, it resets. If it costs EM or is a discovery, it persists.

---

## 3. Chapter Structure

The game is divided into 7 Chapters, each an ERA the loop sends you to. Each chapter has:
- A unique biome aesthetic (color palette, terrain, ambient creatures)
- A narrative question to answer
- Chapter-specific objectives
- New mechanics introduced
- New buyable categories unlocked
- A boss-like "Chapter Trial" to complete

### Chapter Overview

| Ch | Name | Theme | Biome | New Mechanic | Approx Duration |
|----|------|-------|-------|--------------|-----------------|
| 1 | Primordial Soup | Origins | Dark water, rocks, puddles | Basic tapping, generators, species discovery | ~1 hour |
| 2 | The First Garden | Growth | Soil, grass, roots | Combination system, symbiosis bonuses | ~2-3 hours |
| 3 | Fungal Dominion | Networks | Mushroom forests, mycelium | Species upgrade trees, intervention system | ~3-4 hours |
| 4 | The Coral Epoch | Complexity | Underwater reefs, bioluminescence | Manual loop trigger (rare unlock), synergy chains | ~4-5 hours |
| 5 | Thornveil Jungle | Danger | Dense canopy, predators, thorns | Ecosystem balance, risk/reward species, invasives | ~4-5 hours |
| 6 | The Crystalline Age | Precision | Crystal formations, refracted light | Temporal tools, catastrophe manipulation | ~5-6 hours |
| 7 | The Last Loop | Resolution | All biomes merged, unstable | Catastrophe prevention, final mystery | ~6-8 hours |

### Chapter Progression

Each chapter has 3-5 objectives that must be completed to advance. Objectives are visible from the start of each chapter but future chapters are NOT revealed (no spoilers).

Example — Chapter 1 objectives:
- Discover 5 species
- Complete 3 loops
- Collect 500 Temporal Residue
- Purchase 3 upgrades
- Tap 50 anomalies

Completing all objectives triggers a dramatic chapter transition (screen whites out, new era fades in, protagonist reflects).

### Narrative Questions (per chapter)

1. "Why do I keep waking up here?"
2. "Can things grow together, or only apart?"
3. "What connects everything underground?"
4. "Am I changing the loop, or is it changing me?"
5. "What happens when the ecosystem fights back?"
6. "Can I see the catastrophe before it sees me?"
7. "What if I just... don't let it end?"

---

## 4. The Endgame

### 4.1 The Final Mystery

Throughout chapters 1-6, the player collects "Memory Shards" — story fragments that reveal WHY the loop exists. The catastrophe isn't random; it's a defense mechanism. The ecosystem is a test. The fog is a reset function built by... something.

Chapter 7 combines all biomes into one unstable super-ecosystem. The player must:
1. **Balance all 6 biome types simultaneously** — maintain ecosystem balance (no biome exceeding 30% affinity) for 10 consecutive minutes. Shown as a hexagonal radar chart.
2. **Achieve production thresholds** — reach 1M TR/s total production across all generators.
3. **Complete 7 Temporal Equations** — each equation requires sustaining a specific resource ratio for 60 seconds:
   - Equation 1: TR production ≥ 10x EM reserves (growth outpaces savings)
   - Equation 2: All Chapter 1 generators at 100+ (remember your roots)
   - Equation 3: 3 synergy chains active simultaneously
   - Equation 4: Ecosystem balance within 5% (near-perfect equilibrium)
   - Equation 5: Earn 1000 AT in a single loop (anomaly mastery)
   - Equation 6: All 70 species discovered
   - Equation 7: Prevent a catastrophe using only interventions (no temporal tools)
   Each completed equation "stabilizes" one biome permanently (it stops contributing to catastrophe pressure). Completing all 7 makes the final step possible.
4. **Prevent 3 consecutive catastrophes** — using Temporal Anchor, Catastrophe Shield, and ecosystem stability.
5. **Trigger the "Final Intervention"** — a one-time button that appears only when all equations are solved and 3 catastrophes have been prevented. Breaking the loop.

### 4.2 Ending

When the loop breaks, the protagonist gets a final chronicle entry. The ecosystem stabilizes. A "post-game" mode unlocks: infinite prestige layers, cosmetic biome customization, achievement hunting. But the story is complete.

### 4.3 Victory Screen

Shows total stats: loops survived, species discovered, time played, achievements earned. A "share" button generates a shareable summary image.

### 4.4 Post-Game

- All chapters accessible as "free play" biomes
- Endless prestige layers with escalating multipliers
- Cosmetic unlocks (biome color themes, creature variants, fog styles)
- Hidden achievements revealed only after beating the game
- A "New Game+" mode with accelerated progression and harder catastrophes

---

## 5. Resource System

### 5.1 Primary Resources

| Resource | Earned By | Used For | Persists Across Loops? |
|----------|-----------|----------|----------------------|
| **Temporal Residue (TR)** | Tapping, generators, anomalies | Buying upgrades, marketplace items | NO — reset each loop |
| **Echo Matter (EM)** | Loop completion (formula below) | Permanent upgrades, prestige shop | YES |
| **Species Fragments** | Discovering species, anomaly rare drops | Unlocking species in Codex, combination ingredients | YES (Codex is permanent) |
| **Memory Shards** | Chapter milestones, hidden achievements | Story progression, final chapter requirements | YES |
| **Anomaly Tokens** | Tapping anomalies (rare drop) | Marketplace rare items, temporal tools | YES |

### 5.2 Echo Matter Formula

EM earned at loop end:
```
base_em = floor(TR_earned_this_loop / 500)
         + (new_species_discovered_this_loop * 10)
         + (objectives_completed_this_loop * 25)
         + (anomaly_tokens_earned * 2)

chapter_multiplier = chapter_number * 1.5
echo_amplifier_bonus = 1 + (0.2 * echo_amplifier_level)
achievement_bonus = 1 + (0.01 * total_achievements_earned)

final_em = floor(base_em * chapter_multiplier * echo_amplifier_bonus * achievement_bonus)
```

Expected EM per loop:
- Chapter 1, early: 5-15 EM per loop
- Chapter 1, late: 30-60 EM per loop
- Chapter 3: 200-500 EM per loop
- Chapter 5: 2,000-5,000 EM per loop
- Chapter 7: 20,000-100,000 EM per loop

The "Crystallize" intervention converts TR to EM mid-loop at a rate of 50:1 (better than the loop-end rate of ~500:1), rewarding players who time it strategically before catastrophe.

### 5.3 Chapter-Specific Resources (unlocked per chapter)

| Chapter | Resource | Source | Use |
|---------|----------|--------|-----|
| 3 | Mycelium Threads | Fungal generators | Upgrade fungal species, build networks |
| 4 | Coral Essence | Reef generators, synergy bonuses | Unlock synergy chains, craft items |
| 5 | Thorn Sap | Risk/reward species, dangerous anomalies | Power high-risk upgrades |
| 6 | Crystal Resonance | Precision generators, temporal tools | Manipulate catastrophe timing |

---

## 6. Buyables & Upgrades (The Deep Economy)

This is the heart of the game. There should ALWAYS be something meaningful to buy.

### 6.1 Generators (Scaling, Infinite Tiers)

Each generator can be purchased unlimited times. Cost scales by a multiplier per level (typically 1.15x). Each produces TR per second.

**Chapter 1 Generators:**

| Generator | Base Cost | Base Output | Flavor |
|-----------|-----------|-------------|--------|
| Moss Patch | 10 TR | 0.5/s | "It grows. That's... something." |
| Puddle Farm | 50 TR | 2/s | "I'm farming puddles now. This is my life." |
| Spore Colony | 250 TR | 8/s | "They float upward. I try not to breathe." |
| Root Cluster | 1,000 TR | 30/s | "The roots hum. I don't want to know why." |
| Primordial Engine | 5,000 TR | 120/s | "I built this? I BUILT this??" |

**Chapter 2 adds:** Symbiotic Pair (500/s), Garden Matrix (2K/s), Growth Accelerator (8K/s)
**Chapter 3 adds:** Mycelium Web (30K/s), Fungal Reactor (120K/s), Spore Cannon (500K/s)
**...and so on per chapter, with each tier producing ~4x the previous**

**Cross-chapter generator model:** All generators from previous chapters remain available once unlocked. Earlier generators stay relevant through milestone bonuses and synergies (e.g., having 100 Moss Patches gives a global +5% bonus to all generators). All generator COUNTS reset to zero each loop (modified by Generator Blueprint permanent upgrade), but the generator TYPES remain unlocked. This means early each loop, the player is re-buying cheap early generators while saving for expensive later ones — creating purchasing decisions every loop.

Each generator also has **milestone bonuses** at quantities 10, 25, 50, 100, 200, 500:
- 10 owned: +100% output for that generator
- 25 owned: Unlocks a passive bonus (e.g., "+5% to all Chapter 1 generators")
- 50 owned: Visual upgrade (generator looks different in biome)
- 100 owned: Unlocks a unique achievement
- 200 owned: +500% output
- 500 owned: Unlocks a synergy with another generator

### 6.2 Multipliers (Repeatable Purchases)

| Upgrade | Base Cost | Effect | Max Level | Cost Scaling |
|---------|-----------|--------|-----------|-------------|
| Sharp Eyes | 100 TR | +10% tap value | ∞ | 1.5x |
| Ecosystem Harmony | 500 TR | +15% all generator output | ∞ | 1.8x |
| Temporal Sensitivity | 200 TR | +20% anomaly frequency | 20 | 2.0x |
| Déjà Vu | 1,000 TR | +50 flat TR at loop start (stacks) | ∞ | 1.6x |
| Species Affinity | 300 TR | +10% discovery chance | 30 | 1.4x |

### 6.3 Automation Upgrades

| Upgrade | Cost | Effect |
|---------|------|--------|
| Harvester Mk I | 500 TR | Auto-taps anomalies you miss (50% value) |
| Harvester Mk II | 5,000 TR | Auto-taps anomalies (75% value) |
| Harvester Mk III | 50,000 TR | Auto-taps anomalies (100% value) |
| Anomaly Magnet | 2,000 TR | Anomalies appear 50% more often |
| Offline Beacon | 25,000 TR | Generators produce at 100% offline (instead of 50%) |
| Discovery Drone | 10,000 TR | Discovers species 2x faster |

### 6.4 Permanent Upgrades (Echo Matter — persist across loops)

| Upgrade | Cost (EM) | Effect |
|---------|-----------|--------|
| Residual Memory I-X | 10-1000 EM | Start each loop with X% of previous TR |
| Echo Amplifier I-V | 25-500 EM | +20% Echo Matter earned per loop |
| Species Instinct I-V | 50-250 EM | Species discovered 25% faster |
| Generator Blueprint I-III | 100-500 EM | Generators start at level 5/10/25 |
| Catastrophe Insight I-III | 200-1000 EM | See catastrophe timer earlier |
| Loop Déjà Vu | 500 EM | Unlock manual loop trigger (Ch 4+ only) |
| Chronicle Expansion I-III | 75-300 EM | More story fragments unlock |
| Market Connections I-III | 100-400 EM | Better marketplace offerings |

### 6.5 Marketplace (Rotating + Permanent)

**Permanent stock** (always available):
- Basic species seeds
- Standard multipliers
- Automation tier unlocks

**Rotating stock** (refreshes each loop, 3-5 items):
- Rare species seeds (chapter-specific)
- Temporal Tools (one-time-use: "Skip 30s of catastrophe timer", "Double all production for 60s", "Discover a random species instantly")
- Skill Books (unlock intervention types)
- Cosmetics (biome color accents, creature glow effects)

**Marketplace currency:** TR for basic items, Anomaly Tokens for rare items, EM for permanent items.

### 6.6 Species Upgrade Trees (Chapter 3+)

Each discovered species becomes upgradable:
```
Luminmoss Lv.1
├── Brighter Glow (+50% Luminmoss TR output)
├── Spread Rate (+1 Luminmoss generated per loop)
└── Symbiosis: Driftspore (both produce +25% when coexisting)
    └── Deep Symbiosis (+50% and unlock combination: Glowspore)
```

---

## 7. Active Interaction: Anomaly Tapping

### 7.1 Anomaly Types

Anomalies are glowing shapes that appear in the biome at random positions. They fade in, pulse for 3-8 seconds, then fade out if not tapped.

| Shape | Color | Reward | Frequency |
|-------|-------|--------|-----------|
| Circle | Teal | TR (1x-5x tap value) | Common (every 5-10s) |
| Star | Gold | Anomaly Token + TR | Uncommon (every 30-60s) |
| Hexagon | Purple | Species Fragment | Rare (every 2-5 min) |
| Diamond | White | Memory Shard piece | Very Rare (every 10-30 min) |
| Temporal Rift | Rainbow pulse | Random mega-reward | Ultra Rare (every 1-2 hours) |

### 7.2 Anomaly Bursts & Chains

Multiple anomalies can exist simultaneously. Periodically (every 30-90 seconds), an "anomaly burst" spawns 3-6 anomalies at once, creating chain opportunities. Tapping anomalies within 3 seconds of each other builds a chain multiplier:

- 2-chain: 1.5x rewards
- 3-chain: 2x rewards
- 5-chain: 3x rewards
- 10-chain: 5x rewards + bonus achievement

Bursts become more frequent with the "Temporal Sensitivity" multiplier and "Anomaly Magnet" automation. The anomaly burst is the primary active engagement mechanic — it creates exciting "tap fast!" moments punctuating the otherwise contemplative gameplay.

### 7.3 Scaling

Anomaly rewards scale with:
- Player's tap multiplier upgrades
- Current chapter (base values increase per chapter)
- Chain multiplier
- Active temporal tools

---

## 8. Species & Combinations

### 8.1 Species Count

- Chapter 1: 8 species (5 discoverable by time, 3 by combination)
- Chapter 2: 10 species (6 + 4 combinations)
- Chapter 3: 12 species (7 + 5 combinations)
- Chapter 4: 12 species (7 + 5 combinations)
- Chapter 5: 10 species (6 + 4 combinations)
- Chapter 6: 10 species (5 + 5 combinations)
- Chapter 7: 8 species (3 + 5 combinations, using cross-chapter ingredients)
- **Total: 70 species**

### 8.2 Species Discovery Mechanic

Every 45 seconds (base rate), a discovery check runs:
- Base discovery chance: 15%
- Modified by: Species Affinity multiplier, Species Instinct permanent upgrade, chapter-specific bonuses
- If successful: a random undiscovered species from the current chapter's time-discoverable pool is found
- Discovery triggers: full-screen overlay with SVG creature, name, description, protagonist quote
- If all time-discoverable species are found: discovery checks stop (remaining species require combinations)
- Discovery checks are paused during catastrophe animations and chapter transitions

### 8.3 Combination System

Unlock in Chapter 2. Player selects two discovered species to attempt a combination. Results are deterministic (same pair always yields same result).

**Hint tiers for failed combinations:**
- **"Nothing happens."** — No valid combination exists for this pair
- **"Something stirs... but fades."** — One of the two species is part of a valid combination (but not with this partner)
- **"A form almost takes shape!"** — Both species are part of valid combinations (but not with each other)
- **"The air crackles with potential..."** — This is a valid combination but requires a higher chapter to unlock

### 8.4 Species as Production

Each discovered species passively contributes to TR generation. Species have:
- Base production rate (small, but stacks with quantity of that species in biome)
- Synergy bonuses (specific pairs produce more together)
- Upgrade trees (Chapter 3+)

---

## 9. Intervention System (Chapter 3+)

Interventions are active abilities with cooldowns. They let the player make "smart decisions" that significantly impact progression.

| Intervention | Cooldown | Effect | Unlocked |
|-------------|----------|--------|----------|
| Nurture Pulse | 60s | Boost all species production 2x for 30s | Ch 3 |
| Redirect Flow | 120s | Choose 2 generators to receive a 2x "Flow Boost" (replaces the default boost on the 2 most-purchased generators) | Ch 3 |
| Introduce Predator | 180s | Remove weakest species, boost strongest 3x | Ch 4 |
| Remove Invasive | 90s | Eliminate an invasive species (see 9.2) | Ch 4 |
| Temporal Anchor | 300s | Pause catastrophe timer for 60s | Ch 5 |
| Ecosystem Rebalance | 240s | Equalize all species production levels | Ch 5 |
| Crystallize | 150s | Convert current TR to Echo Matter at 100:1 | Ch 6 |
| Fog Reading | 600s | Reveal next catastrophe's type and remaining time | Ch 6 |

### 9.2 Invasive Species Mechanic (Chapter 4+)

Starting in Chapter 4, each loop has a 30% chance of spawning an "invasive species" — a parasitic organism that appears in the biome uninvited. Invasives have a red-tinged glow and visually encroach on other species. Effects:
- Drain 10-25% of total generator production while active
- Spread over time (draining increases by 5% per minute if not removed)
- Can be removed with the "Remove Invasive" intervention, or by purchasing a "Herbicide" temporal tool from the marketplace
- If left unchecked for an entire loop, the invasive persists into the next loop (one of the few things that carries over negatively)

### 9.3 Chapter-Specific Mechanics Defined

**Synergy Chains (Chapter 4):** When 3+ specific generators are each at level 10+, they form a "synergy chain" that provides a multiplicative bonus to all generators in the chain. Chains are discovered (not revealed upfront) by reaching the threshold. Each chain has a name and a visual connection drawn between the generators in the biome. Example: Moss Patch (10+) + Root Cluster (10+) + Symbiotic Pair (10+) = "Underground Network" chain (+50% to all three). There are 8-10 chains to discover across chapters 4-7.

**Ecosystem Balance (Chapter 5):** Each biome type (from each chapter) has an "affinity percentage" representing its share of total production. A radar chart in the Stats tab shows the balance. "Balanced" means no single biome's affinity exceeds 30% of total. Maintaining balance grants a passive +25% to all production. Imbalance above 40% starts penalizing the dominant biome's output. The Ecosystem Rebalance intervention temporarily forces balance. This mechanic becomes critical in Chapter 7 where all 6 biomes must be balanced simultaneously.

**Risk/Reward Species (Chapter 5):** Certain Chapter 5 species have both a production bonus AND a drawback. Examples:
- "Venomthorn" — produces 5x normal TR but has a 10% chance per minute to destroy a random other species in the biome
- "Parasitic Bloom" — doubles the output of adjacent generators but drains 20% of EM earned at loop end
- "Unstable Fern" — massive TR output but accelerates the catastrophe timer by 15%
The player must decide whether the risk is worth the reward. These species can be removed with interventions.

**Temporal Tools (Chapter 6):** One-time-use items purchased from the marketplace with Anomaly Tokens or Crystal Resonance. Distinct from interventions (which are repeatable abilities with cooldowns). Tools are consumed on use:
- "Temporal Freeze" (15 AT) — Pause catastrophe timer for 120 seconds
- "Production Surge" (10 AT) — 5x all production for 60 seconds
- "Instant Discovery" (20 AT) — Discover a random undiscovered species immediately
- "Echo Converter" (25 AT) — Convert all current TR to EM at 50:1 rate
- "Catastrophe Shield" (50 AT) — Nullify the next catastrophe entirely (loop continues)
- "Timeline Split" (100 AT) — Double all EM earned this loop
Players can hold max 5 tools at once. Tools persist across loops.

---

## 10. Achievement System

### 10.1 Categories

- **Loop Milestones:** "First Loop, Worst Loop" (complete 1 loop), "Déjà Vu Specialist" (50 loops), "Time is a Flat Circle" (500 loops)
- **Discovery:** "Accidental Biologist" (discover 10 species), "Taxonomy Enthusiast" (discover all Ch 1 species), "Mad Scientist" (create 10 combinations)
- **Economy:** "Pocket Change" (earn 1K TR), "Temporal Tycoon" (earn 1B TR), "Echo Millionaire" (earn 1M EM)
- **Tapping:** "Fidget Champion" (tap 1000 anomalies), "Chain Master" (10-chain), "Rift Walker" (tap a Temporal Rift)
- **Speed:** "Speedrunner" (complete Ch 1 in under 30 min), "Efficient Loop" (earn 10K TR in one loop under 5 min)
- **Story:** "The Notebook Knows" (find all Ch 1 chronicle entries), "Full Chronicle" (find all entries)
- **Secret:** Hidden achievements only revealed after earning them. "Greg" (name a species Greg), "Fog Whisperer" (stare at the fog for 60 seconds without tapping), "The Long Game" (play for 7 consecutive days)

### 10.2 Achievement Rewards

Every achievement grants:
- Echo Matter (scaling with difficulty)
- A permanent small multiplier (+1-5% to a relevant stat)
- Some unlock cosmetics or chronicle entries

### 10.3 Pacing

Target achievement rate:
- First 10 minutes: 3-5 achievements
- First hour: 15-20 achievements
- First day: 40-50 achievements
- Full game: ~150 achievements

---

## 11. UI Architecture

### 11.1 Default View (Zen Mode)

The default screen is the biome itself, filling the viewport:
- Procedural SVG ecosystem with animated species
- Floating anomalies to tap
- Minimal HUD: resource counters at top (TR, EM, current chapter)
- Protagonist quote bar at bottom (rotates every 15-30s)
- Catastrophe progress indicator (subtle bar that becomes more ominous as it fills)

### 11.2 Bottom Navigation

A slim tab bar with 4-5 icons:
- **Biome** (default view)
- **Upgrades** (generators, multipliers, automation — the main shop)
- **Codex** (discovered species, combinations, story)
- **Market** (rotating marketplace)
- **Stats** (achievements, loop history, chapter progress)

### 11.3 Dashboard Mode (Optional Toggle)

Unlocked as a progression reward (Chapter 2+). An overlay panel that slides up from the bottom, can be swiped taller or collapsed. Contains:
- Generator list with buy buttons and production rates
- Multiplier/automation upgrade buttons
- Small biome preview at the top (not split-screen — the panel slides over the biome)
- Pull-down to minimize, pull-up to expand
- More information-dense, for players who want the numbers

### 11.4 Glowy Text

Important events use CSS text-shadow glow effects:
- New species discovered: green glow
- Achievement unlocked: gold glow
- Catastrophe warning: red glow
- Chapter transition: white glow
- Story revelation: purple glow

### 11.5 Notifications

Toast-style popups for:
- Species discovered (with SVG preview)
- Achievement earned (with name and reward)
- Marketplace refresh
- Catastrophe approaching
- Chronicle entry unlocked

---

## 12. Protagonist & Narrative

### 12.1 Voice

The protagonist is NOT a scientist. They are confused, pragmatic, and increasingly resigned to their situation. They name things badly, misunderstand their own discoveries, and find humor in the absurdity.

**Early game quotes:**
- "I woke up here again. The ferns are back. I don't understand ferns."
- "Something purple is growing. I'm choosing not to think about it."
- "I accidentally made a new species. I'm calling it 'Greg.'"

**Mid game quotes (gaining confidence):**
- "I'm basically a biologist now. An accidental, confused biologist."
- "The ecosystem is... listening to me? That can't be right."
- "I knew the fog was coming before it did. That's new."

**Late game quotes (understanding dawning):**
- "The loop isn't punishing me. It's teaching me."
- "I think the catastrophe is afraid of what I'm building."
- "What if I just... don't let it end this time?"

### 12.2 Chronicle

A journal that fills with entries as the player progresses. Entries are triggered by:
- Loop milestones (first loop, 10th loop, etc.)
- Species discoveries
- Chapter transitions
- Hidden triggers (staring at the fog, tapping 100 times in 10 seconds, etc.)

The chronicle is the primary narrative delivery mechanism. Reading it back should feel like reading someone's journal as they slowly figure out a mystery.

---

## 13. Visual Design

### 13.1 Color Palette

- **Background:** Deep navy (#0a0e1a) to near-black
- **Primary accent:** Bioluminescent teal (#7af8d4)
- **Secondary:** Purple (#b088f0), amber (#f0c860), coral (#f06080)
- **Danger/catastrophe:** Red (#ff5050) with orange gradient
- **UI surfaces:** Semi-transparent dark panels with subtle borders

### 13.2 Procedural Creatures

All species are generated with SVG primitives:
- **Plants:** Circles (spores), curved paths (stems/leaves), gradients (glow)
- **Fungi:** Ellipses (caps), rectangles (stems), circles (spots)
- **Creatures:** Organic path curves (bodies), circles (eyes), lines (legs/tendrils)
- **Minerals:** Polygons (crystals), lines (facets), gradients (refraction)

Species visually EVOLVE as they're upgraded — adding elements, changing colors, growing larger.

### 13.3 Animations

- **Ambient:** Slow breathing (scale pulse), gentle floating (translateY), color cycling
- **Tap feedback:** Particle burst, ripple effect, floating "+N" number
- **Catastrophe:** Screen shake, red overlay, fog intensification, fade to white
- **Discovery:** SVG creature materializes with glow-pulse animation
- **Chapter transition:** Slow white-out, text fade, new biome fade-in

---

## 14. Technical Architecture

### 14.1 Single HTML File (for now)

Initial implementation is a single `index.html` with embedded CSS and JS. As complexity grows, split into modules served as static files.

### 14.2 Game State

All state in a single JS object, serialized to localStorage every 10 seconds and on visibility change.

```javascript
{
  // Core
  chapter: 1,
  loop: 0,
  residue: 0,            // TR — resets each loop
  echoMatter: 0,         // EM — persists
  anomalyTokens: 0,      // persists
  memoryShards: 0,        // persists

  // Chapter-specific resources (persist)
  myceliumThreads: 0,
  coralEssence: 0,
  thornSap: 0,
  crystalResonance: 0,

  // Generators (counts reset each loop, unlocked types persist)
  generators: { mossPatch: 0, puddleFarm: 0, ... },
  unlockedGenerators: ['mossPatch', 'puddleFarm', ...],

  // Upgrades (TR-cost = reset each loop)
  multipliers: { sharpEyes: 0, ecosystemHarmony: 0, dejaVu: 0, ... },
  automation: { harvester1: false, anomalyMagnet: false, ... },

  // Permanent upgrades (EM-cost, persist)
  permanentUpgrades: { residualMemory: 0, echoAmplifier: 0, ... },

  // Discovery (persist)
  discoveredSpecies: [],
  combinationsFound: [],
  speciesUpgrades: {},   // { luminmoss: { brighterGlow: true, ... }, ... }

  // Temporal tools (persist, max 5)
  temporalTools: [],     // [{ id: 'temporalFreeze', name: '...' }, ...]

  // Progress (persist)
  chapterObjectives: { ch1: { discover_5: true, ... }, ... },
  achievements: [],
  chronicleEntries: [],
  synergyChains: [],     // discovered chains

  // Active state (reset each loop)
  catastropheTimer: 0,
  activeBuffs: [],       // [{ id: 'nurturePulse', remaining: 25 }, ...]
  interventionCooldowns: { nurturePulse: 0, ... },
  invasiveSpecies: null,  // current invasive, if any
  anomalyChain: 0,
  flowBoostTargets: [],  // generators chosen by Redirect Flow

  // Loop stats (for EM calculation, reset each loop)
  trEarnedThisLoop: 0,
  speciesDiscoveredThisLoop: 0,
  objectivesCompletedThisLoop: 0,
  anomalyTokensEarnedThisLoop: 0,

  // Marketplace (rotation resets each loop)
  marketRotationSeed: 0,
  marketPurchasedThisLoop: [],

  // Timing
  lastSaveTime: Date.now(),
  totalPlayTime: 0,
  totalLoops: 0,
  totalTrEarned: 0,

  // Settings
  dashboardMode: false,
}
```

### 14.3 Offline Progress

When the player returns after being away:
- Calculate elapsed time (capped at 8 hours)
- Apply generator production at 50% efficiency
- Apply auto-collectors at 100% efficiency
- Show "Welcome back" summary with offline earnings
- Do NOT progress catastrophe timer offline (loops only happen while active)

### 14.4 Performance

- SVG creatures: max ~30 visible elements (cull off-screen)
- Particle system: canvas overlay, max 100 particles
- Game loop: requestAnimationFrame, throttle updates to 10Hz for calculations
- DOM updates: batch, only update changed elements
- localStorage: debounced writes, not every frame

### 14.5 Save System

- Auto-save every 10 seconds
- Save on visibility change (tab switch, phone lock)
- Export/import save as base64 string (settings menu)
- "Hard Reset" option with confirmation

---

## 15. Monetization

None. This is a free game. No ads, no microtransactions, no premium currency. The game is complete as-is.

---

## 16. Pacing Targets

| Milestone | Target Time |
|-----------|------------|
| First species discovered | 30 seconds |
| First upgrade purchased | 1 minute |
| First loop completed | 3-5 minutes |
| 5 achievements earned | 10 minutes |
| Chapter 1 completed | 45-60 minutes |
| Manual loop unlocked | ~2-3 days |
| Chapter 7 reached | ~5-6 days |
| Game completed | ~7-10 days |
| All achievements | ~2-3 weeks |

### Key Design Rule

There should NEVER be a moment where the player has nothing to buy and nothing to do. If production is outpacing purchases, add more buyables. If purchases are outpacing production, the player needs a hint toward a multiplier or anomaly. The economy should always have tension — "do I save for the expensive thing or buy many cheap things?"

---

## 17. File Structure (Target)

```
temporal-biome/
├── index.html          # The game (single file initially)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-22-temporal-biome-design.md
├── .gitignore
└── README.md           # (only if requested)
```

As complexity grows, split into:
```
temporal-biome/
├── index.html
├── css/
│   └── game.css
├── js/
│   ├── state.js        # Game state, save/load
│   ├── generators.js   # Generator definitions and logic
│   ├── species.js      # Species data, combinations, upgrades
│   ├── chapters.js     # Chapter definitions, objectives, transitions
│   ├── anomalies.js    # Anomaly spawning, tapping, chains
│   ├── market.js       # Marketplace logic
│   ├── achievements.js # Achievement definitions and tracking
│   ├── ui.js           # DOM manipulation, rendering
│   ├── biome.js        # SVG creature generation, biome rendering
│   ├── particles.js    # Canvas particle system
│   └── narrative.js    # Chronicle, quotes, story progression
└── docs/
```
