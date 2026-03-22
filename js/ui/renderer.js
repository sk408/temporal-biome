import { formatNum } from '../engine/utils.js';
import { getCatastrophePhase, getCatastropheProgress } from '../engine/catastrophe.js';
import { getChapterObjectives } from '../engine/progress.js';
import { getTotalProduction } from '../engine/economy.js';

export function updateResourceBar(state) {
  const trEl = document.getElementById('tr-count');
  const emEl = document.getElementById('em-count');
  const tokenEl = document.getElementById('token-count');
  const shardEl = document.getElementById('shard-count');
  const loopEl = document.getElementById('loop-count');
  const rateEl = document.getElementById('tr-rate');
  if (trEl) trEl.textContent = formatNum(state.residue);
  if (emEl) emEl.textContent = formatNum(state.echoMatter);
  if (tokenEl) tokenEl.textContent = formatNum(state.anomalyTokens || 0);
  if (shardEl) shardEl.textContent = formatNum(state.memoryShards || 0);
  if (loopEl) loopEl.textContent = state.loop;
  if (rateEl) {
    const prod = getTotalProduction(state);
    rateEl.textContent = prod > 0 ? `(${formatNum(prod)}/s)` : '';
  }

  // Active buff indicators
  const buffBar = document.getElementById('buff-bar');
  if (buffBar) {
    if (state.activeBuffs.length === 0) {
      buffBar.style.display = 'none';
    } else {
      buffBar.style.display = 'flex';
      buffBar.innerHTML = state.activeBuffs.map(b => {
        const secs = Math.ceil(b.remaining);
        const names = { temporalAnchor: '⏸ Anchor', nurturePulse: '⚡ 2x', productionSurge: '⚡ 5x', echoCatalyst: '✦ Echo+' };
        return `<span class="buff-pill">${names[b.id] || b.id} ${secs < 9999 ? secs + 's' : ''}</span>`;
      }).join('');
    }
  }
}

export function updateCatastropheBar(state) {
  const bar = document.getElementById('catastrophe-bar');
  const fill = document.getElementById('catastrophe-fill');
  const label = document.getElementById('catastrophe-label');
  const tint = document.getElementById('catastrophe-tint');
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

  // Screen tint effect
  if (tint) {
    tint.className = '';
    if (phase === 'warning') tint.className = 'warning';
    else if (phase === 'critical') tint.className = 'critical';
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
