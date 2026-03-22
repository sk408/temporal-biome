export const GENERATORS = {
  mossPatch: {
    id: 'mossPatch', name: 'Moss Patch', chapter: 1,
    baseCost: 10, costScaling: 1.15, baseOutput: 0.5,
    flavor: "It grows. That's... something.",
  },
  puddleFarm: {
    id: 'puddleFarm', name: 'Puddle Farm', chapter: 1,
    baseCost: 50, costScaling: 1.15, baseOutput: 2,
    flavor: "I'm farming puddles now. This is my life.",
  },
  sporeColony: {
    id: 'sporeColony', name: 'Spore Colony', chapter: 1,
    baseCost: 250, costScaling: 1.15, baseOutput: 8,
    flavor: "They float upward. I try not to breathe.",
  },
  rootCluster: {
    id: 'rootCluster', name: 'Root Cluster', chapter: 1,
    baseCost: 1000, costScaling: 1.15, baseOutput: 30,
    flavor: "The roots hum. I don't want to know why.",
  },
  primordialEngine: {
    id: 'primordialEngine', name: 'Primordial Engine', chapter: 1,
    baseCost: 5000, costScaling: 1.15, baseOutput: 120,
    flavor: "I built this? I BUILT this??",
  },
};

export const MILESTONES = [
  { qty: 10, bonus: 1.0, label: '+100% output' },
  { qty: 25, bonus: 0.05, label: '+5% to all Ch1', global: true },
  { qty: 50, bonus: 0, label: 'Visual upgrade', visual: true },
  { qty: 100, bonus: 0, label: 'Achievement', achievement: true },
  { qty: 200, bonus: 4.0, label: '+500% output' },
  { qty: 500, bonus: 0, label: 'Synergy unlock', synergy: true },
];
