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
