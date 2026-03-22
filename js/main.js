// js/main.js — Entry point and game loop
import { createState, load, save, resetLoop, calcOfflineProgressWithRate } from './engine/state.js';
import { getTotalProduction, getTapValue, calcEchoMatter, purchaseGenerator, purchaseMultiplier, purchaseAutomation, purchasePermanentUpgrade } from './engine/economy.js';
import { tickCatastrophe, getCatastrophePhase, getCatastropheProgress } from './engine/catastrophe.js';
import { runDiscoveryCheck, discoverSpecies, tryCombination, getDiscoveryInterval } from './engine/discovery.js';
import { updateAnomalies, tapAnomaly, getActiveAnomalies } from './engine/anomalies.js';
import { checkObjectives, checkAchievements, addChronicleEntry } from './engine/progress.js';
import { formatNum } from './engine/utils.js';
import { GENERATORS } from './data/generators.js';
import { SPECIES, generateSpeciesSVG } from './data/species.js';
import { MULTIPLIERS, AUTOMATION, PERMANENT_UPGRADES } from './data/upgrades.js';
import { QUOTES } from './data/narrative.js';
import { initParticles, spawnBurst, spawnFloatingNumber, spawnAmbient, tickParticles, drawParticles } from './ui/particles.js';
import { renderBiome, renderAnomalies } from './ui/biome.js';
import { updateResourceBar, updateCatastropheBar, updateObjectives, updateQuoteBar, switchPanel } from './ui/renderer.js';
import { renderGenerators, renderMultipliers, renderAutomation, renderPermanentUpgrades, renderMarketplace } from './ui/shop.js';
import { showDiscovery, showCatastrophe, showLoopSummary } from './ui/overlays.js';
import { showToast } from './ui/notifications.js';

let state;
let lastTime = 0;
let discoveryTimer = 0;
let quoteTimer = 0;
let saveTimer = 0;
let progressTimer = 0;
let ambientTimer = 0;
let shopRefreshTimer = 0;
let isOverlayActive = false;

// ─── Codex state ───
let combineSlotA = null;
let combineSlotB = null;

function init() {
  state = load();

  // Handle offline progress
  const elapsed = (Date.now() - state.lastSaveTime) / 1000;
  if (elapsed > 10) {
    const prod = getTotalProduction(state);
    const offline = calcOfflineProgressWithRate(state, elapsed, prod);
    if (offline.trEarned > 0) {
      state.residue += offline.trEarned;
      state.trEarnedThisLoop += offline.trEarned;
      showToast(`Welcome back! +${formatNum(offline.trEarned)} TR while away`, 'story');
    }
  }

  initParticles(document.getElementById('particle-canvas'));
  renderBiome(state, document.getElementById('biome-svg'));
  setupEventListeners();
  renderAllShops();
  renderCodex();
  renderChronicle();
  renderStats();
  updateAllUI();

  if (state.loop === 0 && state.chronicleEntries.length === 0) {
    addChronicleEntry(state, 'start');
    showToast("You wake up. The ground is wet.", 'story');
  }

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  if (!isOverlayActive) {
    // Production tick
    const production = getTotalProduction(state);
    const trGained = production * dt;
    state.residue += trGained;
    state.trEarnedThisLoop += trGained;
    state.totalTrEarned += trGained;
    state.totalPlayTime += dt;

    // Catastrophe tick
    const catResult = tickCatastrophe(state, dt);
    if (catResult === 'trigger') {
      triggerCatastrophe();
    }

    // Anomaly tick
    updateAnomalies(state, dt);

    // Discovery tick
    discoveryTimer += dt;
    const discoveryInterval = getDiscoveryInterval(state);
    if (discoveryTimer >= discoveryInterval) {
      discoveryTimer = 0;
      const discovered = runDiscoveryCheck(state);
      if (discovered) {
        discoverSpecies(state, discovered);
        const species = SPECIES[discovered];
        isOverlayActive = true;

        // Check chronicle triggers
        if (state.discoveredSpecies.length === 1) addChronicleEntry(state, 'firstDiscovery');
        if (state.discoveredSpecies.length >= 5) addChronicleEntry(state, 'allSpecies');

        showDiscovery(species, () => {
          isOverlayActive = false;
          renderBiome(state, document.getElementById('biome-svg'));
          renderCodex();
          showToast(`Discovered: ${species.name}`, 'discovery');
        });
      }
    }

    // Progress checks (every 2 seconds)
    progressTimer += dt;
    if (progressTimer >= 2) {
      progressTimer = 0;
      const newObjectives = checkObjectives(state);
      const newAchievements = checkAchievements(state);
      for (const obj of newObjectives) showToast(`Objective: ${obj}`, 'achievement');
      for (const ach of newAchievements) {
        showToast(`Achievement: ${ach.name}`, 'achievement');
        if (ach.id === 'firstPerm') addChronicleEntry(state, 'firstPermanent');
      }
      if (newObjectives.length > 0 || newAchievements.length > 0) {
        renderStats();
        updateObjectives(state);
      }
    }

    // Refresh shop affordability (every 3 seconds)
    shopRefreshTimer += dt;
    if (shopRefreshTimer >= 3) {
      shopRefreshTimer = 0;
      const upgradesPanel = document.getElementById('panel-upgrades');
      if (upgradesPanel && upgradesPanel.classList.contains('active')) {
        renderAllShops();
      }
    }

    // Quote rotation
    quoteTimer += dt;
    if (quoteTimer >= 20) {
      quoteTimer = 0;
      updateQuoteBar(state, getRandomQuote(state));
    }

    // Ambient particles
    ambientTimer += dt;
    if (ambientTimer >= 2) {
      ambientTimer = 0;
      const canvas = document.getElementById('particle-canvas');
      if (canvas) spawnAmbient(canvas.clientWidth, canvas.clientHeight);
    }

    // Save every 10 seconds
    saveTimer += dt;
    if (saveTimer >= 10) {
      saveTimer = 0;
      save(state);
    }
  }

  // Render (always, even during overlays for particles)
  tickParticles(dt);
  drawParticles();
  renderAnomalies(state, document.getElementById('biome-svg'));
  updateResourceBar(state);
  updateCatastropheBar(state);

  requestAnimationFrame(gameLoop);
}

