import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canCreateLink, createLink, getMyceliumBonus, getSpeciesLinkCount, removeLink, getNetworkStats } from '../../js/engine/mycelium.js';

function makeState(overrides = {}) {
  return {
    discoveredSpecies: ['luminmoss', 'driftspore', 'poolworm', 'sporecap', 'glowshroom'],
    myceliumLinks: [],
    myceliumThreads: 50,
    chapter: 3,
    ...overrides,
  };
}

describe('canCreateLink', () => {
  it('returns true for two discovered species with enough threads', () => {
    const state = makeState();
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), true);
  });

  it('returns false if species not discovered', () => {
    const state = makeState({ discoveredSpecies: ['luminmoss'] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if not enough mycelium threads', () => {
    const state = makeState({ myceliumThreads: 2 });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if chapter < 3', () => {
    const state = makeState({ chapter: 2 });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if link already exists', () => {
    const state = makeState({ myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if link exists in reverse order', () => {
    const state = makeState({ myceliumLinks: [{ a: 'driftspore', b: 'luminmoss' }] });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });

  it('returns false if species has 3 links already', () => {
    const state = makeState({
      discoveredSpecies: ['luminmoss', 'driftspore', 'poolworm', 'sporecap', 'glowshroom'],
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'poolworm' },
        { a: 'luminmoss', b: 'sporecap' },
      ],
    });
    assert.equal(canCreateLink(state, 'luminmoss', 'glowshroom'), false);
  });

  it('returns false if same species used for both slots', () => {
    const state = makeState();
    assert.equal(canCreateLink(state, 'luminmoss', 'luminmoss'), false);
  });

  it('returns false if max 15 total links reached', () => {
    const links = [];
    const species = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];
    for (let i = 0; i < 15; i++) {
      links.push({ a: species[i], b: species[i + 1] });
    }
    const state = makeState({
      discoveredSpecies: [...species, 'luminmoss', 'driftspore'],
      myceliumLinks: links,
    });
    assert.equal(canCreateLink(state, 'luminmoss', 'driftspore'), false);
  });
});

describe('createLink', () => {
  it('creates a link and deducts threads', () => {
    const state = makeState({ myceliumThreads: 20 });
    const result = createLink(state, 'luminmoss', 'driftspore');
    assert.equal(result, true);
    assert.equal(state.myceliumLinks.length, 1);
    assert.deepEqual(state.myceliumLinks[0], { a: 'luminmoss', b: 'driftspore' });
    assert.equal(state.myceliumThreads, 10);
  });

  it('returns false if cannot create link', () => {
    const state = makeState({ myceliumThreads: 2 });
    assert.equal(createLink(state, 'luminmoss', 'driftspore'), false);
    assert.equal(state.myceliumLinks.length, 0);
  });
});

describe('getMyceliumBonus', () => {
  it('returns 0 with no links', () => {
    const state = makeState();
    assert.equal(getMyceliumBonus(state), 0);
  });

  it('returns 0.03 for one same-chapter link', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.03) < 0.001);
  });

  it('stacks bonuses for multiple same-chapter links', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'poolworm' },
      ],
    });
    const bonus = getMyceliumBonus(state);
    assert.ok(Math.abs(bonus - 0.06) < 0.001);
  });
});

describe('getSpeciesLinkCount', () => {
  it('returns 0 for unlinked species', () => {
    const state = makeState();
    assert.equal(getSpeciesLinkCount(state, 'luminmoss'), 0);
  });

  it('counts links where species appears as a or b', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'poolworm', b: 'luminmoss' },
      ],
    });
    assert.equal(getSpeciesLinkCount(state, 'luminmoss'), 2);
  });
});

describe('removeLink', () => {
  it('removes an existing link', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    removeLink(state, 'luminmoss', 'driftspore');
    assert.equal(state.myceliumLinks.length, 0);
  });

  it('removes link regardless of order', () => {
    const state = makeState({
      myceliumLinks: [{ a: 'luminmoss', b: 'driftspore' }],
    });
    removeLink(state, 'driftspore', 'luminmoss');
    assert.equal(state.myceliumLinks.length, 0);
  });
});

describe('getNetworkStats', () => {
  it('returns zero stats with no links', () => {
    const state = makeState();
    const stats = getNetworkStats(state);
    assert.equal(stats.totalLinks, 0);
    assert.equal(stats.sameChapterLinks, 0);
    assert.equal(stats.crossChapterLinks, 0);
    assert.equal(stats.connectedSpecies, 0);
  });

  it('counts same-chapter connected species', () => {
    const state = makeState({
      myceliumLinks: [
        { a: 'luminmoss', b: 'driftspore' },
        { a: 'luminmoss', b: 'poolworm' },
      ],
    });
    const stats = getNetworkStats(state);
    assert.equal(stats.totalLinks, 2);
    assert.equal(stats.sameChapterLinks, 2);
    assert.equal(stats.crossChapterLinks, 0);
    assert.equal(stats.connectedSpecies, 3);
  });
});
