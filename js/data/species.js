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
  rootweaver: {
    id: 'rootweaver', name: 'Rootweaver', chapter: 2, type: 'flora', discoverable: true,
    desc: 'Tangled roots that weave together, forming living bridges.',
    quote: "The roots reach for each other. Like they're holding hands. Root hands.",
    color: '#c49348', production: 0.8,
  },
  petalfly: {
    id: 'petalfly', name: 'Petalfly', chapter: 2, type: 'fauna', discoverable: true,
    desc: 'A tiny insect with flower-petal wings. Pollinates everything it touches.',
    quote: "A bug that looks like a flower. Or a flower that learned to fly. I'm not sure which is weirder.",
    color: '#f0a0c0', production: 1.0,
  },
  thornsprout: {
    id: 'thornsprout', name: 'Thornsprout', chapter: 2, type: 'flora', discoverable: true,
    desc: 'A defensive plant covered in tiny spikes. Touch at your own risk.',
    quote: "This one fights back. I respect that. From a distance.",
    color: '#3a8848', production: 0.9,
  },
  dewdrop: {
    id: 'dewdrop', name: 'Dewdrop', chapter: 2, type: 'microbe', discoverable: true,
    desc: 'A translucent blob that stores water. Wobbles when approached.',
    quote: "It's basically a living water balloon. I named it Dewdrop because it drops dew. I'm a poet.",
    color: '#88d8f0', production: 0.7,
  },
  soilmite: {
    id: 'soilmite', name: 'Soilmite', chapter: 2, type: 'fauna', discoverable: true,
    desc: 'A tiny burrowing creature that aerates soil. Essential but unglamorous.',
    quote: "It's underground, doing important work. I relate to this creature deeply.",
    color: '#d09040', production: 0.6,
  },
  vinerunner: {
    id: 'vinerunner', name: 'Vinerunner', chapter: 2, type: 'flora', discoverable: true,
    desc: 'A fast-growing vine with tiny eye-like nodes. Watches everything.',
    quote: "This vine grew six inches while I was looking at it. It was looking back.",
    color: '#90c830', production: 1.2,
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
  glowroot: {
    id: 'glowroot', name: 'Glowroot', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['rootweaver', 'luminmoss'],
    desc: 'A bioluminescent root network that pulses with inner light.',
    quote: "The roots glow now. The whole underground is a lightshow. I live in a nightclub.",
    color: '#7ad870', production: 2.0,
  },
  pollenswarm: {
    id: 'pollenswarm', name: 'Pollenswarm', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['petalfly', 'driftspore'],
    desc: 'A cloud of pollinating spores guided by tiny flying petals.',
    quote: "A swarm of flower-bugs carrying spores. It's like a tiny postal service. For pollen.",
    color: '#d0a0e0', production: 2.5,
  },
  ironbark: {
    id: 'ironbark', name: 'Ironbark', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['thornsprout', 'copperlichen'],
    desc: 'A tree encrusted with metallic lichen. Nearly indestructible.',
    quote: "A plant with armor. This ecosystem is getting serious.",
    color: '#b87830', production: 1.8,
  },
  tidecrawler: {
    id: 'tidecrawler', name: 'Tidecrawler', chapter: 2, type: 'hybrid', discoverable: false,
    ingredients: ['dewdrop', 'poolworm'],
    desc: 'An amphibious creature that moves between land and water.',
    quote: "Half fish, half... not fish. It crawls AND swims. Show-off.",
    color: '#50b8d0', production: 2.2,
  },
  // ─── Chapter 3: Fungal Dominion ───
  sporecap: {
    id: 'sporecap', name: 'Sporecap', chapter: 3, type: 'flora', discoverable: true,
    desc: 'A mushroom that releases spores in rhythmic bursts.',
    quote: "It breathes. The mushroom breathes. Every few seconds, a puff of spores. I'm standing in a mushroom's exhale.",
    color: '#b8a040', production: 3.0,
  },
  glowshroom: {
    id: 'glowshroom', name: 'Glowshroom', chapter: 3, type: 'flora', discoverable: true,
    desc: 'A bioluminescent mushroom that pulses with green light.',
    quote: "It's a nightlight. Nature made a nightlight. Down here in the dark, that feels like a gift.",
    color: '#40f0a0', production: 4.0,
  },
  mycelworm: {
    id: 'mycelworm', name: 'Mycelworm', chapter: 3, type: 'fauna', discoverable: true,
    desc: 'A pale worm that travels through mycelium networks.',
    quote: "This worm uses the fungal network like a highway. It's commuting. Underground commuting.",
    color: '#d0c080', production: 3.5,
  },
  lichenveil: {
    id: 'lichenveil', name: 'Lichenveil', chapter: 3, type: 'flora', discoverable: true,
    desc: 'Curtains of pale lichen that hang from cavern walls.',
    quote: "It hangs like curtains. The cave has curtains now. Interior decorating by nature.",
    color: '#90b888', production: 2.5,
  },
  moldweaver: {
    id: 'moldweaver', name: 'Moldweaver', chapter: 3, type: 'microbe', discoverable: true,
    desc: 'A mold that weaves intricate fractal patterns as it grows.',
    quote: "The mold makes art. Better art than I could. I'm being outperformed by fungus.",
    color: '#708048', production: 2.8,
  },
  trufflekin: {
    id: 'trufflekin', name: 'Trufflekin', chapter: 3, type: 'fauna', discoverable: true,
    desc: 'A small truffle-shaped creature that burrows and hoards nutrients.',
    quote: "A truffle with legs. It collects things and hides them. We have a lot in common.",
    color: '#c08860', production: 3.2,
  },
  cavemite: {
    id: 'cavemite', name: 'Cavemite', chapter: 3, type: 'fauna', discoverable: true,
    desc: 'A tiny arthropod that farms fungal spores in underground chambers.',
    quote: "It's farming. This mite is farming fungus. It has a better business model than me.",
    color: '#a08070', production: 2.6,
  },
  sporeling: {
    id: 'sporeling', name: 'Sporeling', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['sporecap', 'driftspore'],
    desc: 'A floating mushroom fragment that drifts through cavern air.',
    quote: "A mushroom learned to fly. Or a spore learned to be a mushroom. Either way, it's showing off.",
    color: '#a898c0', production: 6.0,
  },
  glowthread: {
    id: 'glowthread', name: 'Glowthread', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['glowshroom', 'luminmoss'],
    desc: 'Bioluminescent threads that weave through rock and soil.',
    quote: "Glowing threads everywhere. The underground is wired for light now.",
    color: '#60f0a8', production: 7.0,
  },
  rootfungus: {
    id: 'rootfungus', name: 'Rootfungus', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['mycelworm', 'rootweaver'],
    desc: 'A symbiotic fusion of root and fungus, sharing nutrients both ways.',
    quote: "Root and fungus merged. They were already helping each other, now they're the same thing.",
    color: '#c09858', production: 8.0,
  },
  thornmold: {
    id: 'thornmold', name: 'Thornmold', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['moldweaver', 'thornsprout'],
    desc: 'Armored mold with defensive spikes. Touch it and regret it.',
    quote: "The mold grew thorns. Even fungus can learn to fight back. Noted.",
    color: '#608848', production: 5.5,
  },
  fungalcoral: {
    id: 'fungalcoral', name: 'Fungal Coral', chapter: 3, type: 'hybrid', discoverable: false,
    ingredients: ['cavemite', 'poolworm'],
    desc: 'A coral-like structure built by cave organisms, filtering nutrients from dripping water.',
    quote: "They built a reef. Underground. In a cave. I'm running out of words for how weird this is.",
    color: '#b0a0c0', production: 6.5,
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

    case 'rootweaver':
      // Tangled interweaving root lines
      return `<g>${Array.from({length: 5}, (_, i) => {
        const y1 = cy - 10 + i * 5;
        const curve = (i % 2 === 0 ? -1 : 1) * 8;
        return `<path d="M${cx-15},${y1} Q${cx},${y1+curve} ${cx+15},${y1}" stroke="${c}" stroke-width="2" fill="none" opacity="${0.4+i*0.12}"><animate attributeName="d" values="M${cx-15},${y1} Q${cx},${y1+curve} ${cx+15},${y1};M${cx-15},${y1} Q${cx},${y1-curve} ${cx+15},${y1};M${cx-15},${y1} Q${cx},${y1+curve} ${cx+15},${y1}" dur="${3+i*0.5}s" repeatCount="indefinite"/></path>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="3" fill="${c}" opacity="0.7"/></g>`;

    case 'petalfly':
      // Flower-petal wings on a small body
      return `<g>${Array.from({length: 4}, (_, i) => {
        const angle = (i/4)*Math.PI*2 + Math.PI/4;
        const px = cx + Math.cos(angle) * 8;
        const py = cy + Math.sin(angle) * 8;
        return `<ellipse cx="${px}" cy="${py}" rx="5" ry="3" fill="${c}" opacity="0.5" transform="rotate(${i*90+45},${px},${py})"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="${2+i*0.3}s" repeatCount="indefinite"/></ellipse>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="2.5" fill="#fff" opacity="0.8"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2.5s" repeatCount="indefinite"/></g>`;

    case 'thornsprout':
      // Spiky plant with sharp points
      return `<g><line x1="${cx}" y1="${cy+12}" x2="${cx}" y2="${cy-8}" stroke="#2a6830" stroke-width="2.5"/>${Array.from({length: 6}, (_, i) => {
        const y = cy + 8 - i * 4;
        const dir = i % 2 === 0 ? 1 : -1;
        return `<line x1="${cx}" y1="${y}" x2="${cx+dir*7}" y2="${y-3}" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`;
      }).join('')}<circle cx="${cx}" cy="${cy-10}" r="2" fill="#5ab858" opacity="0.6"><animate attributeName="r" values="2;3;2" dur="3s" repeatCount="indefinite"/></circle></g>`;

    case 'dewdrop':
      // Wobbling translucent blob
      return `<g><ellipse cx="${cx}" cy="${cy+2}" rx="10" ry="8" fill="${c}" opacity="0.3"><animate attributeName="rx" values="10;12;10" dur="2s" repeatCount="indefinite"/><animate attributeName="ry" values="8;6;8" dur="2s" repeatCount="indefinite"/></ellipse><ellipse cx="${cx}" cy="${cy}" rx="7" ry="6" fill="${c}" opacity="0.5"><animate attributeName="rx" values="7;8;7" dur="2s" repeatCount="indefinite"/></ellipse><circle cx="${cx-2}" cy="${cy-2}" r="2" fill="#fff" opacity="0.4"/></g>`;

    case 'soilmite':
      // Tiny segmented body with legs
      return `<g>${Array.from({length: 3}, (_, i) => {
        const ox = (i-1) * 6;
        return `<ellipse cx="${cx+ox}" cy="${cy}" rx="3.5" ry="3" fill="${c}" opacity="${0.5+i*0.15}"/>`;
      }).join('')}${Array.from({length: 4}, (_, i) => {
        const x = cx - 4 + i * 3;
        return `<line x1="${x}" y1="${cy+3}" x2="${x+(i%2===0?-2:2)}" y2="${cy+7}" stroke="${c}" stroke-width="1" opacity="0.6"/>`;
      }).join('')}<circle cx="${cx+7}" cy="${cy-1}" r="1" fill="#fff" opacity="0.7"/><animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="1.5s" repeatCount="indefinite"/></g>`;

    case 'vinerunner':
      // Fast-growing vine with eye-like nodes
      return `<g><path d="M${cx-15},${cy+5} Q${cx-8},${cy-8} ${cx},${cy+2} Q${cx+8},${cy+10} ${cx+15},${cy-3}" stroke="${c}" stroke-width="2.5" fill="none"><animate attributeName="d" values="M${cx-15},${cy+5} Q${cx-8},${cy-8} ${cx},${cy+2} Q${cx+8},${cy+10} ${cx+15},${cy-3};M${cx-15},${cy+3} Q${cx-8},${cy-5} ${cx},${cy-1} Q${cx+8},${cy+7} ${cx+15},${cy-5};M${cx-15},${cy+5} Q${cx-8},${cy-8} ${cx},${cy+2} Q${cx+8},${cy+10} ${cx+15},${cy-3}" dur="4s" repeatCount="indefinite"/></path>${[[-8,-4],[0,1],[8,4]].map(([ox,oy]) => `<circle cx="${cx+ox}" cy="${cy+oy}" r="2" fill="#c8f060" opacity="0.6"/><circle cx="${cx+ox}" cy="${cy+oy}" r="0.8" fill="#1a1a1a"/>`).join('')}</g>`;

    case 'glowroot':
      // Glowing root network
      return `<g>${Array.from({length: 4}, (_, i) => {
        const angle = (i/4)*Math.PI*2;
        const ex = cx + Math.cos(angle) * 14;
        const ey = cy + Math.sin(angle) * 10;
        return `<path d="M${cx},${cy} Q${cx+Math.cos(angle)*7},${cy+Math.sin(angle)*5-4} ${ex},${ey}" stroke="${c}" stroke-width="2" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="${2+i*0.7}s" repeatCount="indefinite"/></path><circle cx="${ex}" cy="${ey}" r="2" fill="${c}" opacity="0.7"/>`;
      }).join('')}<circle cx="${cx}" cy="${cy}" r="4" fill="${c}" opacity="0.8"><animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite"/></circle></g>`;

    case 'pollenswarm':
      // Cloud of drifting particles
      return `<g>${Array.from({length: 9}, (_, i) => {
        const angle = (i/9)*Math.PI*2;
        const r = 6 + (i%3)*4;
        const ox = Math.cos(angle)*r;
        const oy = Math.sin(angle)*r;
        return `<circle cx="${cx+ox}" cy="${cy+oy}" r="${1+i%2}" fill="${c}" opacity="${0.3+i*0.06}"><animateTransform attributeName="transform" type="translate" values="0,0;${Math.cos(angle)*3},${Math.sin(angle)*3};0,0" dur="${2+i*0.3}s" repeatCount="indefinite"/></circle>`;
      }).join('')}</g>`;

    case 'ironbark':
      // Metal-encrusted tree trunk
      return `<g><rect x="${cx-4}" y="${cy-12}" width="8" height="24" rx="2" fill="#6a5040" opacity="0.8"/>${Array.from({length: 4}, (_, i) => {
        const y = cy - 8 + i * 5;
        return `<rect x="${cx-5}" y="${y}" width="10" height="3" rx="1" fill="${c}" opacity="${0.3+i*0.12}"><animate attributeName="opacity" values="${0.3+i*0.12};${0.5+i*0.12};${0.3+i*0.12}" dur="${3+i}s" repeatCount="indefinite"/></rect>`;
      }).join('')}<path d="M${cx-3},${cy-12} L${cx-10},${cy-18} M${cx+3},${cy-12} L${cx+10},${cy-18}" stroke="#5a8040" stroke-width="2"/></g>`;

    case 'tidecrawler':
      // Amphibious worm-like creature with fins
      return `<g><path d="M${cx-12},${cy} Q${cx-4},${cy-5} ${cx},${cy} Q${cx+4},${cy+5} ${cx+12},${cy}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"><animate attributeName="d" values="M${cx-12},${cy} Q${cx-4},${cy-5} ${cx},${cy} Q${cx+4},${cy+5} ${cx+12},${cy};M${cx-12},${cy+2} Q${cx-4},${cy+3} ${cx},${cy} Q${cx+4},${cy-3} ${cx+12},${cy-2};M${cx-12},${cy} Q${cx-4},${cy-5} ${cx},${cy} Q${cx+4},${cy+5} ${cx+12},${cy}" dur="2s" repeatCount="indefinite"/></path><path d="M${cx+4},${cy} L${cx+6},${cy-5} L${cx+8},${cy}" fill="${c}" opacity="0.5"/><circle cx="${cx+11}" cy="${cy}" r="1.5" fill="#fff" opacity="0.8"/></g>`;

    case 'sporecap':
      return `<g><ellipse cx="${cx}" cy="${cy-2}" rx="12" ry="7" fill="${c}" opacity="0.7"><animate attributeName="ry" values="7;8;7" dur="3s" repeatCount="indefinite"/></ellipse><rect x="${cx-2}" y="${cy+2}" width="4" height="10" rx="1" fill="#8a7030" opacity="0.6"/>${Array.from({length: 3}, (_, i) => { const sx = cx - 6 + i * 6; return `<circle cx="${sx}" cy="${cy-8}" r="1" fill="${c}" opacity="0.3"><animateTransform attributeName="transform" type="translate" values="0,0;${(i-1)*3},-8;0,0" dur="${2+i*0.5}s" repeatCount="indefinite"/></circle>`; }).join('')}</g>`;

    case 'glowshroom':
      return `<g><ellipse cx="${cx}" cy="${cy-3}" rx="10" ry="6" fill="${c}" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/></ellipse><rect x="${cx-1.5}" y="${cy+1}" width="3" height="9" rx="1" fill="#30a070" opacity="0.5"/><circle cx="${cx}" cy="${cy-3}" r="14" fill="${c}" opacity="0.08"><animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/></circle></g>`;

    case 'mycelworm':
      return `<g><path d="M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"><animate attributeName="d" values="M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy};M${cx-14},${cy-1} Q${cx-7},${cy+5} ${cx},${cy-2} Q${cx+7},${cy-5} ${cx+14},${cy+1};M${cx-14},${cy+2} Q${cx-7},${cy-5} ${cx},${cy+1} Q${cx+7},${cy+7} ${cx+14},${cy}" dur="2.5s" repeatCount="indefinite"/></path><circle cx="${cx+13}" cy="${cy}" r="1.5" fill="#f0e0a0" opacity="0.8"/><line x1="${cx-5}" y1="${cy+8}" x2="${cx+5}" y2="${cy+10}" stroke="#705830" stroke-width="0.8" opacity="0.3"/></g>`;

    case 'lichenveil':
      return `<g>${Array.from({length: 5}, (_, i) => { const lx = cx - 10 + i * 5; const len = 10 + (i % 3) * 4; return `<line x1="${lx}" y1="${cy-8}" x2="${lx + (i%2===0?2:-2)}" y2="${cy-8+len}" stroke="${c}" stroke-width="1.5" opacity="${0.3+i*0.1}" stroke-linecap="round"><animate attributeName="x2" values="${lx+(i%2===0?2:-2)};${lx+(i%2===0?-1:1)};${lx+(i%2===0?2:-2)}" dur="${3+i*0.4}s" repeatCount="indefinite"/></line>`; }).join('')}<line x1="${cx-12}" y1="${cy-8}" x2="${cx+12}" y2="${cy-8}" stroke="${c}" stroke-width="1" opacity="0.4"/></g>`;

    case 'moldweaver':
      return `<g>${Array.from({length: 4}, (_, i) => { const angle = (i/4)*Math.PI*2; const ex = cx + Math.cos(angle) * 12; const ey = cy + Math.sin(angle) * 10; const mx = cx + Math.cos(angle) * 6; const my = cy + Math.sin(angle) * 5; return `<path d="M${cx},${cy} L${mx},${my} L${ex},${ey}" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="${2+i*0.6}s" repeatCount="indefinite"/></path><circle cx="${ex}" cy="${ey}" r="1.5" fill="${c}" opacity="0.6"/>`; }).join('')}<circle cx="${cx}" cy="${cy}" r="2.5" fill="${c}" opacity="0.7"/></g>`;

    case 'trufflekin':
      return `<g><ellipse cx="${cx}" cy="${cy}" rx="8" ry="6" fill="${c}" opacity="0.7"/><ellipse cx="${cx}" cy="${cy+1}" rx="6" ry="4.5" fill="#d8a870" opacity="0.5"/>${Array.from({length: 4}, (_, i) => { const lx = cx - 5 + i * 3.3; return `<line x1="${lx}" y1="${cy+5}" x2="${lx}" y2="${cy+9}" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>`; }).join('')}<circle cx="${cx+3}" cy="${cy-2}" r="1" fill="#1a1a1a" opacity="0.7"/><animateTransform attributeName="transform" type="translate" values="0,0;1,0;0,0;-1,0;0,0" dur="2s" repeatCount="indefinite"/></g>`;

    case 'cavemite':
      return `<g>${Array.from({length: 3}, (_, i) => { const sx = cx - 4 + i * 4; return `<ellipse cx="${sx}" cy="${cy}" rx="3" ry="2.5" fill="${c}" opacity="${0.5+i*0.1}"/>`; }).join('')}${Array.from({length: 6}, (_, i) => { const lx = cx - 5 + (i % 3) * 5; const ly = cy + (i < 3 ? 2 : -2); const ley = ly + (i < 3 ? 4 : -4); return `<line x1="${lx}" y1="${ly}" x2="${lx+(i%2===0?2:-2)}" y2="${ley}" stroke="${c}" stroke-width="0.8" opacity="0.5"/>`; }).join('')}<line x1="${cx+6}" y1="${cy-2}" x2="${cx+10}" y2="${cy-6}" stroke="${c}" stroke-width="0.6" opacity="0.4"/><line x1="${cx+6}" y1="${cy-1}" x2="${cx+11}" y2="${cy-4}" stroke="${c}" stroke-width="0.6" opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="1.5s" repeatCount="indefinite"/></g>`;

    case 'sporeling':
      return `<g><ellipse cx="${cx}" cy="${cy}" rx="8" ry="5" fill="#a898c0" opacity="0.6"/>${Array.from({length: 4}, (_, i) => `<circle cx="${cx-3+i*2}" cy="${cy+6+i*2}" r="${0.8+i*0.2}" fill="#b088f0" opacity="${0.4-i*0.08}"/>`).join('')}<rect x="${cx-1}" y="${cy+3}" width="2" height="4" fill="#8878a0" opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="3s" repeatCount="indefinite"/></g>`;

    case 'glowthread':
      return `<g>${Array.from({length: 5}, (_, i) => { const y = cy - 8 + i * 4; const amp = (i % 2 === 0 ? 1 : -1) * 6; return `<path d="M${cx-15},${y} Q${cx},${y+amp} ${cx+15},${y}" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="${1.5+i*0.4}s" repeatCount="indefinite"/></path>`; }).join('')}<circle cx="${cx}" cy="${cy}" r="3" fill="${c}" opacity="0.6"><animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/></circle></g>`;

    case 'rootfungus':
      return `<g>${Array.from({length: 3}, (_, i) => { const angle = (i/3)*Math.PI*2 - Math.PI/2; const ex = cx + Math.cos(angle) * 12; const ey = cy + Math.sin(angle) * 10; return `<path d="M${cx},${cy} Q${cx+Math.cos(angle)*6},${cy+Math.sin(angle)*3} ${ex},${ey}" stroke="#c49348" stroke-width="2" fill="none" opacity="0.5"/><ellipse cx="${ex}" cy="${ey}" rx="4" ry="3" fill="${c}" opacity="0.6"><animate attributeName="opacity" values="0.6;0.9;0.6" dur="${2+i*0.5}s" repeatCount="indefinite"/></ellipse>`; }).join('')}<circle cx="${cx}" cy="${cy}" r="4" fill="${c}" opacity="0.7"/></g>`;

    case 'thornmold':
      return `<g><circle cx="${cx}" cy="${cy}" r="7" fill="${c}" opacity="0.5"/>${Array.from({length: 6}, (_, i) => { const angle = (i/6)*Math.PI*2; const sx = cx + Math.cos(angle) * 7; const sy = cy + Math.sin(angle) * 7; const ex = cx + Math.cos(angle) * 13; const ey = cy + Math.sin(angle) * 13; return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="#3a8848" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>`; }).join('')}<animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/></g>`;

    case 'fungalcoral':
      return `<g>${Array.from({length: 3}, (_, i) => { const bx = cx - 8 + i * 8; const bh = 8 + (i % 2) * 4; return `<rect x="${bx}" y="${cy - bh/2}" width="3" height="${bh}" rx="1.5" fill="${c}" opacity="0.6"/><circle cx="${bx+1.5}" cy="${cy - bh/2}" r="4" fill="${c}" opacity="0.4"/>`; }).join('')}${Array.from({length: 2}, (_, i) => `<circle cx="${cx-4+i*8}" cy="${cy+8+i*2}" r="1" fill="#80a0f0" opacity="0.3"><animate attributeName="cy" values="${cy+8+i*2};${cy+14+i*2};${cy+8+i*2}" dur="${2+i}s" repeatCount="indefinite"/></circle>`).join('')}</g>`;

    default:
      return `<g><circle cx="${cx}" cy="${cy}" r="${s*0.25}" fill="${c}" opacity="0.5"><animate attributeName="r" values="${s*0.22};${s*0.28};${s*0.22}" dur="3s" repeatCount="indefinite"/></circle><circle cx="${cx}" cy="${cy}" r="${s*0.12}" fill="${c}" opacity="0.8"/></g>`;
  }
}

export const COMBINATIONS = [
  { a: 'luminmoss', b: 'driftspore', result: 'glowspore' },
  { a: 'luminmoss', b: 'poolworm', result: 'puddlemoss' },
  { a: 'copperlichen', b: 'fogbell', result: 'foglichen' },
  { a: 'rootweaver', b: 'luminmoss', result: 'glowroot' },
  { a: 'petalfly', b: 'driftspore', result: 'pollenswarm' },
  { a: 'thornsprout', b: 'copperlichen', result: 'ironbark' },
  { a: 'dewdrop', b: 'poolworm', result: 'tidecrawler' },
  // Chapter 3 combinations
  { a: 'sporecap', b: 'driftspore', result: 'sporeling' },
  { a: 'glowshroom', b: 'luminmoss', result: 'glowthread' },
  { a: 'mycelworm', b: 'rootweaver', result: 'rootfungus' },
  { a: 'moldweaver', b: 'thornsprout', result: 'thornmold' },
  { a: 'cavemite', b: 'poolworm', result: 'fungalcoral' },
];
