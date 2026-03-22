import { SPECIES, COMBINATIONS } from '../data/species.js';

function getDiscoverablePool(state) {
  return Object.values(SPECIES).filter(s =>
    s.chapter <= state.chapter && s.discoverable && !state.discoveredSpecies.includes(s.id)
  );
}

export function getDiscoveryChance(state) {
  // Higher chance early, normalizes as more species are found
  const found = state.discoveredSpecies?.length || 0;
  let chance = found < 3 ? 0.35 : 0.15;
  const affinityLevel = state.multipliers?.speciesAffinity || 0;
  chance *= (1 + affinityLevel * 0.1);
  const instinctLevel = state.permanentUpgrades?.speciesInstinct || 0;
  chance *= (1 + instinctLevel * 0.25);
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
  // Faster checks early when few species found, slows as you discover more
  const found = state.discoveredSpecies.length;
  let interval = found < 2 ? 15 : found < 4 ? 25 : 45;
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
  if (aInCombo && bInCombo) return 'both_valid';
  if (aInCombo || bInCombo) return 'one_valid';
  return 'nothing';
}