function triggerCatastrophe() {
  isOverlayActive = true;
  const emEarned = calcEchoMatter(state);

  // Chronicle triggers
  if (state.loop === 0) addChronicleEntry(state, 'firstLoop');
  if (state.loop === 4) addChronicleEntry(state, 'loop5');
  if (state.loop === 9) addChronicleEntry(state, 'loop10');

  const stats = {
    trEarned: state.trEarnedThisLoop,
    speciesFound: state.speciesDiscoveredThisLoop,
    emEarned,
    loop: state.loop + 1,
  };

  showCatastrophe(() => {
    state.echoMatter += emEarned;
    resetLoop(state);
    save(state);

    showLoopSummary(stats, () => {
      isOverlayActive = false;
      renderBiome(state, document.getElementById('biome-svg'));
      renderAllShops();
      renderCodex();
      renderChronicle();
      renderStats();
      updateAllUI();
      discoveryTimer = 0;

      // Post-reset quote
      const postQuote = QUOTES.postReset[Math.floor(Math.random() * QUOTES.postReset.length)];
      updateQuoteBar(state, postQuote.replace('{loop}', state.loop));
    });
  });
}

function setupEventListeners() {
  // Biome tap — pointerup avoids click+touchend double-fire
  document.getElementById('biome-container').addEventListener('pointerup', handleBiomeTap);

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('pointerup', () => {
      switchPanel(btn.dataset.panel);
      if (btn.dataset.panel === 'upgrades') renderAllShops();
      if (btn.dataset.panel === 'stats') renderStats();
      if (btn.dataset.panel === 'codex') renderCodex();
    });
  });

  // Combine button
  const combineBtn = document.getElementById('combine-btn');
  if (combineBtn) combineBtn.addEventListener('pointerup', handleCombine);

  // Visibility change (offline progress on return)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      save(state);
    } else {
      const elapsed = (Date.now() - state.lastSaveTime) / 1000;
      if (elapsed > 5) {
        const prod = getTotalProduction(state);
        const offline = calcOfflineProgressWithRate(state, elapsed, prod);
        if (offline.trEarned > 0) {
          state.residue += offline.trEarned;
          state.trEarnedThisLoop += offline.trEarned;
          showToast(`+${formatNum(offline.trEarned)} TR while away`, 'story');
        }
      }
      lastTime = performance.now();
    }
  });
}

