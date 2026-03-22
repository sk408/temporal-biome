import { formatNum } from '../engine/utils.js';
import { generateSpeciesSVG, SPECIES } from '../data/species.js';

const CHAPTER_INFO = {
  1: { name: 'Primordial Soup', subtitle: '"Why do I keep waking up here?"' },
  2: { name: 'The First Garden', subtitle: '"Can things grow together, or only apart?"' },
  3: { name: 'Fungal Dominion', subtitle: '"What connects everything underground?"' },
  4: { name: 'The Coral Epoch', subtitle: '"Am I changing the loop, or is it changing me?"' },
  5: { name: 'Thornveil Jungle', subtitle: '"What happens when the ecosystem fights back?"' },
  6: { name: 'The Crystalline Age', subtitle: '"Can I see the catastrophe before it sees me?"' },
  7: { name: 'The Last Loop', subtitle: '"What if I just... don\'t let it end?"' },
};

export { CHAPTER_INFO };

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

export function showChapterTransition(chapter, callback) {
  const overlay = document.getElementById('chapter-transition-overlay');
  if (!overlay) { if (callback) callback(); return; }

  const info = CHAPTER_INFO[chapter] || { name: `Chapter ${chapter}`, subtitle: '' };
  const quotes = {
    2: "The puddles are drying up. Something else is growing.",
    3: "I can hear the roots talking. Or maybe that's just me losing it.",
    4: "The water has colors now. Colors I don't have names for.",
    5: "The jungle doesn't want me here. But I'm staying anyway.",
    6: "Everything is crystal clear. Literally. There are crystals everywhere.",
    7: "This is it. The last time I wake up. I can feel it.",
  };

  // Phase 1: White flash
  overlay.style.background = '#ffffff';
  overlay.innerHTML = '';
  overlay.classList.add('visible');

  // Phase 2: Fade to dark, show chapter info
  setTimeout(() => {
    overlay.style.background = 'rgba(10, 14, 26, 0.95)';
    overlay.style.transition = 'background 1s ease';
    overlay.innerHTML = `
      <div class="chapter-transition-label">Chapter ${chapter}</div>
      <div class="chapter-transition-name">${info.name}</div>
      <div class="chapter-transition-subtitle">${info.subtitle}</div>
      <div class="chapter-transition-quote">"${quotes[chapter] || ''}"</div>
      <div class="chapter-transition-tap">tap to continue</div>
    `;
  }, 500);

  // Phase 3: Allow dismiss after 1.5s
  setTimeout(() => {
    const dismiss = () => {
      overlay.classList.remove('visible');
      overlay.style.transition = '';
      overlay.style.background = '';
      overlay.removeEventListener('pointerup', dismiss);
      if (callback) callback();
    };
    overlay.addEventListener('pointerup', dismiss);
  }, 1500);
}
