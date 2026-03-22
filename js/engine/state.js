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
    totalAnomaliesTapped: 0, totalSpeciesDiscovered: 0, totalMarketPurchases: 0,
    activeAnomalies: [],
    dashboardMode: false,
  };
}

export function resetLoop(state) {
  const residualMemoryLevel = state.permanentUpgrades?.residualMemory || 0;
  const startingTr = Math.floor(state.trEarnedThisLoop * residualMemoryLevel * 0.01);
  const blueprintLevel = state.permanentUpgrades?.generatorBlueprint || 0;
  const startingGenLevel = blueprintLevel > 0 ? [0, 5, 10, 25][blueprintLevel] || 0 : 0;
  const dejaVuLevel = state.multipliers?.dejaVu || 0;

  state.loop += 1;
  state.totalLoops += 1;
  state.residue = startingTr;
  state.trEarnedThisLoop = 0;
  state.speciesDiscoveredThisLoop = 0;
  state.objectivesCompletedThisLoop = 0;
  state.anomalyTokensEarnedThisLoop = 0;

  for (const key of Object.keys(state.generators)) {
    state.generators[key] = startingGenLevel;
  }
  for (const key of Object.keys(state.multipliers)) {
    state.multipliers[key] = 0;
  }
  for (const key of Object.keys(state.automation)) {
    state.automation[key] = false;
  }

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
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const offlineEfficiency = state.automation?.offlineBeacon ? 1.0 : 0.5;
  return { trEarned: 0, elapsed: capped };
}

export function calcOfflineProgressWithRate(state, elapsedSeconds, productionPerSecond) {
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const offlineEfficiency = state.automation?.offlineBeacon ? 1.0 : 0.5;
  const trEarned = Math.floor(productionPerSecond * capped * offlineEfficiency);
  return { trEarned, elapsed: capped };
}
