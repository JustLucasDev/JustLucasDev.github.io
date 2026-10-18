// Capítulo 0 em 3D: um mundo de blocos no estilo Minecraft (Three.js), com o Steve andando até o portal.
// Tudo é gerado por código (texturas pintadas pixel a pixel); nenhum arquivo do jogo é usado.
// Se WebGL ou o Three.js não estiverem disponíveis, a página usa a versão 2D (origin.js).

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const wrap = document.getElementById('origin');

function fallback2D(err) {
  if (err) console.warn('[capítulo 0] usando a versão 2D:', err);
  if (!wrap) return;
  wrap.classList.remove('is-3d');
  wrap.querySelectorAll('.origin-3d, .mc-hud, .mc-loading, .mc-portalfx').forEach((el) => el.remove());
  if (err && err.noWebGL) webglNote();
  if (!document.querySelector('script[data-origin-2d]')) {
    const s = document.createElement('script');
    s.src = 'origin.js';
    s.dataset.origin2d = '';
    document.body.appendChild(s);
  }
}

// Sem WebGL o visitante vê a versão 2D: avisa que existe a cena 3D e como liberar
function webglNote() {
  const stage = wrap.querySelector('.origin-stage');
  if (!stage || stage.querySelector('.webgl-note')) return;
  const L = (pt, en) => (window.i18n ? window.i18n.t(pt, en) : pt);
  const note = document.createElement('div');
  note.className = 'webgl-note';
  note.setAttribute('role', 'note');
  const render = () => {
    note.innerHTML = `<b>${L('Esta cena é em 3D', 'This scene is 3D')}</b><span>${L(
      'Ative a aceleração de hardware (WebGL) no navegador e recarregue a página para ver o mundo do Minecraft.',
      'Turn on hardware acceleration (WebGL) in your browser and reload the page to see the Minecraft world.'
    )}</span><button type="button" aria-label="${L('Fechar aviso', 'Close notice')}">×</button>`;
    note.querySelector('button').addEventListener('click', () => note.remove());
  };
  render();
  if (window.i18n) window.i18n.on(() => { if (note.isConnected) render(); });
  stage.appendChild(note);
}

if (wrap) start().catch(fallback2D);

async function start() {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!gl) throw Object.assign(new Error('WebGL indisponível'), { noWebGL: true });
  const lose = gl.getExtension('WEBGL_lose_context');
  if (lose) lose.loseContext();
  const THREE = await import(THREE_URL);
  build(THREE);
}

