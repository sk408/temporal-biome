let nextId = 0;

const ANOMALY_TYPES = [
  { type: 'residue', weight: 60, reward: 'residue', baseValue: 5 },
  { type: 'token', weight: 20, reward: 'anomalyTokens', baseValue: 1 },
  { type: 'fragment', weight: 10, reward: 'memoryShards', baseValue: 1 },
  { type: 'burst', weight: 10, reward: 'residue', baseValue: 10 },
  { type: 'rift', weight: 0, reward: 'rift', baseValue: 0 }, // spawned separately, not in normal pool
];

const ANOMALY_COLORS = {
  residue: '#7af8d4',
  token: '#f0c860',
  fragment: '#b088f0',
  burst: '#f06080',
  rift: '#ff66ff',
};

export function getAnomalyColor(type) {
  return ANOMALY_COLORS[type] || '#7af8d4';
}

function pickType() {
  const totalWeight = ANOMALY_TYPES.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const t of ANOMALY_TYPES) {
    roll -= t.weight;
    if (roll <= 0) return t;
  }
  return ANOMALY_TYPES[0];
}

function createAnomaly(type = null) {
  const t = type || pickType();
  return {
    id: 'a' + (nextId++),
    type: t.type,
    x: 0.1 + Math.random() * 0.8,
    y: 0.1 + Math.random() * 0.7,
    spawnTime: Date.now(),
    lifetime: 5 + Math.random() * 3, // 5-8 seconds
    age: 0,
  };
}

export function getActiveAnomalies(state) {
  return state.activeAnomalies || [];
}

export function updateAnomalies(state, dt) {
  if (!state.activeAnomalies) state.activeAnomalies = [];

  // Age existing anomalies and remove expired
  state.activeAnomalies = state.activeAnomalies.filter(a => {
    a.age += dt;
    return a.age < a.lifetime;
  });

  // Spawn logic
  if (!state._anomalySpawnTimer) state._anomalySpawnTimer = 0;
  state._anomalySpawnTimer += dt;

  let spawnInterval = 8; // base 8 seconds between spawns
  if (state.automation?.anomalyMagnet) spawnInterval *= 0.5;
  const tempSensLevel = state.multipliers?.temporalSensitivity || 0;
  spawnInterval /= (1 + tempSensLevel * 0.2);
  spawnInterval = Math.max(spawnInterval, 2);

  if (state._anomalySpawnTimer >= spawnInterval) {
    state._anomalySpawnTimer = 0;
    const anomaly = createAnomaly();
    state.activeAnomalies.push(anomaly);

    // Burst type spawns extras
    if (anomaly.type === 'burst') {
      const extra = 2 + Math.floor(Math.random() * 3); // 2-4 more
      for (let i = 0; i < extra; i++) {
        const bonus = createAnomaly(ANOMALY_TYPES[0]); // residue type
        bonus.x = Math.max(0.05, Math.min(0.95, anomaly.x + (Math.random() - 0.5) * 0.3));
        bonus.y = Math.max(0.05, Math.min(0.95, anomaly.y + (Math.random() - 0.5) * 0.3));
        bonus.lifetime = 3 + Math.random() * 2; // shorter lived
        state.activeAnomalies.push(bonus);
      }
    }
  }

  // Temporal Rift spawn (ultra-rare, every 60-120 min, separate from normal pool)
  if (!state._riftSpawnTimer) state._riftSpawnTimer = 0;
  state._riftSpawnTimer += dt;
  const riftInterval = 3600 + Math.sin(state.loop * 7.3) * 1800; // 60-90 min
  if (state._riftSpawnTimer >= riftInterval) {
    state._riftSpawnTimer = 0;
    const rift = createAnomaly(ANOMALY_TYPES[4]); // rift type
    rift.lifetime = 10 + Math.random() * 5; // longer visible: 10-15s
    state.activeAnomalies.push(rift);
  }

  // Cap max anomalies
  if (state.activeAnomalies.length > 20) {
    state.activeAnomalies = state.activeAnomalies.slice(-20);
  }
}

export function tapAnomaly(state, anomalyId) {
  const idx = state.activeAnomalies.findIndex(a => a.id === anomalyId);
  if (idx === -1) return null;

  const anomaly = state.activeAnomalies[idx];
  state.activeAnomalies.splice(idx, 1);

  const typeDef = ANOMALY_TYPES.find(t => t.type === anomaly.type) || ANOMALY_TYPES[0];

  // Chain tracking
  const now = Date.now();
  if (now - (state.anomalyChainExpiry || 0) < 3000) {
    state.anomalyChain = (state.anomalyChain || 0) + 1;
  } else {
    state.anomalyChain = 1;
  }
  state.anomalyChainExpiry = now + 3000;

  const chainMultiplier = Math.min(state.anomalyChain, 10); // cap at 10x
  const value = Math.floor(typeDef.baseValue * chainMultiplier);

  // Apply reward
  if (typeDef.reward === 'rift') {
    // Mega-reward: random combination of all resources
    const trBonus = 50 * chainMultiplier * state.chapter;
    const tokenBonus = 3 * chainMultiplier;
    const shardBonus = 2 * chainMultiplier;
    state.residue += trBonus;
    state.trEarnedThisLoop += trBonus;
    state.totalTrEarned += trBonus;
    state.anomalyTokens += tokenBonus;
    state.anomalyTokensEarnedThisLoop += tokenBonus;
    state.memoryShards += shardBonus;
    state.totalAnomaliesTapped = (state.totalAnomaliesTapped || 0) + 1;
    return { type: 'rift', amount: trBonus, tokenBonus, shardBonus, chain: state.anomalyChain };
  } else if (typeDef.reward === 'residue') {
    state.residue += value;
    state.trEarnedThisLoop += value;
    state.totalTrEarned += value;
  } else if (typeDef.reward === 'anomalyTokens') {
    state.anomalyTokens += value;
    state.anomalyTokensEarnedThisLoop += value;
  } else if (typeDef.reward === 'memoryShards') {
    state.memoryShards += value;
  }

  state.totalAnomaliesTapped = (state.totalAnomaliesTapped || 0) + 1;

  return { type: typeDef.reward, amount: value, chain: state.anomalyChain };
}
