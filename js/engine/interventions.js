// Intervention System — active abilities with cooldowns (Ch3+)

export const INTERVENTIONS = {
  nurturePulse: {
    id: 'nurturePulse', name: 'Nurture Pulse', chapter: 3,
    cooldown: 60, // seconds
    buffDuration: 30, // seconds
    desc: 'Boost all species production 2x for 30s',
    flavor: "Everything grows faster when you care about it. Even here.",
  },
  redirectFlow: {
    id: 'redirectFlow', name: 'Redirect Flow', chapter: 3,
    cooldown: 120,
    buffDuration: 60,
    desc: 'Top 2 generators receive 2x output for 60s',
    flavor: "I learned to redirect the streams. The ecosystem notices.",
  },
};

export function canUseIntervention(state, interventionId) {
  const def = INTERVENTIONS[interventionId];
  if (!def) return false;
  if (state.chapter < def.chapter) return false;
  if ((state.interventionCooldowns?.[interventionId] || 0) > 0) return false;
  return true;
}

export function useIntervention(state, interventionId) {
  if (!canUseIntervention(state, interventionId)) return false;
  const def = INTERVENTIONS[interventionId];

  // Set cooldown
  if (!state.interventionCooldowns) state.interventionCooldowns = {};
  state.interventionCooldowns[interventionId] = def.cooldown;

  // Apply effect
  switch (interventionId) {
    case 'nurturePulse':
      state.activeBuffs.push({ id: 'nurturePulse', remaining: def.buffDuration });
      break;
    case 'redirectFlow': {
      // Auto-select top 2 generators by count
      const sorted = Object.entries(state.generators || {})
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
      const top2 = sorted.slice(0, 2).map(([id]) => id);
      state.flowBoostTargets = top2;
      state.activeBuffs.push({ id: 'redirectFlow', remaining: def.buffDuration });
      break;
    }
  }
  return true;
}

export function tickInterventionCooldowns(state, dt) {
  if (!state.interventionCooldowns) return;
  for (const [id, remaining] of Object.entries(state.interventionCooldowns)) {
    const newVal = remaining - dt;
    if (newVal <= 0) {
      delete state.interventionCooldowns[id];
    } else {
      state.interventionCooldowns[id] = newVal;
    }
  }
}

export function getInterventionState(state, interventionId) {
  const def = INTERVENTIONS[interventionId];
  if (!def) return { locked: true, available: false, cooldownRemaining: 0 };
  if (state.chapter < def.chapter) return { locked: true, available: false, cooldownRemaining: 0 };
  const cd = state.interventionCooldowns?.[interventionId] || 0;
  return { locked: false, available: cd <= 0, cooldownRemaining: cd };
}
