import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCost, getTotalProduction, canAfford, purchaseGenerator, calcEchoMatter, getTapValue, purchaseMultiplier, purchaseAutomation, purchasePermanentUpgrade } from '../../js/engine/economy.js';
import { createState } from '../../js/engine/state.js';

describe('getCost', () => {
  it('returns base cost at level 0', () => {
    assert.strictEqual(getCost(10, 0, 1.15), 10);
  });
  it('scales cost by multiplier per level', () => {
    const cost = getCost(10, 5, 1.15);
    assert.strictEqual(cost, Math.floor(10 * Math.pow(1.15, 5)));
  });
});

describe('getTotalProduction', () => {
  it('returns 0 with no generators', () => {
    const s = createState();
    assert.strictEqual(getTotalProduction(s), 0);
  });
  it('sums production from all owned generators', () => {
    const s = createState();
    s.generators = { mossPatch: 10 };
    const prod = getTotalProduction(s);
    assert.ok(prod > 0);
  });
  it('applies milestone bonuses at 10 owned', () => {
    const s = createState();
    s.generators = { mossPatch: 10 };
    const prod = getTotalProduction(s);
    assert.strictEqual(prod, 10); // 10 * 0.5 * 2 (100% bonus)
  });
});

describe('purchaseGenerator', () => {
  it('deducts cost and increments count', () => {
    const s = createState();
    s.residue = 100;
    const result = purchaseGenerator(s, 'mossPatch');
    assert.ok(result);
    assert.strictEqual(s.generators.mossPatch, 1);
    assert.strictEqual(s.residue, 90);
  });
  it('returns false if cannot afford', () => {
    const s = createState();
    s.residue = 5;
    const result = purchaseGenerator(s, 'mossPatch');
    assert.ok(!result);
    assert.strictEqual(s.generators.mossPatch || 0, 0);
  });
});

describe('purchaseMultiplier', () => {
  it('deducts cost and increments level', () => {
    const s = createState();
    s.residue = 1000;
    const result = purchaseMultiplier(s, 'sharpEyes');
    assert.ok(result);
    assert.strictEqual(s.multipliers.sharpEyes, 1);
    assert.strictEqual(s.residue, 900);
  });
  it('respects maxLevel', () => {
    const s = createState();
    s.residue = 1000000;
    s.multipliers.temporalSensitivity = 20;
    const result = purchaseMultiplier(s, 'temporalSensitivity');
    assert.ok(!result);
  });
});

describe('purchaseAutomation', () => {
  it('deducts cost and enables automation', () => {
    const s = createState();
    s.residue = 1000;
    const result = purchaseAutomation(s, 'harvester1');
    assert.ok(result);
    assert.strictEqual(s.automation.harvester1, true);
    assert.strictEqual(s.residue, 500);
  });
  it('cannot purchase twice', () => {
    const s = createState();
    s.residue = 10000;
    purchaseAutomation(s, 'harvester1');
    const result = purchaseAutomation(s, 'harvester1');
    assert.ok(!result);
  });
});

describe('purchasePermanentUpgrade', () => {
  it('spends Echo Matter', () => {
    const s = createState();
    s.echoMatter = 100;
    const result = purchasePermanentUpgrade(s, 'residualMemory');
    assert.ok(result);
    assert.strictEqual(s.permanentUpgrades.residualMemory, 1);
    assert.strictEqual(s.echoMatter, 90);
  });
  it('respects maxLevel', () => {
    const s = createState();
    s.echoMatter = 100000;
    s.permanentUpgrades.generatorBlueprint = 3;
    const result = purchasePermanentUpgrade(s, 'generatorBlueprint');
    assert.ok(!result);
  });
});

describe('calcEchoMatter', () => {
  it('returns EM based on spec formula', () => {
    const s = createState();
    s.trEarnedThisLoop = 5000;
    s.speciesDiscoveredThisLoop = 2;
    s.objectivesCompletedThisLoop = 1;
    s.anomalyTokensEarnedThisLoop = 3;
    s.chapter = 1;
    const em = calcEchoMatter(s);
    // base_em = floor(5000/500) + 2*10 + 1*25 + 3*2 = 10 + 20 + 25 + 6 = 61
    // chapter_mult = 1 * 1.5 = 1.5
    // final = floor(61 * 1.5) = 91
    assert.strictEqual(em, 91);
  });
});

describe('getTapValue', () => {
  it('returns 1 with no bonuses', () => {
    const s = createState();
    assert.strictEqual(getTapValue(s), 1);
  });
  it('scales with sharp eyes multiplier', () => {
    const s = createState();
    s.multipliers.sharpEyes = 10; // 10 * 0.1 = +100%
    assert.strictEqual(getTapValue(s), 2);
  });
});
