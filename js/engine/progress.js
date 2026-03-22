const CHAPTER_OBJECTIVES = {
  1: [
    { id: 'discover3', desc: 'Discover 3 species', check: s => s.discoveredSpecies.length >= 3 },
    { id: 'earn1kTr', desc: 'Earn 1,000 TR in a single loop', check: s => s.trEarnedThisLoop >= 1000 },
    { id: 'own10Gens', desc: 'Own 10 generators total', check: s => Object.values(s.generators).reduce((a, b) => a + b, 0) >= 10 },
    { id: 'survive2', desc: 'Survive 2 catastrophes', check: s => s.totalLoops >= 2 },
    { id: 'earn50Em', desc: 'Earn 50 Echo Matter', check: s => s.echoMatter >= 50 },
  ],
};

export function getChapterObjectives(chapter) {
  return CHAPTER_OBJECTIVES[chapter] || [];
}

export function checkObjectives(state) {
  const objectives = getChapterObjectives(state.chapter);
  const newlyCompleted = [];
  for (const obj of objectives) {
    if (state.chapterObjectives[obj.id]) continue;
    if (obj.check(state)) {
      state.chapterObjectives[obj.id] = true;
      state.objectivesCompletedThisLoop += 1;
      newlyCompleted.push(obj.desc);
    }
  }
  return newlyCompleted;
}

export function checkAchievements(state) {
  // Import at module level would cause circular dep, so achievements are defined here
  const ACHIEVEMENTS = getAchievementDefs();
  const newlyEarned = [];
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue;
    if (ach.check(state)) {
      state.achievements.push(ach.id);
      newlyEarned.push(ach);
    }
  }
  return newlyEarned;
}

export function getAchievementDefs() {
  return [
    // Loop milestones
    { id: 'firstLoop', name: 'Groundhog Day', desc: 'Complete your first loop', category: 'loop', check: s => s.totalLoops >= 1 },
    { id: 'loop5', name: 'Déjà Vu', desc: 'Complete 5 loops', category: 'loop', check: s => s.totalLoops >= 5 },
    { id: 'loop10', name: 'Temporal Veteran', desc: 'Complete 10 loops', category: 'loop', check: s => s.totalLoops >= 10 },
    { id: 'loop25', name: 'Time is a Flat Circle', desc: 'Complete 25 loops', category: 'loop', check: s => s.totalLoops >= 25 },
    { id: 'loop50', name: 'Eternal Return', desc: 'Complete 50 loops', category: 'loop', check: s => s.totalLoops >= 50 },

    // Discovery
    { id: 'firstSpecies', name: 'It Lives!', desc: 'Discover your first species', category: 'discovery', check: s => s.discoveredSpecies.length >= 1 },
    { id: 'species3', name: 'Amateur Biologist', desc: 'Discover 3 species', category: 'discovery', check: s => s.discoveredSpecies.length >= 3 },
    { id: 'species5', name: 'Field Researcher', desc: 'Discover all Ch1 species', category: 'discovery', check: s => s.discoveredSpecies.length >= 5 },

    // Economy
    { id: 'firstGen', name: 'Humble Beginnings', desc: 'Buy your first generator', category: 'economy', check: s => Object.values(s.generators).reduce((a,b) => a+b, 0) >= 1 },
    { id: 'gen10', name: 'Factory Floor', desc: 'Own 10 generators', category: 'economy', check: s => Object.values(s.generators).reduce((a,b) => a+b, 0) >= 10 },
    { id: 'gen50', name: 'Industrial Complex', desc: 'Own 50 generators', category: 'economy', check: s => Object.values(s.generators).reduce((a,b) => a+b, 0) >= 50 },
    { id: 'tr1k', name: 'Residue Collector', desc: 'Earn 1,000 TR total', category: 'economy', check: s => s.totalTrEarned >= 1000 },
    { id: 'tr10k', name: 'Residue Hoarder', desc: 'Earn 10,000 TR total', category: 'economy', check: s => s.totalTrEarned >= 10000 },
    { id: 'tr100k', name: 'Residue Baron', desc: 'Earn 100,000 TR total', category: 'economy', check: s => s.totalTrEarned >= 100000 },
    { id: 'em10', name: 'Echo Whisper', desc: 'Earn 10 Echo Matter', category: 'economy', check: s => s.echoMatter >= 10 },
    { id: 'em100', name: 'Echo Chamber', desc: 'Earn 100 Echo Matter', category: 'economy', check: s => s.echoMatter >= 100 },

    // Tapping
    { id: 'tap10', name: 'Curious Fingers', desc: 'Tap 10 anomalies', category: 'tapping', check: s => (s.totalAnomaliesTapped || 0) >= 10 },
    { id: 'tap50', name: 'Anomaly Hunter', desc: 'Tap 50 anomalies', category: 'tapping', check: s => (s.totalAnomaliesTapped || 0) >= 50 },
    { id: 'tap100', name: 'Glitch in the Matrix', desc: 'Tap 100 anomalies', category: 'tapping', check: s => (s.totalAnomaliesTapped || 0) >= 100 },
    { id: 'chain5', name: 'Chain Reaction', desc: 'Get a 5-chain', category: 'tapping', check: s => (s.anomalyChain || 0) >= 5 },

    // Speed
    { id: 'fast1k', name: 'Speed Loops', desc: 'Earn 1,000 TR in under 2 minutes', category: 'speed', check: s => s.trEarnedThisLoop >= 1000 && s.catastropheTimer < 120 },

    // Upgrades
    { id: 'firstPerm', name: 'Breaking the Cycle', desc: 'Buy a permanent upgrade', category: 'upgrades', check: s => Object.values(s.permanentUpgrades).some(v => v > 0) },
    { id: 'firstAuto', name: 'Hands Free', desc: 'Buy an automation upgrade', category: 'upgrades', check: s => Object.values(s.automation).some(v => v === true) },

    // Misc
    { id: 'allObj', name: 'Chapter Complete', desc: 'Complete all Ch1 objectives', category: 'chapter', check: s => Object.keys(s.chapterObjectives).length >= 5 },
  ];
}

export function addChronicleEntry(state, trigger) {
  const ENTRIES = {
    start: "I woke up somewhere wet. The air tastes like copper and old rain. I don't know how I got here.",
    firstDiscovery: "I found something alive. In all this fog and muck, something is actually alive.",
    firstLoop: "I'm back. Same puddle. Same fog. Same confusion. But I remember... some of it.",
    loop5: "Five times now. Five times I've woken up here. The moss remembers me. I think.",
    loop10: "I've stopped counting. Or started counting differently. Each loop teaches me something.",
    firstPermanent: "Something stayed. When the fog came and took everything... something stayed with me.",
    allSpecies: "I've named them all. Every living thing in this soup. It feels like an ending, but it's not.",
    chapter1Complete: "The fog is different now. It's not just ending things. It's... showing me something else.",
  };

  const text = ENTRIES[trigger];
  if (!text) return;
  if (state.chronicleEntries.some(e => e.trigger === trigger)) return;

  state.chronicleEntries.push({
    trigger,
    text,
    loop: state.loop,
    time: Date.now(),
  });
}