function handleBiomeTap(e) {
  if (isOverlayActive) return;
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check anomaly hit first — find nearest anomaly within 40px
  const anomalies = getActiveAnomalies(state);
  const hitRadius = 40;
  for (const a of anomalies) {
    const ax = a.x * rect.width;
    const ay = a.y * rect.height;
    const dist = Math.hypot(x - ax, y - ay);
    if (dist < hitRadius) {
      const reward = tapAnomaly(state, a.id);
      if (reward) {
        const color = reward.type === 'anomalyTokens' ? '#f0c860' : reward.type === 'memoryShards' ? '#b088f0' : '#7af8d4';
        spawnBurst(x, y, 12, color);
        const label = reward.type === 'anomalyTokens' ? `+${reward.amount} ★` : reward.type === 'memoryShards' ? `+${reward.amount} ♦` : `+${formatNum(reward.amount)} TR`;
        spawnFloatingNumber(x, y - 20, label, color);

        // Show chain
        if (reward.chain > 1) {
          showChain(reward.chain);
        }

        updateResourceBar(state);
        return;
      }
    }
  }

  // Base tap
  const value = getTapValue(state);
  state.residue += value;
  state.trEarnedThisLoop += value;
  state.totalTrEarned += value;

  spawnBurst(x, y, 8, '#7af8d4');
  spawnFloatingNumber(x, y - 20, `+${value}`, '#7af8d4');
  updateResourceBar(state);
}

function showChain(chain) {
  let chainEl = document.getElementById('chain-display');
  if (!chainEl) {
    chainEl = document.createElement('div');
    chainEl.id = 'chain-display';
    document.getElementById('biome-container').appendChild(chainEl);
  }
  chainEl.textContent = `${chain}-CHAIN! ${chain}x`;
  chainEl.classList.remove('visible');
  void chainEl.offsetWidth; // reflow
  chainEl.classList.add('visible');
  clearTimeout(chainEl._timeout);
  chainEl._timeout = setTimeout(() => chainEl.classList.remove('visible'), 2000);
}

function handleCombine() {
  if (!combineSlotA || !combineSlotB) return;
  const result = tryCombination(state, combineSlotA, combineSlotB);
  const resultEl = document.getElementById('combine-result');

  if (result.success) {
    const species = SPECIES[result.species];
    if (resultEl) resultEl.textContent = `Created: ${species.name}!`;
    isOverlayActive = true;
    showDiscovery(species, () => {
      isOverlayActive = false;
      renderBiome(state, document.getElementById('biome-svg'));
      renderCodex();
      showToast(`Combined: ${species.name}`, 'discovery');
    });
  } else {
    if (resultEl) {
      if (result.hint === 'future_chapter') resultEl.textContent = 'Something stirs... but the time is not yet right.';
      else if (result.hint === 'already_discovered') resultEl.textContent = 'You already know this species.';
      else if (result.hint === 'both_valid') resultEl.textContent = 'A form almost takes shape!';
      else if (result.hint === 'one_valid') resultEl.textContent = 'Something stirs... but fades.';
      else resultEl.textContent = 'Nothing happens.';
    }
  }

  // Reset slots
  combineSlotA = null;
  combineSlotB = null;
  document.getElementById('slot-a').innerHTML = '?';
  document.getElementById('slot-a').classList.remove('filled');
  document.getElementById('slot-b').innerHTML = '?';
  document.getElementById('slot-b').classList.remove('filled');
  document.getElementById('combine-btn').disabled = true;
}

