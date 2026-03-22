let ctx = null;
let canvas = null;
let particles = [];
let floatingTexts = [];
const MAX_PARTICLES = 150;

export function initParticles(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  if (ctx) ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

export function spawnBurst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.8 + Math.random() * 1.2,
      size: 2 + Math.random() * 3,
      color,
    });
  }
}

export function spawnAmbient(width, height) {
  if (particles.length >= MAX_PARTICLES) return;
  particles.push({
    x: Math.random() * width,
    y: height + 10,
    vx: (Math.random() - 0.5) * 8,
    vy: -(10 + Math.random() * 20),
    life: 1,
    decay: 0.15 + Math.random() * 0.2,
    size: 1 + Math.random() * 2,
    color: `hsla(${160 + Math.random() * 40}, 80%, 70%, 0.4)`,
  });
}

export function spawnFloatingNumber(x, y, text, color) {
  floatingTexts.push({
    x, y,
    text,
    color,
    life: 1,
    vy: -40,
  });
}

export function tickParticles(dt) {
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= p.decay * dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.vy *= 0.92;
    ft.life -= dt * 0.8;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

export function drawParticles() {
  if (!ctx || !canvas) return;
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  // Draw particles
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw floating texts
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px Georgia, serif';
  for (const ft of floatingTexts) {
    ctx.globalAlpha = Math.max(0, ft.life);
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
}

export function getParticleCanvas() {
  return canvas;
}
