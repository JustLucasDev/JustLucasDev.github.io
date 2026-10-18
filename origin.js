// Capítulo 0 — cena em pixel art: o personagem caminha até o portal e entra.
// Homenagem ao Minecraft, desenhada do zero em Canvas 2D (sem assets do jogo).
(() => {
  'use strict';
  const wrap = document.getElementById('origin');
  if (!wrap) return;
  const canvas = wrap.querySelector('.origin-canvas');
  const ctx = canvas.getContext('2d');
  const replayBtn = wrap.querySelector('[data-replay]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PIXEL_FONT = '"Press Start 2P", ui-monospace, monospace';

  // Linha do tempo da animação (segundos)
  const T_WALK = 0.3;   // começa a andar
  const T_ARRIVE = 3.3; // chega no portal
  const T_ENTER = 4.3;  // atravessa (zoom + roxo)
  const T_LOADED = 5.6; // fim da tela "Construindo terreno"
  const T_BACK = 6.2;   // cena volta, título aparece

  // ---------------------------------------------------------------- texturas 16x16
  let seed = 1337;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (arr) => arr[(rnd() * arr.length) | 0];
  function texture(fn) {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const t = c.getContext('2d');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { t.fillStyle = fn(x, y); t.fillRect(x, y, 1, 1); }
    return c;
  }
  const DIRT = ['#866043', '#79553a', '#96704f', '#6b4a32', '#8b6646'];
  const GRASS = ['#5b8c32', '#6aa83a', '#4f7a2a', '#73b043', '#62983a'];
  const OBSIDIAN = ['#14101e', '#1b1529', '#120e1a', '#221a33', '#0f0b16'];
  const drip = Array.from({ length: 16 }, () => 3 + ((rnd() * 3) | 0));
  const texGrass = texture((x, y) => (y < drip[x] ? pick(GRASS) : pick(DIRT)));
  const texDirt = texture(() => pick(DIRT));
  const texObsidian = texture(() => (rnd() < 0.12 ? '#3b2a5c' : pick(OBSIDIAN)));

  // ---------------------------------------------------------------- personagem (vista lateral, olhando para a direita)
  const COLORS = {
    H: '#3a2817', h: '#2c1e11', S: '#c4916c', W: '#ffffff', E: '#4b3aa8', M: '#6b3a2a',
    T: '#1fa3a3', t: '#178585', P: '#3c43a8', p: '#2e3388', G: '#5f5f5f',
  };
  const HEAD = ['HHHHHHHH', 'HHHHHHHH', 'HHHSSSSS', 'HHSSSWES', 'HHSSSSSS', 'HSSSSSSS', 'HSSSSSMS', 'hSSSSSSS'];
  const TORSO = Array(12).fill('tTTT');
  const ARM = [...Array(4).fill('TTTT'), ...Array(8).fill('SSSS')];
  const LEG = [...Array(10).fill('pPPP'), 'GGGG', 'GGGG'];

  function drawGrid(c, grid, ox, oy, P) {
    for (let r = 0; r < grid.length; r++) {
      for (let k = 0; k < grid[r].length; k++) {
        c.fillStyle = COLORS[grid[r][k]];
        c.fillRect(ox + k * P, oy + r * P, P + 0.4, P + 0.4);
      }
    }
  }

  const sprite = document.createElement('canvas');
  const sctx = sprite.getContext('2d');
  function renderSprite(phase) {
    const w = 20 * P, h = 34 * P;
    if (sprite.width !== Math.round(w * dpr)) { sprite.width = Math.round(w * dpr); sprite.height = Math.round(h * dpr); }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, w, h);
    const cx = w / 2, feet = h - P;
    const swing = Math.sin(phase) * 0.65;
    const limb = (grid, py, oy, angle, back) => {
      sctx.save();
      sctx.translate(cx, py);
      sctx.rotate(angle);
      drawGrid(sctx, grid, -2 * P, oy, P);
      if (back) { sctx.fillStyle = 'rgba(0,0,0,0.3)'; sctx.fillRect(-2 * P, oy, 4 * P, grid.length * P); }
      sctx.restore();
    };
    const hip = feet - 12 * P, shoulder = feet - 22 * P;
    limb(ARM, shoulder, -2 * P, swing, true);   // braço de trás
    limb(LEG, hip, 0, -swing, true);             // perna de trás
    drawGrid(sctx, TORSO, cx - 2 * P, feet - 24 * P, P);
    limb(LEG, hip, 0, swing, false);             // perna da frente
    limb(ARM, shoulder, -2 * P, -swing, false);  // braço da frente
    drawGrid(sctx, HEAD, cx - 4 * P, feet - 32 * P, P);
  }

  // ---------------------------------------------------------------- layout
  let dpr = 1, W = 0, H = 0, P = 4, B = 64, groundY = 0, frameLeft = 0, startX = 0, endX = 0;
  let stars = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    P = W < 640 ? 3 : 4;
    B = 16 * P;
    groundY = H - Math.round(1.4 * B);
    const wanted = W < 640 ? W - 4 * B - 12 : W * 0.64;
    frameLeft = Math.min(Math.floor(wanted / B) * B, Math.floor((W - 4 * B - 8) / B) * B);
    startX = Math.min(70, W * 0.1);
    endX = frameLeft + 2 * B;
    seed = 42;
    stars = Array.from({ length: Math.round(W / 22) }, () => ({
      x: rnd() * W, y: rnd() * (groundY - 4 * B - 10), s: rnd() < 0.2 ? 2 : 1, ph: rnd() * 6.28,
    }));
  }

  // ---------------------------------------------------------------- partículas do portal
  const particles = [];
  function spawn(n, spread = 1) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: frameLeft + B + rnd() * 2 * B,
        y: groundY - 3 * B + rnd() * 3 * B,
        vx: (rnd() - 0.5) * 40 * spread,
        vy: (rnd() - 0.7) * 40 * spread,
        life: 0.8 + rnd() * 1.4,
        age: 0,
        size: rnd() < 0.3 ? 2 : 1,
        color: pick(['#b47cff', '#8f4dff', '#e0c3ff', '#6c2bd9']),
      });
    }
  }

  // ---------------------------------------------------------------- desenho
  const PORTAL = ['#2a0a5c', '#4b1b9e', '#6c2bd9', '#8f4dff', '#b47cff'];
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const easeInOut = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
  const easeIn = (x) => x * x * x;

  function drawWorld(time) {
    // céu
    for (const s of stars) {
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.8 + s.ph));
      ctx.fillStyle = '#e8e6ff';
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s * P * 0.5, s.s * P * 0.5);
    }
    ctx.globalAlpha = 1;
    // lua quadrada
    const mx = W - 12 * P - 24, my = W < 640 ? 66 : 18; // no celular, abaixo do título
    ctx.fillStyle = '#f0ecd6';
    ctx.fillRect(mx, my, 8 * P, 8 * P);
    ctx.fillStyle = '#d6cfae';
    ctx.fillRect(mx + 2 * P, my + 2 * P, 2 * P, 2 * P);
    ctx.fillRect(mx + 5 * P, my + 4 * P, 2 * P, 2 * P);
    ctx.fillRect(mx + 3 * P, my + 6 * P, P, P);

    // chão
    ctx.imageSmoothingEnabled = false;
    for (let x = 0; x < W; x += B) {
      const inFrame = x >= frameLeft && x < frameLeft + 4 * B;
      ctx.drawImage(inFrame ? texObsidian : texGrass, x, groundY, B, B);
      ctx.drawImage(texDirt, x, groundY + B, B, B);
    }
    // sombra suave no chão
    const shade = ctx.createLinearGradient(0, groundY, 0, H);
    shade.addColorStop(0, 'rgba(10,8,30,0.15)');
    shade.addColorStop(1, 'rgba(10,8,30,0.6)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, groundY, W, H - groundY);

    // brilho do portal
    const pcx = frameLeft + 2 * B, pcy = groundY - 1.5 * B;
    const glow = ctx.createRadialGradient(pcx, pcy, B * 0.5, pcx, pcy, B * 3.2);
    glow.addColorStop(0, `rgba(143,77,255,${0.32 + 0.06 * Math.sin(time * 2)})`);
    glow.addColorStop(1, 'rgba(143,77,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(pcx - B * 3.2, pcy - B * 3.2, B * 6.4, B * 6.4);

    // moldura de obsidiana
    for (let i = 0; i < 4; i++) ctx.drawImage(texObsidian, frameLeft + i * B, groundY - 4 * B, B, B);
    for (let r = 1; r <= 3; r++) {
      ctx.drawImage(texObsidian, frameLeft, groundY - r * B, B, B);
      ctx.drawImage(texObsidian, frameLeft + 3 * B, groundY - r * B, B, B);
    }
  }

  function drawPortalInner(time, alpha) {
    const x0 = frameLeft + B, y0 = groundY - 3 * B, cell = P * 2;
    const cols = (2 * B) / cell, rows = (3 * B) / cell;
    ctx.globalAlpha = alpha;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v = Math.sin(i * 0.55 + time * 3.1) + Math.sin(j * 0.42 - time * 2.3) + Math.sin((i + j) * 0.31 + time * 1.7) + Math.sin(Math.hypot(i - cols / 2, j - rows / 2) * 0.6 - time * 4);
        ctx.fillStyle = PORTAL[Math.min(4, Math.max(0, Math.floor((v + 4) / 8 * 5)))];
        ctx.fillRect(x0 + i * cell, y0 + j * cell, cell, cell);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age > p.life) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 6 * dt;
      ctx.globalAlpha = 1 - p.age / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size * P, p.size * P);
    }
    ctx.globalAlpha = 1;
  }

  function drawLoading(time, alpha) {
    ctx.globalAlpha = alpha;
    const tile = B * 0.75;
    for (let y = 0; y < H; y += tile) for (let x = 0; x < W; x += tile) ctx.drawImage(texDirt, x, y, tile, tile);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    const size = Math.max(9, Math.min(16, Math.round(W / 46)));
    const dots = '.'.repeat(1 + (Math.floor(time * 3) % 3));
    ctx.font = `${size}px ${PIXEL_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = `${window.i18n ? window.i18n.t('Construindo terreno', 'Building terrain') : 'Construindo terreno'}${dots}`;
    ctx.fillStyle = '#3f3f3f';
    ctx.fillText(text, W / 2 + 2, H / 2 + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, W / 2, H / 2);
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- loop
  let startAt = null, running = false, visible = false, last = 0, burst = false, done = false;

  function frame(now) {
    running = false;
    const time = now / 1000;
    const dt = Math.min(0.05, last ? time - last : 0);
    last = time;
    const t = startAt === null ? 0 : time - startAt;

    const walkU = clamp01((t - T_WALK) / (T_ARRIVE - T_WALK));
    const enterU = clamp01((t - T_ARRIVE) / (T_ENTER - T_ARRIVE));
    const inside = t >= T_ARRIVE;
    const gone = t >= T_ENTER;

    if (startAt !== null && inside && !burst) { burst = true; spawn(70, 2.4); }
    if (Math.random() < dt * 14) spawn(1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (t < T_LOADED) {
      // câmera aproxima do portal enquanto ele atravessa
      const zoom = 1 + 0.9 * easeIn(enterU);
      const pcx = frameLeft + 2 * B, pcy = groundY - 1.5 * B;
      ctx.save();
      ctx.translate(pcx, pcy);
      ctx.scale(zoom, zoom);
      ctx.translate(-pcx, -pcy);
      drawWorld(time);
      drawPortalInner(time, 0.88);
      if (!gone) {
        const x = startX + (endX - startX) * easeInOut(walkU);
        const walking = walkU > 0 && walkU < 1;
        renderSprite(walking ? walkU * (endX - startX) / (P * 5) : 0);
        ctx.globalAlpha = 1 - 0.85 * enterU;
        ctx.drawImage(sprite, x - 10 * P, groundY - 33 * P, 20 * P, 34 * P);
        ctx.globalAlpha = 1;
        if (inside) drawPortalInner(time, 0.2 + 0.6 * enterU);
      }
      drawParticles(dt);
      ctx.restore();
      if (enterU > 0) {
        ctx.fillStyle = `rgba(108,43,217,${0.92 * easeIn(enterU)})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (gone) drawLoading(time, 1);
    } else {
      drawWorld(time);
      drawPortalInner(time, 0.88);
      drawParticles(dt);
      const back = clamp01((t - T_LOADED) / (T_BACK - T_LOADED));
      if (back < 1) drawLoading(time, 1 - back);
      if (!done && t >= T_BACK - 0.3) { done = true; wrap.classList.add('is-done'); }
    }

    if (visible && !reduced) { running = true; requestAnimationFrame(frame); }
  }

  function kick() {
    if (!running) { running = true; last = 0; requestAnimationFrame(frame); }
  }

  function play() {
    startAt = performance.now() / 1000;
    burst = false;
    done = false;
    wrap.classList.remove('is-done');
    kick();
  }

  function finishInstantly() {
    startAt = performance.now() / 1000 - T_BACK - 1;
    burst = true;
    kick();
  }

  replayBtn.addEventListener('click', play);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && startAt === null && entry.intersectionRatio >= 0.5) {
      if (reduced) finishInstantly(); else play();
    } else if (visible) kick();
  }, { threshold: [0, 0.5] }).observe(canvas);

  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); kick(); }, 150); });

  resize();
  (document.fonts ? document.fonts.load(`16px ${PIXEL_FONT}`) : Promise.resolve()).catch(() => {}).then(kick);
})();
