// Mycelium Network — player-directed species connections for production bonuses
// Costs Mycelium Threads (chapter resource) instead of anomaly tokens
import { SPECIES } from '../data/species.js';

const LINK_COST = 10;         // mycelium threads per link
const MAX_LINKS = 15;         // total network cap
const MAX_PER_SPECIES = 3;    // max links per species
const SAME_CHAPTER_BONUS = 0.03;   // +3% production per same-chapter link
const CROSS_CHAPTER_BONUS = 0.05;  // +5% production per cross-chapter link

function linkExists(state, a, b) {
  return (state.myceliumLinks || []).some(
    l => (l.a === a && l.b === b) || (l.a === b && l.b === a)
  );
}

export function getSpeciesLinkCount(state, speciesId) {
  return (state.myceliumLinks || []).filter(
    l => l.a === speciesId || l.b === speciesId
  ).length;
}

export function canCreateLink(state, speciesA, speciesB) {
  if (state.chapter < 3) return false;
  if (speciesA === speciesB) return false;
  if (!state.discoveredSpecies.includes(speciesA)) return false;
  if (!state.discoveredSpecies.includes(speciesB)) return false;
  if ((state.myceliumThreads || 0) < LINK_COST) return false;
  if (linkExists(state, speciesA, speciesB)) return false;
  if ((state.myceliumLinks || []).length >= MAX_LINKS) return false;
  if (getSpeciesLinkCount(state, speciesA) >= MAX_PER_SPECIES) return false;
  if (getSpeciesLinkCount(state, speciesB) >= MAX_PER_SPECIES) return false;
  return true;
}

export function createLink(state, speciesA, speciesB) {
  if (!canCreateLink(state, speciesA, speciesB)) return false;
  if (!state.myceliumLinks) state.myceliumLinks = [];
  state.myceliumLinks.push({ a: speciesA, b: speciesB });
  state.myceliumThreads -= LINK_COST;
  return true;
}

export function removeLink(state, speciesA, speciesB) {
  if (!state.myceliumLinks) return;
  state.myceliumLinks = state.myceliumLinks.filter(
    l => !((l.a === speciesA && l.b === speciesB) || (l.a === speciesB && l.b === speciesA))
  );
}

function isCrossChapter(speciesA, speciesB) {
  const sA = SPECIES[speciesA];
  const sB = SPECIES[speciesB];
  if (!sA || !sB) return false;
  return sA.chapter !== sB.chapter;
}

export function getMyceliumBonus(state) {
  const links = state.myceliumLinks || [];
  let bonus = 0;
  for (const link of links) {
    bonus += isCrossChapter(link.a, link.b) ? CROSS_CHAPTER_BONUS : SAME_CHAPTER_BONUS;
  }
  return bonus;
}

export function getNetworkStats(state) {
  const links = state.myceliumLinks || [];
  const connected = new Set();
  let sameChapter = 0;
  let crossChapter = 0;
  for (const link of links) {
    connected.add(link.a);
    connected.add(link.b);
    if (isCrossChapter(link.a, link.b)) crossChapter++;
    else sameChapter++;
  }
  return {
    totalLinks: links.length,
    sameChapterLinks: sameChapter,
    crossChapterLinks: crossChapter,
    connectedSpecies: connected.size,
  };
}
