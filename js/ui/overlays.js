import { formatNum } from '../engine/utils.js';
import { generateSpeciesSVG, SPECIES } from '../data/species.js';

export function showDiscovery(species, callback) {
  const overlay = document.getElementById('discovery-overlay');
  if (!overlay) { if (callback) callback(); return; }

  const svgMarkup = generateSpeciesSVG(species.id, 100);
  overlay.innerHTML = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 20px ${species.color})">${svgMarkup}</svg>
    <div class="discovery-species-name" style="color: ${species.color}; text-shadow: 0 0 20px ${species.color}">${species.name}</div>
    <div class="discovery-desc">${species.desc}</div>
    <div class="discovery-quote">"${species.quote}"</div>
    <div class="discovery-tap">tap to continue</div>
  `;

  overlay.classList.add('visible');

  const dismiss = () => {
    overlay.classList.remove('visible');
    overlay.removeEventListener('pointerup', dismiss);
    if (callback) callback();
  };
  // Small delay to prevent accidental instant dismiss
  setTimeout(() => overlay.addEventListener('pointerup', dismiss), 300);
}

export function showCatastrophe(callback) {
  const overlay = document.getElementById('catastrophe-overlay');
  if (!overlay) { if (callback) callback(); return; }

  overlay.innerHTML = `<div class="catastrophe-text">THE FOG CONSUMES ALL</div>`;
  overlay.classList.add('visible');

  // Screen shake effect
  document.body.style.animation = 'shake 0.3s ease-in-out 3';

  setTimeout(() => {
    overlay.innerHTML = `<div class="catastrophe-text" style="opacity:0.5;font-size:1rem;">Everything fades...</div>`;
  }, 1500);

  setTimeout(() => {
    overlay.classList.remove('visible');
    document.body.style.animation = '';
    if (callback) callback();
  }, 2500);
}

export function showLoopSummary(stats, callback) {
  const overlay = document.getElementById('loop-summary-overlay');
  if (!overlay) { if (callback) callback(); return; }

  overlay.innerHTML = `
    <div class="loop-summary-title">Loop ${stats.loop} Complete</div>
    <div class="loop-summary-stats">
      <div class="loop-summary-stat">TR earned <span>${formatNum(stats.trEarned)}</span></div>
      <div class="loop-summary-stat">Species found <span>${stats.speciesFound} (${stats.totalSpecies} total)</span></div>
      <div class="loop-summary-stat">Objectives <span>${stats.objectivesCompleted}</span></div>
      <div class="loop-summary-stat">Tokens earned <span>${stats.tokensEarned}</span></div>
    </div>
    <div class="loop-summary-em">+${formatNum(stats.emEarned)} Echo Matter</div>
    <button class="loop-summary-btn">Continue</button>
  `;

  overlay.classList.add('visible');

  const btn = overlay.querySelector('.loop-summary-btn');
  if (btn) {
    btn.addEventListener('pointerup', () => {
      overlay.classList.remove('visible');
      if (callback) callback();
    });
  }
}
