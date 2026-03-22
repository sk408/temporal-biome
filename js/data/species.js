export const SPECIES = {
  luminmoss: {
    id: 'luminmoss', name: 'Luminmoss', chapter: 1, type: 'flora', discoverable: true,
    desc: 'Faintly glowing moss that clings to nothing in particular.',
    quote: "Found moss that glows when I touch it. Called it 'Luminmoss.' Felt like naming things might help me stay sane.",
    color: '#4af090', production: 0.1,
  },
  driftspore: {
    id: 'driftspore', name: 'Driftspore', chapter: 1, type: 'microbe', discoverable: true,
    desc: 'Tiny floating spores that drift upward, attracted to warmth.',
    quote: "Tiny things floating upward. I tried to catch one. It dissolved in my hand.",
    color: '#b088f0', production: 0.15,
  },
  poolworm: {
    id: 'poolworm', name: 'Poolworm', chapter: 1, type: 'fauna', discoverable: true,
    desc: 'A translucent worm-like creature. Completely harmless. Probably.',
    quote: "Something moved in the puddle. It looked at me. Do worms look? This one did.",
    color: '#60c8f0', production: 0.2,
  },
  copperlichen: {
    id: 'copperlichen', name: 'Copperlichen', chapter: 1, type: 'flora', discoverable: true,
    desc: 'A rust-orange lichen that tastes like pennies. Not that I tasted it.',
    quote: "Orange stuff on the rocks. It smells like a handful of coins. Named it Copperlichen because I'm creative like that.",
    color: '#d08848', production: 0.12,
  },
  fogbell: {
    id: 'fogbell', name: 'Fogbell', chapter: 1, type: 'flora', discoverable: true,
    desc: 'A tiny bell-shaped flower that only opens when the fog is near.',
    quote: "This flower opens when the fog comes. It LIKES the fog. We are very different, this flower and I.",
    color: '#8888cc', production: 0.18,
  },
  glowspore: {
    id: 'glowspore', name: 'Glowspore', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['luminmoss', 'driftspore'],
    desc: 'A spore that glows with borrowed light. Drifts with purpose.',
    quote: "Two things got close and became a new thing. Is that... evolution? Or something else entirely?",
    color: '#80e8b0', production: 0.5,
  },
  puddlemoss: {
    id: 'puddlemoss', name: 'Puddlemoss', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['luminmoss', 'poolworm'],
    desc: 'Moss that grows in water, guided by worms. An unlikely friendship.',
    quote: "The worm grows the moss. The moss feeds the worm. This is nicer than most relationships I've seen.",
    color: '#58d8a0', production: 0.4,
  },
  foglichen: {
    id: 'foglichen', name: 'Foglichen', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['copperlichen', 'fogbell'],
    desc: 'A lichen that thrives in fog, growing copper-bright tendrils.',
    quote: "Great. Now the fog is making things GROW. This place has a very different relationship with destruction than I do.",
    color: '#c89060', production: 0.45,
  },
};

export function generateSpeciesSVG(speciesId, size = 60) {
  const species = SPECIES[speciesId];
  if (!species) return '';
  const s = size;
  const cx = s/2, cy = s/2;
  const c = species.color;

  switch (speciesId) {
    case 'luminmoss':
      // Cluster of glowing circles
      return `<g>${Array.from({length: 7}, (_, i) => {
        const angle = (i/7)*Math.PI*2;
        const r = 3 + (i % 3) * 2;
        const ox = Math.cos(angle) * s * 0.2;
        const oy = Math.sin(angle) * s * 0.15;
        return `<circle cx="${cx+ox}" cy="${cy+oy}" r="${r}" fill="${c}" opacity="${0.4+((i%3)*0.2)}"><animate attributeName="r" values="${r};${r+2};${r}" dur="${2+i*0.3}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'driftspore':
      return `<g>${Array.from({length: 5}, (_, i) => {
        const ox = (i-2) * s * 0.12;
        const oy = (i % 2 === 0 ? -1 : 1) * s * 0.1;
        return `<circle cx="${cx+ox}" cy="${cy+oy}" r="${1.5+i*0.3}" fill="${c}" opacity="${0.5+i*0.08}"><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="${2+i*0.4}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'poolworm':
      return `<g><path d="M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"><animate attributeName="d" values="M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy};M${cx-12},${cy} Q${cx-6},${cy+4} ${cx},${cy} Q${cx+6},${cy-4} ${cx+12},${cy};M${cx-12},${cy} Q${cx-6},${cy-6} ${cx},${cy} Q${cx+6},${cy+6} ${cx+12},${cy}" dur="2s" repeatCount="indefinite"/></path><circle cx="${cx+11}" cy="${cy}" r="1.5" fill="${c}"/></g>`;

    case 'copperlichen':
      return `<g>${Array.from({length: 5}, (_, i) => {
        const angle = (i/5)*Math.PI*2;
        const r = 6 + (i % 3) * 3;
        return `<ellipse cx="${cx+Math.cos(angle)*r}" cy="${cy+Math.sin(angle)*r}" rx="${3+i}" ry="${2+i*0.5}" fill="${c}" opacity="${0.3+i*0.1}" transform="rotate(${i*72},${cx+Math.cos(angle)*r},${cy+Math.sin(angle)*r})"/>`;
      }).join('')}</g>`;

    case 'fogbell':
      return `<g><path d="M${cx},${cy+10} L${cx},${cy-5}" stroke="#666" stroke-width="1.5"/><path d="M${cx-6},${cy-2} Q${cx-6},${cy-10} ${cx},${cy-12} Q${cx+6},${cy-10} ${cx+6},${cy-2}" fill="${c}" opacity="0.6"><animate attributeName="opacity" values="0.6;0.3;0.6" dur="4s" repeatCount="indefinite"/></path><circle cx="${cx}" cy="${cy-1}" r="1" fill="#fff" opacity="0.5"/></g>`;

    default:
      return `<g><circle cx="${cx}" cy="${cy}" r="${s*0.25}" fill="${c}" opacity="0.5"><animate attributeName="r" values="${s*0.22};${s*0.28};${s*0.22}" dur="3s" repeatCount="indefinite"/></circle><circle cx="${cx}" cy="${cy}" r="${s*0.12}" fill="${c}" opacity="0.8"/></g>`;
  }
}

export const COMBINATIONS = [
  { a: 'luminmoss', b: 'driftspore', result: 'glowspore' },
  { a: 'luminmoss', b: 'poolworm', result: 'puddlemoss' },
  { a: 'copperlichen', b: 'fogbell', result: 'foglichen' },
];
