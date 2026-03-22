import { formatNum } from '../engine/utils.js';
import { getCatastrophePhase, getCatastropheProgress } from '../engine/catastrophe.js';
import { getChapterObjectives } from '../engine/progress.js';

export function updateResourceBar(state) {
  const trEl = document.getElementById('tr-count');
  const emEl = document.getElementById('em-count');
  const loopEl = document.getElementById('loop-count');
  if (trEl) trEl.textContent = formatNum(state.residue);
  if (emEl) emEl.textContent = formatNum(state.echoMatter);
  if (loopEl) loopEl.textContent = state.loop;
}

export function updateCatastropheBar(state) {
  const bar = document.getElementById('catastrophe-bar');
  const fill = document.getElementById('catastrophe-fill');
  const label = document.getElementById('catastrophe-label');
  if (!bar || !fill) return;

  const progress = getCatastropheProgress(state);
  const phase = getCatastrophePhase(state);

  fill.style.width = Math.min(progress * 100, 100) + '%';
  bar.className = '';
  bar.id = 'catastrophe-bar';
  if (phase === 'warning') bar.classList.add('warning');
  if (phase === 'critical') bar.classList.add('critical');

  if (label) {
    if (phase === 'calm') label.textContent = '';
    else if (phase === 'building') label.textContent = 'The fog stirs...';
    else if (phase === 'warning') label.textContent = 'FOG APPROACHING';
    else label.textContent = 'CATASTROPHE IMMINENT';
  }
}

export function updateObjectives(state) {
  const list = document.getElementById('objectives-list');
  if (!list) return;

  const objectives = getChapterObjectives(state.chapter);
  list.innerHTML = '';

  for (const obj of objectives) {
    const complete = !!state.chapterObjectives[obj.id];
    const div = document.createElement('div');
    div.className = `objective${complete ? ' complete' : ''}`;
    div.innerHTML = `<span class="objective-check">${complete ? '✓' : ''}</span><span>${obj.desc}</span>`;
    list.appendChild(div);
  }
}

export function updateQuoteBar(state, quote) {
  const bar = document.getElementById('quote-bar');
  if (!bar || !quote) return;
  bar.style.opacity = '0';
  setTimeout(() => {
    bar.textContent = quote;
    bar.style.opacity = '1';
    bar.style.transition = 'opacity 0.5s ease';
  }, 300);
}

export function switchPanel(panelId) {
  // Hide all panels
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById('panel-' + panelId);
  if (target) target.classList.add('active');
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panelId);
  });
}
