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

// Marketplace items — permanent stock (always available)
export const MARKET_PERMANENT = {
  temporalAnchor: {
    id: 'temporalAnchor', name: 'Temporal Anchor',
    desc: 'Pause catastrophe timer for 30 seconds',
    cost: 3, currency: 'anomalyTokens', buffId: 'temporalAnchor', buffDuration: 30,
  },
  nurturePulse: {
    id: 'nurturePulse', name: 'Nurture Pulse',
    desc: 'Double all production for 60 seconds',
    cost: 5, currency: 'anomalyTokens', buffId: 'nurturePulse', buffDuration: 60,
  },
  quickDiscovery: {
    id: 'quickDiscovery', name: 'Spore Beacon',
    desc: 'Instantly discover a random species',
    cost: 8, currency: 'anomalyTokens', action: 'discoverRandom',
  },
  productionSurge: {
    id: 'productionSurge', name: 'Production Surge',
    desc: '5x all production for 30 seconds',
    cost: 2, currency: 'memoryShards', buffId: 'productionSurge', buffDuration: 30,
  },
  trBoost: {
    id: 'trBoost', name: 'Residue Infusion',
    desc: 'Instantly gain 500 TR',
    cost: 1, currency: 'memoryShards', action: 'grantTR', actionValue: 500,
  },
};

// Rotating stock pool — 3 items selected per loop via seed
export const MARKET_ROTATING_POOL = [
  { id: 'bigTrBoost', name: 'Concentrated Residue', desc: 'Instantly gain 2,000 TR', cost: 3, currency: 'memoryShards', action: 'grantTR', actionValue: 2000 },
  { id: 'anomalyFlood', name: 'Anomaly Flood', desc: 'Spawn 8 anomalies instantly', cost: 4, currency: 'anomalyTokens', action: 'spawnAnomalies', actionValue: 8 },
  { id: 'longAnchor', name: 'Deep Anchor', desc: 'Pause catastrophe for 60 seconds', cost: 6, currency: 'anomalyTokens', buffId: 'temporalAnchor', buffDuration: 60 },
  { id: 'megaSurge', name: 'Mega Surge', desc: '5x production for 90 seconds', cost: 4, currency: 'memoryShards', buffId: 'productionSurge', buffDuration: 90 },
  { id: 'chainStarter', name: 'Chain Igniter', desc: 'Start next anomaly tap at 5-chain', cost: 2, currency: 'anomalyTokens', action: 'setChain', actionValue: 5 },
  { id: 'emBoost', name: 'Echo Catalyst', desc: '+50% Echo Matter this loop', cost: 3, currency: 'memoryShards', buffId: 'echoCatalyst', buffDuration: 99999 },
];

export function getRotatingStock(seed, connectionsLevel) {
  // Deterministic selection based on seed
  const count = 3 + Math.min(connectionsLevel, 2); // 3-5 items
  const shuffled = [...MARKET_ROTATING_POOL];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
