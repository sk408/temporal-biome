export const CATASTROPHE_DURATION = { 1: 480, 2: 600, 3: 720, 4: 900, 5: 1080, 6: 1320, 7: 1800 };

export const CATASTROPHE_TYPES = {
  fog: { name: 'Fog Wipe', desc: 'Full TR reset, all generators reset', color: '#8040c0' },
  storm: { name: 'Temporal Storm', desc: 'Keeps 25% of TR', color: '#f0d040' },
};

export function getCatastropheType(state) {
  if (state.chapter < 3) return CATASTROPHE_TYPES.fog;
  return CATASTROPHE_TYPES[state.catastropheType] || CATASTROPHE_TYPES.fog;
}

export function getDuration(state) {
  const base = CATASTROPHE_DURATION[state.chapter] || 480;
  return base;
}

export function tickCatastrophe(state, dt) {
  const anchored = (state.activeBuffs || []).some(b => b.id === 'temporalAnchor');
  if (anchored) return 'paused';
  state.catastropheTimer += dt;
  const duration = getDuration(state);
  if (state.catastropheTimer >= duration) {
    return 'trigger';
  }
  return 'ticking';
}

export function getCatastrophePhase(state) {
  const duration = getDuration(state);
  const pct = state.catastropheTimer / duration;
  if (pct < 0.5) return 'calm';
  if (pct < 0.75) return 'building';
  if (pct < 0.9) return 'warning';
  return 'critical';
}

export function getCatastropheProgress(state) {
  return state.catastropheTimer / getDuration(state);
}
