// Symbiosis — species synergy pairs that boost production

const SYNERGIES = [
  { a: 'luminmoss', b: 'driftspore', bonus: 0.10, desc: '+10% all generator output', type: 'generatorMult' },
  { a: 'poolworm', b: 'fogbell', bonus: 0.05, desc: '+5% anomaly frequency', type: 'anomalyFreq' },
  { a: 'rootweaver', b: 'soilmite', bonus: 0.15, desc: '+15% Ch2 generator output', type: 'ch2GeneratorMult' },
  { a: 'petalfly', b: 'dewdrop', bonus: 0.10, desc: '+10% discovery chance', type: 'discoveryChance' },
  { a: 'luminmoss', b: 'rootweaver', bonus: 0.08, desc: '+8% all generator output', type: 'generatorMult' },
  { a: 'copperlichen', b: 'thornsprout', bonus: 0.12, desc: '+12% tap value', type: 'tapMult' },
  // Chapter 3 synergies
  { a: 'sporecap', b: 'glowshroom', bonus: 0.10, desc: '+10% all generator output', type: 'generatorMult' },
  { a: 'mycelworm', b: 'trufflekin', bonus: 0.08, desc: '+8% discovery chance', type: 'discoveryChance' },
  { a: 'lichenveil', b: 'fogbell', bonus: 0.06, desc: '+6% anomaly frequency', type: 'anomalyFreq' },
  { a: 'moldweaver', b: 'rootweaver', bonus: 0.12, desc: '+12% all generator output', type: 'generatorMult' },
];

export function getActiveSynergies(state) {
  return SYNERGIES.filter(syn =>
    state.discoveredSpecies.includes(syn.a) && state.discoveredSpecies.includes(syn.b)
  );
}

export function getSymbiosisBonus(state, type) {
  const active = getActiveSynergies(state);
  let bonus = 0;
  for (const syn of active) {
    if (syn.type === type) bonus += syn.bonus;
  }
  return bonus;
}

export function hasAnySynergy(state) {
  return SYNERGIES.some(syn =>
    state.discoveredSpecies.includes(syn.a) && state.discoveredSpecies.includes(syn.b)
  );
}
