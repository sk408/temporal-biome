// Species Upgrade Trees — 3 sequential tiers per discovered species
// Tier 1: Enhanced Output (+50% species production contribution)
// Tier 2: Echo Resonance (+10% EM earned per species at this tier)
// Tier 3: Deep Connection (+25% production, +5% EM, unlocks special synergy boost)

const MAX_TIER = 3;
const TIER_COSTS = [25, 75, 200]; // Mycelium Threads per tier

export const TIER_NAMES = ['Enhanced Output', 'Echo Resonance', 'Deep Connection'];
export const TIER_DESCS = [
  '+50% species production',
  '+10% Echo Matter per species',
  '+25% production, +5% EM, synergy boost',
];

export function getUpgradeTier(state, speciesId) {
  return state.speciesUpgrades?.[speciesId] || 0;
}

export function getUpgradeCost(currentTier) {
  if (currentTier >= MAX_TIER) return Infinity;
  return TIER_COSTS[currentTier];
}

export function canUpgradeSpecies(state, speciesId) {
  if (state.chapter < 3) return false;
  if (!state.discoveredSpecies.includes(speciesId)) return false;
  const tier = getUpgradeTier(state, speciesId);
  if (tier >= MAX_TIER) return false;
  const cost = getUpgradeCost(tier);
  return (state.myceliumThreads || 0) >= cost;
}

export function upgradeSpecies(state, speciesId) {
  if (!canUpgradeSpecies(state, speciesId)) return false;
  const tier = getUpgradeTier(state, speciesId);
  const cost = getUpgradeCost(tier);
  if (!state.speciesUpgrades) state.speciesUpgrades = {};
  state.speciesUpgrades[speciesId] = tier + 1;
  state.myceliumThreads -= cost;
  return true;
}

// Global production bonus from all species upgrades
export function getSpeciesOutputBonus(state) {
  const upgrades = state.speciesUpgrades || {};
  let bonus = 0;
  for (const tier of Object.values(upgrades)) {
    if (tier >= 1) bonus += 0.50; // Tier 1: +50%
    if (tier >= 3) bonus += 0.25; // Tier 3: additional +25%
  }
  // Normalize by discovered species count to prevent runaway scaling
  const discovered = state.discoveredSpecies?.length || 1;
  return bonus / discovered;
}

// Global EM bonus from species at tier 2+
export function getSpeciesEchoBonus(state) {
  const upgrades = state.speciesUpgrades || {};
  let bonus = 0;
  for (const tier of Object.values(upgrades)) {
    if (tier >= 2) bonus += 0.10; // Tier 2: +10% EM
    if (tier >= 3) bonus += 0.05; // Tier 3: additional +5% EM
  }
  return bonus;
}