function build(THREE) {
  const stage = wrap.querySelector('.origin-stage');
  const canvas2d = wrap.querySelector('.origin-canvas');
  const replayBtn = wrap.querySelector('[data-replay]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================================================================ texturas 16x16
  let seed = 20;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (x) => 0.5 - Math.cos(Math.PI * x) / 2;

  function paint(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const color = fn(i, j);
        if (!color) continue;
        x.fillStyle = color;
        x.fillRect(i, j, 1, 1);
      }
    }
    return c;
  }
  function tex(c, mips = true) {
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = mips ? THREE.NearestMipmapLinearFilter : THREE.NearestFilter;
    t.generateMipmaps = mips;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const PAL = {
    grass: ['#5d9a33', '#67a83a', '#72b443', '#558f2e', '#7bbd4b', '#609f37'],
    grassSide: ['#5a9631', '#649f37', '#4e8629', '#6aab3c'],
    dirt: ['#866043', '#79553a', '#93704f', '#6b4a32', '#5f4130', '#8c6847'],
    log: ['#6b5232', '#5b4429', '#7a5e39', '#4f3b23', '#634b2e'],
    leaves: ['#3b7a22', '#478c2a', '#2f661b', '#56a032', '#3f8226'],
    obs: ['#14101e', '#1b1529', '#120e1a', '#221a33', '#0f0b16'],
    blade: ['#5f9e36', '#6fb03f', '#4f8a2b', '#7cc04a'],
  };

  const cGrassTop = paint(16, 16, () => pick(PAL.grass));
  const drip = Array.from({ length: 16 }, () => 2 + ((rnd() * 3) | 0));
  const cGrassSide = paint(16, 16, (x, y) => (y < drip[x] || (y === drip[x] && rnd() < 0.35) ? pick(PAL.grassSide) : pick(PAL.dirt)));
  const cDirt = paint(16, 16, () => (rnd() < 0.06 ? '#a68062' : pick(PAL.dirt)));
  const cLog = paint(16, 16, (x, y) => ((x * 7 + ((y / 5) | 0) * 3) % 5 === 0 ? '#4a3722' : pick(PAL.log)));
  const cLogTop = paint(16, 16, (x, y) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    if (d > 6.5) return pick(PAL.log);
    return Math.floor(d) % 2 ? '#a5824c' : '#bf9b62';
  });
  const cLeaves = paint(16, 16, () => (rnd() < 0.14 ? null : pick(PAL.leaves)));
  const cObs = paint(16, 16, () => (rnd() < 0.1 ? pick(['#3b2a5c', '#4a3570']) : pick(PAL.obs)));
  const bladeH = Array.from({ length: 16 }, () => (rnd() < 0.6 ? 5 + ((rnd() * 10) | 0) : 0));
  const cTallGrass = paint(16, 16, (x, y) => (bladeH[x] && y >= 16 - bladeH[x] ? (y === 16 - bladeH[x] ? '#8fd15a' : pick(PAL.blade)) : null));
  const cPoppy = paint(16, 16, (x, y) => {
    if ((x === 7 || x === 8) && y >= 8) return '#3f7f25';
    if ((x === 5 && y === 11) || (x === 6 && y === 10) || (x === 10 && y === 11) || (x === 9 && y === 12)) return '#4a8f2a';
    if (Math.hypot(x - 7.5, y - 5) < 2.7) return (x === 7 || x === 8) && (y === 5) ? '#2b1a12' : pick(['#c81e1e', '#e02a2a', '#a51414']);
    return null;
  });
  const cDandelion = paint(16, 16, (x, y) => {
    if ((x === 7 || x === 8) && y >= 9) return '#3f7f25';
    if (x >= 6 && x <= 9 && y >= 5 && y <= 8) return pick(['#f5d32a', '#ffe55c', '#e0b81c']);
    return null;
  });

  const lam = (c, extra = {}) => new THREE.MeshLambertMaterial({ map: tex(c), ...extra });
  const mGrassTop = lam(cGrassTop);
  const mGrassSide = lam(cGrassSide);
  const mDirt = lam(cDirt);
  const mLog = lam(cLog);
  const mLogTop = lam(cLogTop);
  const mObs = lam(cObs);
  const mLeaves = lam(cLeaves, { alphaTest: 0.5, side: THREE.DoubleSide });
  const plantMat = (c) => lam(c, { alphaTest: 0.5, side: THREE.DoubleSide });

  // ================================================================ renderer, cena, luz
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); // visual pixelado não precisa de alta resolução, e fica bem mais leve
  renderer.setClearColor(0x000000, 0);
  const canvas3d = renderer.domElement;
  canvas3d.className = 'origin-3d';
  canvas3d.setAttribute('aria-hidden', 'true');
  canvas2d.after(canvas3d);
  wrap.classList.add('is-3d');

  const scene = new THREE.Scene();
  // noite: neblina azul-escura, luar frio e pouca luz ambiente (as tochas e o portal fazem o resto)
  scene.fog = new THREE.Fog(0x0b1330, 12, 38);
  const camera = new THREE.PerspectiveCamera(70, 2, 0.05, 160);
  scene.add(new THREE.HemisphereLight(0x5a6fb0, 0x1c1810, 1.15));
  const moonLight = new THREE.DirectionalLight(0xa9bcff, 1.1);
  moonLight.position.set(10, 14, -6);
  scene.add(moonLight);
  scene.add(new THREE.AmbientLight(0x2a3766, 0.5));

  // ================================================================ mundo
  const PORTAL_Z = -12;
  const X_MIN = -28, X_MAX = 28, Z_MIN = -40, Z_MAX = 24;
  const FRAME_X = [-1, 0, 1, 2];
  const heightAt = (x, z) => {
    const away = Math.abs(x - 0.5);
    const rampX = clamp01((away - 4) / 6);
    const rampZ = clamp01((PORTAL_Z - 6 - z) / 8);
    // clareira plana em volta do portal, por onde a câmera passeia no final
    const clearing = clamp01((Math.hypot(x - 0.5, z - PORTAL_Z) - 11) / 4);
    const ramp = Math.min(Math.max(rampX, rampZ), clearing);
    if (ramp === 0) return 0;
    const n = Math.sin(x * 0.31) + Math.sin(z * 0.27 + 1.3) + Math.sin((x + z) * 0.17 + 0.5) + Math.sin((x - z) * 0.11);
    return Math.max(0, Math.round((n + 1.5) * 0.85 * ramp));
  };
  const H = new Map();
  const hKey = (x, z) => x * 1000 + z;
  for (let x = X_MIN; x <= X_MAX; x++) for (let z = Z_MIN; z <= Z_MAX; z++) H.set(hKey(x, z), heightAt(x, z));
  const hAt = (x, z) => (H.has(hKey(x, z)) ? H.get(hKey(x, z)) : -99);

  const grassPos = [], dirtPos = [], obsPos = [], logPos = [], leafPos = [], tallPos = [], poppyPos = [], dandPos = [];
  for (let x = X_MIN; x <= X_MAX; x++) {
    for (let z = Z_MIN; z <= Z_MAX; z++) {
      const h = hAt(x, z);
      const portalBase = z === PORTAL_Z && FRAME_X.includes(x);
      (portalBase ? obsPos : grassPos).push([x, h, z]);
      const lowest = Math.min(hAt(x + 1, z), hAt(x - 1, z), hAt(x, z + 1), hAt(x, z - 1));
      for (let y = h - 1; y >= -2; y--) {
        if (y > lowest || lowest === -99) dirtPos.push([x, y, z]); // só os blocos com alguma face à mostra
      }
    }
  }
  for (const x of [-1, 2]) for (let y = 1; y <= 3; y++) obsPos.push([x, y, PORTAL_Z]);
  for (const x of FRAME_X) obsPos.push([x, 4, PORTAL_Z]);

  const TREES = [[-6, -3], [12, -1], [-8, -16], [9, -18], [-6, 6], [10, 3], [-13, -8], [14, -12], [-3, -24], [6, -28], [-16, 4], [17, 10], [-12, 15], [8, 14], [-20, -18], [20, -4]];
  const treeSpots = new Set();
  for (const [tx, tz] of TREES) {
    const h = hAt(tx, tz);
    const top = h + 5;
    treeSpots.add(hKey(tx, tz));
    for (let y = h + 1; y <= top; y++) logPos.push([tx, y, tz]);
    for (let y = top - 2; y <= top + 1; y++) {
      const r = y >= top ? 1 : 2;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (dx === 0 && dz === 0 && y <= top) continue;
          const corner = Math.abs(dx) === r && Math.abs(dz) === r;
          if (y === top + 1 && Math.abs(dx) + Math.abs(dz) > 1) continue;
          if (corner && rnd() < 0.5) continue;
          leafPos.push([tx + dx, y, tz + dz]);
        }
      }
    }
  }
  for (let x = X_MIN + 1; x < X_MAX; x++) {
    for (let z = Z_MIN + 1; z < Z_MAX; z++) {
      if (Math.abs(x - 0.5) < 3 || treeSpots.has(hKey(x, z)) || (z === PORTAL_Z && FRAME_X.includes(x))) continue;
      const r = rnd();
      const p = [x, hAt(x, z) + 1, z];
      if (r < 0.13) tallPos.push(p);
      else if (r < 0.145) poppyPos.push(p);
      else if (r < 0.16) dandPos.push(p);
    }
  }

  const box = new THREE.BoxGeometry(1, 1, 1);
  const crossGeo = (() => {
    const g = new THREE.BufferGeometry();
    const s = 0.42;
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -s, -0.5, -s, s, -0.5, s, s, 0.5, s, -s, 0.5, -s,
      -s, -0.5, s, s, -0.5, -s, s, 0.5, -s, -s, 0.5, s,
    ], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Array(8).fill([0, 1, 0]).flat(), 3)); // luz uniforme, como no jogo
    g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
    return g;
  })();
  const m4 = new THREE.Matrix4();
  function instanced(geo, mats, positions) {
    if (!positions.length) return;
    const mesh = new THREE.InstancedMesh(geo, mats, positions.length);
    positions.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); mesh.setMatrixAt(i, m4); });
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  }
  // ordem das faces do BoxGeometry: +x, -x, +y (topo), -y, +z, -z
  instanced(box, [mGrassSide, mGrassSide, mGrassTop, mDirt, mGrassSide, mGrassSide], grassPos);
  instanced(box, mDirt, dirtPos);
  instanced(box, mObs, obsPos);
  instanced(box, [mLog, mLog, mLogTop, mLogTop, mLog, mLog], logPos);
  instanced(box, mLeaves, leafPos);
  instanced(crossGeo, plantMat(cTallGrass), tallPos);
  instanced(crossGeo, plantMat(cPoppy), poppyPos);
  instanced(crossGeo, plantMat(cDandelion), dandPos);

  // ---------------------------------------------------------------- portal
  const pCan = document.createElement('canvas');
  pCan.width = 32;
  pCan.height = 48;
  const pCtx = pCan.getContext('2d');
  const pImg = pCtx.createImageData(32, 48);
  const portalTex = tex(pCan, false);
  const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 3),
    new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, opacity: 0.86, side: THREE.DoubleSide, depthWrite: false, fog: false }),
  );
  portal.position.set(0.5, 2, PORTAL_Z);
  scene.add(portal);
  const PORTAL_RGB = [[42, 10, 92], [75, 27, 158], [108, 43, 217], [143, 77, 255], [180, 124, 255]];
  function drawPortal(t) {
    const d = pImg.data;
    for (let y = 0; y < 48; y++) {
      for (let x = 0; x < 32; x++) {
        const v = Math.sin(x * 0.35 + t * 3.1) + Math.sin(y * 0.25 - t * 2.3) + Math.sin((x + y) * 0.2 + t * 1.7) + Math.sin(Math.hypot(x - 16, y - 24) * 0.4 - t * 4);
        const c = PORTAL_RGB[Math.min(4, Math.max(0, Math.floor(((v + 4) / 8) * 5)))];
        const i = (y * 32 + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 225;
      }
    }
    pCtx.putImageData(pImg, 0, 0);
    portalTex.needsUpdate = true;
  }
  const portalLight = new THREE.PointLight(0xa35cff, 14, 8, 1.4);
  portalLight.position.set(0.5, 2, PORTAL_Z + 0.9);
  scene.add(portalLight);

  // partículas roxas
  const PN = 70;
  const pPos = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN);
  function resetParticle(i, burst = false) {
    pPos[i * 3] = 0.5 + (rnd() - 0.5) * (burst ? 1.5 : 3.2);
    pPos[i * 3 + 1] = 0.6 + rnd() * 3.4;
    pPos[i * 3 + 2] = PORTAL_Z + (rnd() - 0.5) * (burst ? 0.6 : 2.4);
    const s = burst ? 2.2 : 0.35;
    pVel[i * 3] = (0.5 - pPos[i * 3]) * s * (burst ? -1 : 1);
    pVel[i * 3 + 1] = (rnd() - 0.35) * (burst ? 1.6 : 0.5);
    pVel[i * 3 + 2] = (PORTAL_Z - pPos[i * 3 + 2]) * s * (burst ? -1 : 1) + (burst ? (rnd() - 0.2) * 2 : 0);
    pLife[i] = 0.5 + rnd() * 1.6;
  }
  for (let i = 0; i < PN; i++) resetParticle(i);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc08bff, size: 0.07, transparent: true, opacity: 0.95, depthWrite: false })));

  // ---------------------------------------------------------------- céu noturno: nuvens, estrelas e lua
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0x2c3658, transparent: true, opacity: 0.55 });
  const clouds = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(4 + ((rnd() * 9) | 0), 1, 3 + ((rnd() * 6) | 0)), cloudMat);
    m.position.set(-70 + rnd() * 140, 17 + (rnd() < 0.3 ? 1 : 0), -60 + rnd() * 80);
    scene.add(m);
    clouds.push(m);
  }
  // estrelas: pontos fixos numa cúpula distante, sem neblina
  const SN = 420;
  const sPos = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const az = rnd() * Math.PI * 2, el = 0.06 + Math.pow(rnd(), 0.8) * 1.45;
    sPos[i * 3] = Math.cos(el) * Math.cos(az) * 120;
    sPos[i * 3 + 1] = Math.sin(el) * 120;
    sPos[i * 3 + 2] = Math.cos(el) * Math.sin(az) * 120;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // lua quadrada com crateras, como a do jogo
  const cMoon = paint(16, 16, (x, y) => {
    if (x < 2 || x > 13 || y < 2 || y > 13) return null;
    const crater = [[5, 5, 1.6], [10, 8, 2.1], [6, 11, 1.2], [11, 4, 1]].some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r);
    return crater ? pick(['#9aa3b5', '#a7afbf']) : pick(['#e6ebf4', '#dde3ee', '#f1f4fa']);
  });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: tex(cMoon, false), transparent: true, fog: false }));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: 0x8ea6ff, transparent: true, opacity: 0.1, fog: false, depthWrite: false }));
  sun.position.set(-34, 36, -70);
  halo.position.copy(sun.position);
  scene.add(halo, sun);

  // ================================================================ Steve (proporções do jogo: 1 bloco = 16 px)
  const S = {
    hair: ['#2f1f0f', '#3b2714', '#33220f'], skin: ['#c69c7c', '#bd8f6e', '#c9a080'],
    shirt: ['#00aaaa', '#00a0a0', '#06b3b3', '#009999'], pants: ['#3c3cb4', '#3333a6', '#4141bd', '#2d2d99'],
    shoe: ['#6b6b6b', '#5e5e5e', '#777777'],
  };
  const skinOrHair = (isHair) => pick(isHair ? S.hair : S.skin);
  const headFaces = {
    pz: paint(8, 8, (x, y) => {
      if (y < 2 || (y === 2 && (x === 0 || x === 7))) return pick(S.hair);
      if (y === 4 && (x === 1 || x === 6)) return '#ffffff';
      if (y === 4 && (x === 2 || x === 5)) return '#523d89';
      if (y === 5 && (x === 3 || x === 4)) return '#a2694a';
      if (y === 6 && (x === 3 || x === 4)) return '#4a2d1f';
      if ((y === 6 && (x === 2 || x === 5)) || (y === 7 && x >= 2 && x <= 5)) return '#6a4030';
      return pick(S.skin);
    }),
    nz: paint(8, 8, () => pick(S.hair)),
    px: paint(8, 8, (x, y) => skinOrHair(y < 2 || x >= 5 || (y === 2 && x >= 3))), // esquerda da textura = frente
    nx: paint(8, 8, (x, y) => skinOrHair(y < 2 || x <= 2 || (y === 2 && x <= 4))), // direita da textura = frente
    py: paint(8, 8, () => pick(S.hair)),
    ny: paint(8, 8, () => pick(S.skin)),
  };
  const shirt = () => pick(S.shirt);
  const bodyFaces = {
    pz: paint(8, 12, (x, y) => ((y === 0 && x >= 2 && x <= 5) || (y === 1 && (x === 3 || x === 4)) ? pick(S.skin) : shirt())),
    nz: paint(8, 12, shirt), px: paint(4, 12, shirt), nx: paint(4, 12, shirt),
    py: paint(8, 4, shirt), ny: paint(8, 4, () => pick(S.pants)),
  };
  const armSide = () => paint(4, 12, (x, y) => (y < 4 ? shirt() : pick(S.skin)));
  const armFaces = { pz: armSide(), nz: armSide(), px: armSide(), nx: armSide(), py: paint(4, 4, shirt), ny: paint(4, 4, () => pick(S.skin)) };
  const legSide = () => paint(4, 12, (x, y) => (y < 10 ? pick(S.pants) : pick(S.shoe)));
  const legFaces = { pz: legSide(), nz: legSide(), px: legSide(), nx: legSide(), py: paint(4, 4, () => pick(S.pants)), ny: paint(4, 4, () => pick(S.shoe)) };

  const steveMats = [];
  function part(w, h, d, faces) {
    const mats = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((k) => {
      const m = new THREE.MeshLambertMaterial({ map: tex(faces[k], false), transparent: true });
      steveMats.push(m);
      return m;
    });
    return new THREE.Mesh(new THREE.BoxGeometry(w / 16, h / 16, d / 16), mats);
  }
  const steve = new THREE.Group();
  const head = part(8, 8, 8, headFaces);
  head.name = 'head';
  head.position.y = 1.75;
  const body = part(8, 12, 4, bodyFaces);
  body.position.y = 1.125;
  const limb = (faces, x, pivotY, meshY) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, pivotY, 0);
    const mesh = part(4, 12, 4, faces);
    mesh.position.y = meshY;
    pivot.add(mesh);
    steve.add(pivot);
    return pivot;
  };
  const legL = limb(legFaces, -0.125, 0.75, -0.375);
  const legR = limb(legFaces, 0.125, 0.75, -0.375);
  const armL = limb(armFaces, -0.375, 1.375, -0.25);
  const armR = limb(armFaces, 0.375, 1.375, -0.25);
  steve.add(head, body);
  steve.rotation.y = Math.PI; // anda na direção -z, rumo ao portal
  scene.add(steve);

  // ---- Herobrine: espiando ao lado de uma árvore distante, sempre encarando a câmera
  const heroFaceC = document.createElement('canvas');
  heroFaceC.width = heroFaceC.height = 8;
  const hf = heroFaceC.getContext('2d');
  hf.drawImage(headFaces.pz, 0, 0);
  hf.fillStyle = '#ffffff';
  [1, 2, 5, 6].forEach((x) => hf.fillRect(x, 4, 1, 1)); // olhos todos brancos
  const hero = steve.clone(true);
  hero.traverse((o) => {
    // sem neblina: ele fica nítido mesmo lá no fundo, o que deixa tudo mais sinistro
    if (o.isMesh) o.material = o.material.map((m) => { const c = m.clone(); c.transparent = false; c.opacity = 1; c.fog = false; return c; });
  });
  const heroHead = hero.getObjectByName('head');
  // só os pixels dos olhos brilham (emissiveMap), como na skin original do Herobrine
  const eyeMask = paint(8, 8, (x, y) => (y === 4 && [1, 2, 5, 6].includes(x) ? '#ffffff' : '#000000'));
  heroHead.material[4] = new THREE.MeshLambertMaterial({ map: tex(heroFaceC, false), emissive: 0xffffff, emissiveMap: tex(eyeMask, false), fog: false });
  // halo suave em cada olho (gradiente radial, sempre de frente para a câmera), para os olhos aparecerem de longe
  const glowC = document.createElement('canvas');
  glowC.width = glowC.height = 64;
  const gctx = glowC.getContext('2d');
  const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 64, 64);
  const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, transparent: true });
  const eyeGlows = [-0.125, 0.125].map(() => {
    const s = new THREE.Sprite(glowMat);
    s.renderOrder = 10;
    s.visible = false;
    scene.add(s);
    return s;
  });
  // atrás do tronco da árvore lá no fundo (-20, -18), meio corpo para fora, olhando para a câmera
  // à direita do portal, longe do chat: ao lado do tronco da árvore (6, -28), meio escondido atrás dela
  hero.position.set(5.35, hAt(5, -28) + 0.5, -28.4);
  hero.rotation.y = 1.06;
  hero.visible = false;
  scene.add(hero);
  const eyeSpot = new THREE.Vector3();

  // névoa local em volta da árvore do Herobrine: "nuvens" translúcidas que flutuam devagar
  const mistC = document.createElement('canvas');
  mistC.width = mistC.height = 64;
  const mctx = mistC.getContext('2d');
  const mg = mctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  mg.addColorStop(0, 'rgba(255,255,255,1)');
  mg.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  mg.addColorStop(1, 'rgba(255,255,255,0)');
  mctx.fillStyle = mg;
  mctx.fillRect(0, 0, 64, 64);
  const mistTex = new THREE.CanvasTexture(mistC);
  const mist = [];
  const mistMat = new THREE.SpriteMaterial({ map: mistTex, color: 0x5d6d96, transparent: true, opacity: 0.38, depthWrite: false, fog: false });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Sprite(mistMat); // um material só para todas (menos trocas de estado na GPU)
    const base = new THREE.Vector3(6 + (rnd() - 0.5) * 9, hAt(6, -28) + 1 + rnd() * 3.5, -28 + (rnd() - 0.5) * 9);
    const size = 4 + rnd() * 4;
    m.scale.set(size * 1.6, size, 1);
    m.position.copy(base);
    m.userData = { base, phase: rnd() * Math.PI * 2, speed: 0.15 + rnd() * 0.2 };
    scene.add(m);
    mist.push(m);
  }
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);
  function setSteveOpacity(a) { steveMats.forEach((m) => { m.opacity = a; }); shadow.material.opacity = 0.28 * a; }

  // ================================================================ HUD (hotbar, corações, XP, chat) e telas
  function isoIcon(top, side, shade = true) {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const faces = [
      [14 / 16, 7 / 16, -14 / 16, 7 / 16, 16, 2, top, 0],
      [14 / 16, 7 / 16, 0, 14 / 16, 2, 9, side, 0.22],
      [14 / 16, -7 / 16, 0, 14 / 16, 16, 16, side, 0.4],
    ];
    for (const [a, b, cc, d, e, f, img, dark] of faces) {
      x.setTransform(a, b, cc, d, e, f);
      x.drawImage(img, 0, 0);
      if (shade && dark) { x.fillStyle = `rgba(0,0,0,${dark})`; x.fillRect(0, 0, 16, 16); }
    }
    return c;
  }
  const cTorch = paint(16, 16, (x, y) => {
    if ((x === 7 || x === 8) && y >= 6) return y % 3 ? '#6b4f2a' : '#8a6a3a';
    if ((x === 7 || x === 8) && y === 5) return '#ffef9a';
    if ((x === 7 || x === 8) && y === 4) return '#ffd84a';
    if ((x === 6 || x === 9) && y === 5) return '#ff9c2a';
    return null;
  });
  const HOTBAR = [
    { icon: isoIcon(cGrassTop, cGrassSide), n: 64 },
    { icon: isoIcon(cDirt, cDirt), n: 64 },
    { icon: isoIcon(cLogTop, cLog), n: 32 },
    { icon: isoIcon(cLeaves, cLeaves), n: 48 },
    { icon: isoIcon(cObs, cObs), n: 10 },
    { icon: cTorch, n: 16 },
    {}, {}, {},
  ];

  // tochas acesas no chão: iluminam o caminho e o portal à noite
  const torchMat = new THREE.MeshBasicMaterial({ map: tex(cTorch, false), alphaTest: 0.5, side: THREE.DoubleSide });
  const flameC = document.createElement('canvas');
  flameC.width = flameC.height = 32;
  const fctx = flameC.getContext('2d');
  const fg = fctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  fg.addColorStop(0, 'rgba(255,220,140,1)');
  fg.addColorStop(1, 'rgba(255,150,40,0)');
  fctx.fillStyle = fg;
  fctx.fillRect(0, 0, 32, 32);
  const flameMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(flameC), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: 0.8 });
  const torches = [[-2, PORTAL_Z + 1], [3, PORTAL_Z + 1], [-2, -2], [3, -5]].map(([x, z], i) => {
    const y = hAt(x, z) + 1;
    const mesh = new THREE.Mesh(crossGeo, torchMat);
    mesh.position.set(x, y, z);
    const glow = new THREE.Sprite(flameMat);
    glow.position.set(x, y + 0.2, z);
    glow.scale.setScalar(0.9);
    const light = new THREE.PointLight(0xffa64a, 7, 9, 1.5);
    light.position.set(x, y + 0.4, z);
    scene.add(mesh, glow, light);
    return { light, phase: i * 1.7 };
  });

  const hud = document.createElement('div');
  hud.className = 'mc-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = '<div class="mc-crosshair"></div><div class="mc-chat"></div><div class="mc-bars"><canvas class="mc-hearts" width="80" height="7"></canvas><div class="mc-xp"><span></span></div><div class="mc-hotbar"></div></div>';
  const chatEl = hud.querySelector('.mc-chat');
  const hotbarEl = hud.querySelector('.mc-hotbar');
  HOTBAR.forEach((item, i) => {
    const slot = document.createElement('div');
    slot.className = `mc-slot${i === 0 ? ' sel' : ''}`;
    if (item.icon) {
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(item.icon, 0, 0, 32, 32);
      slot.appendChild(c);
      const n = document.createElement('b');
      n.textContent = item.n;
      slot.appendChild(n);
    }
    hotbarEl.appendChild(slot);
  });
  // corações: 10, como no jogo
  const HEART = ['.KK.KK.', 'KRWKRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];
  const hctx = hud.querySelector('.mc-hearts').getContext('2d');
  for (let i = 0; i < 10; i++) {
    HEART.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.') return;
      hctx.fillStyle = { K: '#1a0000', R: '#db1d22', W: '#ff9a9a' }[ch];
      hctx.fillRect(i * 8 + x, y, 1, 1);
    }));
  }

  const portalFx = document.createElement('div');
  portalFx.className = 'mc-portalfx';
  const loading = document.createElement('div');
  loading.className = 'mc-loading';
  loading.style.backgroundImage = `url(${cDirt.toDataURL()})`;
  loading.innerHTML = '<p>Construindo terreno</p>';
  const loadingText = loading.querySelector('p');
  canvas3d.after(hud, portalFx, loading);

  function addChat(text, cls, persist = false) {
    const p = document.createElement('p');
    p.textContent = text;
    if (cls) p.className = cls;
    chatEl.appendChild(p);
    if (!persist) setTimeout(() => { p.style.opacity = '0'; }, 10000);
  }
  // A história, contada no chat do jogo depois do portal: [segundos após T_DONE, mensagem]
  // [segundos, português, inglês]; o idioma é escolhido quando a mensagem aparece
  const L = (pt, en) => (window.i18n ? window.i18n.t(pt, en) : pt);
  const STORY = [
    [0.4, '<Lucas> Eu tinha 15 anos. Antes de qualquer empresa ou faculdade, teve o Minecraft.', '<Lucas> I was 15. Before any job or college, there was Minecraft.'],
    [1.5, '<Lucas> Eu queria ter o meu próprio servidor e, para isso, fui atrás de aprender Java.', '<Lucas> I wanted my own server, so I set out to learn Java.'],
    [2.8, '<Lucas> Entre configurações, plugins e muitos erros no console, percebi que gostava mais de ver as linhas de código e fazer o servidor rodar do que de jogar.', '<Lucas> Between configs, plugins and countless console errors, I realized I liked reading lines of code and getting the server running more than actually playing.'],
    [4.2, '<Lucas> Foi o meu primeiro portal para a programação.', '<Lucas> It was my first portal into programming.'],
  ];

  // ================================================================ animação
  const T_INTRO = 0.8, T_WALK = 3.5, T_ENTER = 4.3, T_LOAD = 5.1, T_DONE = 5.5; // ~40% mais rápido
  const Z_START = 3, Z_STOP = PORTAL_Z - 0.2;
  const look = new THREE.Vector3();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  let startAt = null, last = 0, raf = 0, visible = false, done = false, chatStep = 0, burst = false;
  let swingAmp = 0, par = 0, parTarget = 0;

  let lastPortal = -1;
  function update(t, now, dt) {
    // textura do portal a 20 fps (como no jogo), em vez de todo quadro
    if (now - lastPortal >= 0.05) { drawPortal(now); lastPortal = now; }
    for (const c of clouds) { c.position.x += dt * 0.8; if (c.position.x > 70) c.position.x = -70; }
    // chama das tochas tremula
    for (const tc of torches) tc.light.intensity = 6.5 + Math.sin(now * 9 + tc.phase) * 0.8 + Math.sin(now * 23 + tc.phase * 2) * 0.5;
    starMat.opacity = 0.8 + Math.sin(now * 1.3) * 0.1;
    for (const m of mist) {
      const { base, phase, speed } = m.userData;
      m.position.set(base.x + Math.sin(now * speed + phase) * 1.4, base.y + Math.sin(now * speed * 0.7 + phase) * 0.3, base.z + Math.cos(now * speed + phase) * 1.4);
    }
    sun.lookAt(camera.position);
    halo.lookAt(camera.position);
    par += (parTarget - par) * Math.min(1, dt * 3);

    if (startAt !== null && t >= T_WALK && !burst) { burst = true; for (let i = 0; i < PN; i += 2) resetParticle(i, true); }
    for (let i = 0; i < PN; i++) {
      pLife[i] -= dt;
      if (pLife[i] <= 0) { resetParticle(i); continue; }
      pPos[i * 3] += pVel[i * 3] * dt;
      pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
      pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
    }
    pGeo.attributes.position.needsUpdate = true;

    // ---- Steve
    let z = Z_START, walking = false;
    if (startAt !== null && t >= T_INTRO) {
      z = lerp(Z_START, Z_STOP, clamp01((t - T_INTRO) / (T_WALK - T_INTRO)));
      if (t >= T_WALK) z = Z_STOP - clamp01((t - T_WALK) / (T_ENTER - T_WALK)) * 1.2;
      walking = t < T_ENTER;
    }
    swingAmp += ((walking ? 0.75 : 0) - swingAmp) * Math.min(1, dt * 8);
    const sw = Math.sin(Math.abs(z - Z_START) * 1.9) * swingAmp;
    legL.rotation.x = sw;
    legR.rotation.x = -sw;
    armL.rotation.x = -sw * 0.9;
    armR.rotation.x = sw * 0.9;
    armL.rotation.z = -0.05 - Math.sin(now * 1.3) * 0.03;
    armR.rotation.z = 0.05 + Math.sin(now * 1.3) * 0.03;
    head.rotation.y = t < T_INTRO ? Math.sin(now * 1.1) * 0.45 : head.rotation.y * 0.9;
    steve.position.set(0.5, 0.5, z);
    shadow.position.set(0.5, 0.505, z);
    setSteveOpacity(1 - clamp01((t - T_WALK) / ((T_ENTER - T_WALK) * 0.8)));
    steve.visible = shadow.visible = startAt === null || t < T_ENTER;
    // aparece depois do título, fica ~6 s, os olhos piscam e ele some de uma vez
    const heroT = startAt === null ? -1 : t - (T_DONE + 1.2);
    hero.visible = heroT >= 0 && heroT < 6.4;
    eyeGlows.forEach((s) => { s.visible = hero.visible; });
    if (hero.visible) {
      // ele acompanha a câmera com o olhar
      hero.rotation.y = Math.atan2(camera.position.x - hero.position.x, camera.position.z - hero.position.z);
      hero.updateMatrixWorld(true);
      const flicker = heroT > 5.4 ? (Math.sin(heroT * 40) > 0 ? 1 : 0.15) : 1;
      glowMat.opacity = (0.85 + 0.15 * Math.sin(now * 3)) * flicker;
      eyeGlows.forEach((s, i) => {
        s.position.copy(heroHead.localToWorld(eyeSpot.set(i ? 0.125 : -0.125, -0.03125, 0.27)));
        s.scale.setScalar(0.3 + 0.04 * Math.sin(now * 3));
      });
    }

    // ---- câmera
    let fov = 70, fx = 0;
    if (startAt === null || t < T_WALK) {
      // começa de frente para o Steve, gira pela direita e passa a segui-lo por trás
      const k = startAt === null ? 0 : easeInOut(clamp01((t - (T_INTRO - 0.3)) / 1.4));
      const phi = lerp(2.55, 0.3, k);
      const r = lerp(3.6, 4.4, k);
      camera.position.set(0.5 + r * Math.sin(phi), 0.5 + lerp(1.6, 2.1, k), z + r * Math.cos(phi));
      look.set(0.5, 0.5 + lerp(1.45, 1.2, k), z + lerp(0, -4, k));
    } else if (t < T_ENTER) {
      // atravessa o portal junto com ele
      const e = clamp01((t - T_WALK) / (T_ENTER - T_WALK));
      const ei = e * e * e;
      from.set(0.5 + 4.4 * Math.sin(0.3), 2.6, Z_STOP + 4.4 * Math.cos(0.3));
      to.set(0.5, 2, PORTAL_Z + 0.4);
      camera.position.lerpVectors(from, to, ei);
      look.set(0.5, lerp(1.7, 2, e), PORTAL_Z - 4);
      fov = 70 + 45 * ei;
      fx = ei;
    } else {
      // depois: câmera passeia em volta do portal
      const it = Math.max(0, t - T_LOAD);
      const phi = 0.45 + Math.sin(it * 0.1) * 0.25 + par * 0.4;
      const cx = 0.5, cy = 2.2, cz = PORTAL_Z;
      camera.position.set(cx + 9 * Math.sin(phi), cy + 2, cz + 9 * Math.cos(phi));
      look.set(cx - 2.4 * Math.cos(phi), cy + 0.4, cz + 2.4 * Math.sin(phi)); // portal à direita, céu livre para o título
    }
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.lookAt(look);

    // ---- efeitos de tela
    portalFx.style.opacity = fx.toFixed(3);
    canvas3d.style.transform = fx > 0.01
      ? `scale(${1 + 0.04 * fx}) rotate(${(Math.sin(now * 6) * 1.4 * fx).toFixed(2)}deg) skewX(${(Math.sin(now * 4.3) * 2.5 * fx).toFixed(2)}deg)`
      : '';
    let load = 0;
    if (startAt !== null && t >= T_ENTER) load = t < T_LOAD ? 1 : 1 - clamp01((t - T_LOAD) / (T_DONE - T_LOAD));
    loading.style.opacity = load.toFixed(3);
    if (load > 0) loadingText.textContent = `${L('Construindo terreno', 'Building terrain')}${'.'.repeat(1 + (Math.floor(now * 3) % 3))}`;

    if (startAt !== null) {
      if (chatStep === 0 && t >= 0.15) { chatStep = 1; addChat(L('Lucas entrou no jogo', 'Lucas joined the game'), 'join'); }
      if (chatStep === 1 && t >= T_DONE) {
        chatStep = 2;
        chatEl.querySelectorAll('.join').forEach((p) => p.remove());
        addChat(L('[Servidor] Servidor online!', '[Server] Server online!'), 'server', true);
      }
      const next = STORY[chatStep - 2];
      if (next && t >= T_DONE + next[0]) { chatStep += 1; addChat(L(next[1], next[2]), 'say', true); }
      if (!done && t >= T_DONE - 0.3) { done = true; wrap.classList.add('is-done'); }
    }
  }

  function frame(nowMs) {
    raf = 0;
    const now = nowMs / 1000;
    // limite de quadros: 60 fps na animação, 30 fps quando a cena já está parada (história contada)
    const settled = startAt !== null && now - startAt > T_DONE + 8;
    if (last && now - last < (settled ? 1 / 30 : 1 / 60) - 0.002) {
      if (visible && !reduced) raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(0.05, last ? now - last : 0.016);
    last = now;
    const t = startAt === null ? 0 : now - startAt;
    update(t, now, dt);
    renderer.render(scene, camera);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

  function play() {
    startAt = performance.now() / 1000;
    done = false;
    burst = false;
    chatStep = 0;
    chatEl.textContent = '';
    wrap.classList.remove('is-done');
    if (reduced) startAt -= T_DONE + 1; // sem animação: vai direto para o final
    kick();
  }
  replayBtn.addEventListener('click', play);

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    parTarget = (e.clientX - r.left) / r.width - 0.5;
  });
  stage.addEventListener('pointerleave', () => { parTarget = 0; });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    kick();
  }
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && startAt === null && entry.intersectionRatio >= 0.5) play();
    else if (visible) kick();
  }, { threshold: [0, 0.5] }).observe(stage);
}
