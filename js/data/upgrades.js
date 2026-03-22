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
