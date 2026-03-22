import { SPECIES, generateSpeciesSVG } from '../data/species.js';
import { getAnomalyColor } from '../engine/anomalies.js';

let placedCreatures = {};

export function renderBiome(state, svgEl) {
  if (!svgEl) return;
  const w = svgEl.clientWidth || 400;
  const h = svgEl.clientHeight || 300;
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svgEl.innerHTML = '';

  // Background gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <radialGradient id="bg-glow" cx="50%" cy="60%" r="60%">
      <stop offset="0%" stop-color="#0f1a2a"/>
      <stop offset="100%" stop-color="#060a14"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
  svgEl.appendChild(defs);

  // Background rect
  const bg = createSVG('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#bg-glow)' });
  svgEl.appendChild(bg);

  // Ground/water elements
  for (let i = 0; i < 4; i++) {
    const px = w * (0.15 + i * 0.22 + Math.sin(i * 2.3) * 0.05);
    const py = h * (0.65 + Math.sin(i * 1.7) * 0.1);
    const puddle = createSVG('ellipse', {
      cx: px, cy: py,
      rx: 20 + i * 8, ry: 8 + i * 3,
      fill: 'rgba(96, 200, 240, 0.08)',
      stroke: 'rgba(96, 200, 240, 0.06)',
      'stroke-width': 1,
    });
    svgEl.appendChild(puddle);
  }

  // Rocks
  for (let i = 0; i < 3; i++) {
    const rx = w * (0.2 + i * 0.3);
    const ry = h * (0.7 + Math.sin(i * 3.1) * 0.1);
    const rock = createSVG('ellipse', {
      cx: rx, cy: ry,
      rx: 8 + i * 4, ry: 5 + i * 2,
      fill: 'rgba(80, 90, 100, 0.3)',
    });
    svgEl.appendChild(rock);
  }

  // Ambient floating dots
  for (let i = 0; i < 12; i++) {
    const dot = createSVG('circle', {
      cx: Math.random() * w,
      cy: Math.random() * h * 0.8,
      r: 0.5 + Math.random() * 1.5,
      fill: `rgba(122, 248, 212, ${0.05 + Math.random() * 0.1})`,
    });
    const anim = createSVG('animateTransform', {
      attributeName: 'transform',
      type: 'translate',
      values: `0,0;${(Math.random()-0.5)*6},${-2-Math.random()*4};0,0`,
      dur: `${4+Math.random()*4}s`,
      repeatCount: 'indefinite',
    });
    dot.appendChild(anim);
    svgEl.appendChild(dot);
  }

  // Place discovered species
  placedCreatures = {};
  const discovered = state.discoveredSpecies || [];
  discovered.forEach((speciesId, idx) => {
    const species = SPECIES[speciesId];
    if (!species) return;

    // Deterministic placement based on species index
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const baseX = w * (0.2 + col * 0.3);
    const baseY = h * (0.3 + row * 0.25);
    const x = baseX + Math.sin(idx * 2.7) * w * 0.08;
    const y = baseY + Math.cos(idx * 1.9) * h * 0.06;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x - 30}, ${y - 30})`);
    g.setAttribute('filter', 'url(#glow)');
    g.innerHTML = generateSpeciesSVG(speciesId, 60);
    svgEl.appendChild(g);

    placedCreatures[speciesId] = { x, y };
  });
}

export function renderAnomalies(state, svgEl) {
  if (!svgEl) return;

  // Remove old anomaly elements
  svgEl.querySelectorAll('.anomaly-svg').forEach(el => el.remove());

  const w = svgEl.clientWidth || 400;
  const h = svgEl.clientHeight || 300;
  const anomalies = state.activeAnomalies || [];

  for (const a of anomalies) {
    const ax = a.x * w;
    const ay = a.y * h;
    const color = getAnomalyColor(a.type);
    const remaining = a.lifetime - a.age;
    const fadeAlpha = remaining < 1 ? remaining : 1;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'anomaly-svg');
    g.setAttribute('data-anomaly-id', a.id);
    g.setAttribute('opacity', fadeAlpha);

    // Different shapes per type
    let shape;
    switch (a.type) {
      case 'token':
        shape = createSVG('polygon', {
          points: starPoints(ax, ay, 12, 6, 5),
          fill: color, opacity: 0.7, filter: 'url(#glow)',
        });
        break;
      case 'fragment':
        shape = createSVG('rect', {
          x: ax - 8, y: ay - 8, width: 16, height: 16,
          fill: color, opacity: 0.7, filter: 'url(#glow)',
          transform: `rotate(45, ${ax}, ${ay})`,
        });
        break;
      case 'burst':
        shape = createSVG('circle', {
          cx: ax, cy: ay, r: 14,
          fill: 'none', stroke: color, 'stroke-width': 2,
          opacity: 0.8, filter: 'url(#glow)',
        });
        const inner = createSVG('circle', {
          cx: ax, cy: ay, r: 6,
          fill: color, opacity: 0.5,
        });
        g.appendChild(inner);
        break;
      default: // residue
        shape = createSVG('circle', {
          cx: ax, cy: ay, r: 10,
          fill: color, opacity: 0.6, filter: 'url(#glow)',
        });
    }

    // Pulse animation
    const pulseAnim = createSVG('animateTransform', {
      attributeName: 'transform',
      type: 'scale',
      values: '1;1.15;1',
      dur: '1.5s',
      repeatCount: 'indefinite',
      additive: 'sum',
    });
    if (shape) {
      shape.appendChild(pulseAnim);
      g.appendChild(shape);
    }
    svgEl.appendChild(g);
  }
}

function createSVG(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

function starPoints(cx, cy, outerR, innerR, points) {
  const coords = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    coords.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return coords.join(' ');
}
