import { formatNum } from '../engine/utils.js';
import { GENERATORS, MILESTONES } from '../data/generators.js';
import { MULTIPLIERS, AUTOMATION, PERMANENT_UPGRADES } from '../data/upgrades.js';
import { getCost, getGeneratorCost, canAfford } from '../engine/economy.js';

export function renderGenerators(state, container, purchaseFn, refreshFn) {
  if (!container) return;
  container.innerHTML = '';

  for (const genId of (state.unlockedGenerators || Object.keys(GENERATORS))) {
    const gen = GENERATORS[genId];
    if (!gen || gen.chapter > state.chapter) continue;

    const owned = state.generators[genId] || 0;
    const cost = getGeneratorCost(genId, owned);
    const affordable = canAfford(state, cost);

    const row = document.createElement('div');
    row.className = `buy-row${affordable ? '' : ' disabled'}`;
    row.innerHTML = `
      <div class="buy-info">
        <div class="buy-name">${gen.name}</div>
        <div class="buy-detail">${gen.baseOutput}/s each · ${gen.flavor}</div>
      </div>
      <span class="buy-count">x${owned}</span>
      <span class="buy-cost ${affordable ? 'affordable' : 'unaffordable'}">${formatNum(cost)}</span>
    `;

    if (affordable) {
      row.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        if (purchaseFn(state, genId)) refreshFn();
      });
    }

    container.appendChild(row);
  }
}

export function renderMultipliers(state, container, purchaseFn, refreshFn) {
  if (!container) return;
  container.innerHTML = '';

  for (const [multId, def] of Object.entries(MULTIPLIERS)) {
    const level = state.multipliers[multId] || 0;
    const atMax = def.maxLevel !== Infinity && level >= def.maxLevel;
    const cost = atMax ? 0 : getCost(def.baseCost, level, def.costScaling);
    const affordable = !atMax && canAfford(state, cost);

    const row = document.createElement('div');
    row.className = `buy-row${affordable ? '' : ' disabled'}`;
    row.innerHTML = `
      <div class="buy-info">
        <div class="buy-name">${def.name}</div>
        <div class="buy-detail">${def.desc}</div>
      </div>
      <span class="buy-count">Lv.${level}${atMax ? ' MAX' : ''}</span>
      <span class="buy-cost ${affordable ? 'affordable' : 'unaffordable'}">${atMax ? '-' : formatNum(cost)}</span>
    `;

    if (affordable) {
      row.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        if (purchaseFn(state, multId)) refreshFn();
      });
    }

    container.appendChild(row);
  }
}

export function renderAutomation(state, container, purchaseFn, refreshFn) {
  if (!container) return;
  container.innerHTML = '';

  for (const [autoId, def] of Object.entries(AUTOMATION)) {
    const owned = state.automation[autoId];
    const affordable = !owned && canAfford(state, def.cost);

    const row = document.createElement('div');
    row.className = `buy-row${owned ? ' disabled' : (affordable ? '' : ' disabled')}`;
    row.innerHTML = `
      <div class="buy-info">
        <div class="buy-name">${def.name}</div>
        <div class="buy-detail">${def.desc}</div>
      </div>
      <span class="buy-count">${owned ? '✓' : ''}</span>
      <span class="buy-cost ${owned ? '' : (affordable ? 'affordable' : 'unaffordable')}">${owned ? 'OWNED' : formatNum(def.cost)}</span>
    `;

    if (affordable && !owned) {
      row.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        if (purchaseFn(state, autoId)) refreshFn();
      });
    }

    container.appendChild(row);
  }
}

export function renderPermanentUpgrades(state, container, purchaseFn, refreshFn) {
  if (!container) return;
  container.innerHTML = '';

  for (const [upId, def] of Object.entries(PERMANENT_UPGRADES)) {
    const level = state.permanentUpgrades[upId] || 0;
    const atMax = level >= def.maxLevel;
    const cost = atMax ? 0 : def.costs[level];
    const affordable = !atMax && canAfford(state, cost, 'echoMatter');

    const desc = def.desc.replace('{level}', level + 1);

    const row = document.createElement('div');
    row.className = `buy-row${affordable ? '' : ' disabled'}`;
    row.innerHTML = `
      <div class="buy-info">
        <div class="buy-name">${def.name}</div>
        <div class="buy-detail">${desc}</div>
      </div>
      <span class="buy-count">Lv.${level}/${def.maxLevel}${atMax ? ' MAX' : ''}</span>
      <span class="buy-cost em ${affordable ? '' : 'unaffordable'}">${atMax ? '-' : formatNum(cost) + ' EM'}</span>
    `;

    if (affordable) {
      row.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        if (purchaseFn(state, upId)) refreshFn();
      });
    }

    container.appendChild(row);
  }
}

export function renderMarketplace(state, container) {
  if (!container) return;
  container.innerHTML = '<div class="buy-detail" style="padding:8px;text-align:center;color:#6a7a8a;">The marketplace opens in later chapters...</div>';
}
