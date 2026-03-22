import { formatNum } from '../engine/utils.js';
import { GENERATORS, MILESTONES } from '../data/generators.js';
import { MULTIPLIERS, AUTOMATION, PERMANENT_UPGRADES, MARKET_PERMANENT, getRotatingStock } from '../data/upgrades.js';
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

export function renderMarketplace(state, permContainer, rotContainer, purchaseFn) {
  if (permContainer) {
    permContainer.innerHTML = '';
    for (const [itemId, def] of Object.entries(MARKET_PERMANENT)) {
      const currencySymbol = def.currency === 'anomalyTokens' ? '★' : '♦';
      const affordable = canAfford(state, def.cost, def.currency);
      const row = document.createElement('div');
      row.className = `buy-row${affordable ? '' : ' disabled'}`;
      row.innerHTML = `
        <div class="buy-info">
          <div class="buy-name">${def.name}</div>
          <div class="buy-detail">${def.desc}</div>
        </div>
        <span class="buy-cost ${affordable ? 'affordable' : 'unaffordable'}">${def.cost} ${currencySymbol}</span>
      `;
      if (affordable) {
        row.addEventListener('pointerup', (e) => {
          e.stopPropagation();
          purchaseFn(itemId, def);
        });
      }
      permContainer.appendChild(row);
    }
  }

  if (rotContainer) {
    rotContainer.innerHTML = '';
    const connectionsLevel = state.permanentUpgrades?.marketConnections || 0;
    const rotating = getRotatingStock(state.marketRotationSeed || 0, connectionsLevel);
    for (const def of rotating) {
      const purchased = (state.marketPurchasedThisLoop || []).includes(def.id);
      const currencySymbol = def.currency === 'anomalyTokens' ? '★' : '♦';
      const affordable = !purchased && canAfford(state, def.cost, def.currency);
      const row = document.createElement('div');
      row.className = `buy-row${purchased ? ' disabled' : (affordable ? '' : ' disabled')}`;
      row.innerHTML = `
        <div class="buy-info">
          <div class="buy-name">${def.name}</div>
          <div class="buy-detail">${def.desc}</div>
        </div>
        <span class="buy-cost ${purchased ? '' : (affordable ? 'affordable' : 'unaffordable')}">${purchased ? 'SOLD' : def.cost + ' ' + currencySymbol}</span>
      `;
      if (affordable && !purchased) {
        row.addEventListener('pointerup', (e) => {
          e.stopPropagation();
          purchaseFn(def.id, def);
        });
      }
      rotContainer.appendChild(row);
    }
  }
}