// ─── Codex rendering ───
function renderCodex() {
  const grid = document.getElementById('species-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Show all chapter-accessible species
  const allSpecies = Object.values(SPECIES).filter(s => s.chapter <= state.chapter);

  for (const sp of allSpecies) {
    const discovered = state.discoveredSpecies.includes(sp.id);
    const card = document.createElement('div');
    card.className = `species-card${discovered ? '' : ' undiscovered'}`;
    card.dataset.speciesId = sp.id;

    if (discovered) {
      const svg = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${generateSpeciesSVG(sp.id, 60)}</svg>`;
      card.innerHTML = `${svg}<div class="species-name">${sp.name}</div>`;

      // Click to fill combine slot
      card.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        selectForCombine(sp.id);
      });
    } else {
      card.innerHTML = `<div style="font-size:1.5rem;color:#334">?</div><div class="species-name">???</div>`;
    }

    grid.appendChild(card);
  }
}

function selectForCombine(speciesId) {
  const species = SPECIES[speciesId];
  if (!species) return;

  const slotA = document.getElementById('slot-a');
  const slotB = document.getElementById('slot-b');
  const svgHtml = `<svg viewBox="0 0 60 60" width="40" height="40" xmlns="http://www.w3.org/2000/svg">${generateSpeciesSVG(speciesId, 60)}</svg>`;

  if (!combineSlotA) {
    combineSlotA = speciesId;
    slotA.innerHTML = svgHtml;
    slotA.classList.add('filled');
  } else if (!combineSlotB && speciesId !== combineSlotA) {
    combineSlotB = speciesId;
    slotB.innerHTML = svgHtml;
    slotB.classList.add('filled');
    document.getElementById('combine-btn').disabled = false;
  } else {
    // Reset and start over
    combineSlotA = speciesId;
    combineSlotB = null;
    slotA.innerHTML = svgHtml;
    slotA.classList.add('filled');
    slotB.innerHTML = '?';
    slotB.classList.remove('filled');
    document.getElementById('combine-btn').disabled = true;
  }

  document.getElementById('combine-result').textContent = '';
}

// ─── Chronicle rendering ───
function renderChronicle() {
  const list = document.getElementById('chronicle-list');
  if (!list) return;
  list.innerHTML = '';

  const entries = [...state.chronicleEntries].reverse();
  for (const entry of entries) {
    const div = document.createElement('div');
    div.className = 'chronicle-entry';
    div.innerHTML = `<span class="chronicle-time">Loop ${entry.loop}</span>${entry.text}`;
    list.appendChild(div);
  }
}

// ─── Stats rendering ───
function renderStats() {
  // Achievements
  const achList = document.getElementById('achievements-list');
  if (achList) {
    achList.innerHTML = '';
    const defs = _achievementDefs;
    for (const ach of defs) {
      const earned = state.achievements.includes(ach.id);
      const row = document.createElement('div');
      row.className = `achievement-row${earned ? ' earned' : ' locked'}`;
      row.innerHTML = `
        <span class="achievement-icon">${earned ? '★' : '☆'}</span>
        <div class="achievement-info">
          <div class="achievement-name">${earned ? ach.name : '???'}</div>
          <div class="achievement-desc">${earned ? ach.desc : 'Keep playing to discover...'}</div>
        </div>
      `;
      achList.appendChild(row);
    }
  }

  // Stats summary
  const detail = document.getElementById('stats-detail');
  if (detail) {
    detail.innerHTML = `
      Total TR earned: <span>${formatNum(state.totalTrEarned)}</span><br>
      Echo Matter: <span>${formatNum(state.echoMatter)}</span><br>
      Total loops: <span>${state.totalLoops}</span><br>
      Species discovered: <span>${state.discoveredSpecies.length}</span><br>
      Anomalies tapped: <span>${state.totalAnomaliesTapped || 0}</span><br>
      Achievements: <span>${state.achievements.length}</span><br>
      Play time: <span>${formatTime(state.totalPlayTime)}</span>
    `;
  }
}

// Cache achievement defs
import { getAchievementDefs as _getAchievementDefs } from './engine/progress.js';
const _achievementDefs = _getAchievementDefs();

function renderAllShops() {
  renderGenerators(state, document.getElementById('generators-list'), purchaseGenerator, renderAllShops);
  renderMultipliers(state, document.getElementById('multipliers-list'), purchaseMultiplier, renderAllShops);
  renderAutomation(state, document.getElementById('automation-list'), purchaseAutomation, renderAllShops);
  renderPermanentUpgrades(state, document.getElementById('permanent-list'), purchasePermanentUpgrade, renderAllShops);
  renderMarketplace(state, document.getElementById('market-permanent-list'));
}

function updateAllUI() {
  updateResourceBar(state);
  updateCatastropheBar(state);
  updateObjectives(state);
}

function getRandomQuote(state) {
  const progress = getCatastropheProgress(state);
  let pool;
  if (progress < 0.5) pool = QUOTES.early;
  else if (progress < 0.8) pool = QUOTES.midLoop;
  else pool = QUOTES.lateLoop;
  return pool[Math.floor(Math.random() * pool.length)];
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

document.addEventListener('DOMContentLoaded', init);
