// Tela de carregamento: um "build" no terminal. O nome com o cursor, o comando sendo digitado,
// a etapa atual com spinner e uma barra com porcentagem. A barra só passa de 90% quando as fontes
// e a página terminam. Na saída, a tela "sobe" e revela a página.
// Expõe window.__loader.done (Promise) para o main.js começar as animações da abertura depois dela.
(() => {
  'use strict';
  const root = document.documentElement;
  const el = document.getElementById('loader');
  let resolveDone;
  const done = new Promise((r) => { resolveDone = r; });
  window.__loader = { done };
  if (!el || !root.classList.contains('is-loading')) { resolveDone(); return; }

  // a página sempre começa no topo depois da intro
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // mesmo idioma que o i18n.js vai escolher (ele carrega depois deste arquivo)
  let lang = '';
  try { lang = localStorage.getItem('lang') || ''; } catch { /* sem storage */ }
  if (lang !== 'pt' && lang !== 'en') lang = /^pt/i.test(navigator.language || 'pt') ? 'pt' : 'en';
  const en = lang === 'en';
  const STEPS = en
    ? ['resolving dependencies', 'compiling modules', 'optimizing assets', 'ready']
    : ['resolvendo dependências', 'compilando módulos', 'otimizando assets', 'pronto'];
  const CMD = 'npm run build';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = el.querySelector('.loader-line span');
  const pct = el.querySelector('.loader-pct');
  const typed = el.querySelector('.lc-typed');
  const spin = el.querySelector('.ls-spin');
  const stepText = el.querySelector('.ls-text');
  const step = el.querySelector('.loader-step');
  const SPIN = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
  const MIN = reduced ? 300 : 1700; // tempo mínimo na tela
  const MAX = 4000;                 // rede lenta: termina mesmo assim
  const start = performance.now();

  let ready = false;
  const pageLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
  Promise.all([document.fonts ? document.fonts.ready : null, pageLoaded]).then(() => { ready = true; });

  let progress = 0, finished = false, lastStep = -1;
  function tick(now) {
    if (finished) return;
    const elapsed = now - start;
    // o comando é digitado nos primeiros ~450 ms
    typed.textContent = CMD.slice(0, Math.min(CMD.length, Math.floor(elapsed / 34)));
    const timeP = Math.min(elapsed / MIN, 1);
    const target = ready || elapsed > MAX ? timeP : Math.min(timeP, 0.9);
    progress += (target - progress) * 0.12;
    if (target >= 1 && progress > 0.995) progress = 1;
    render(now);
    if (progress >= 1) finish();
    else requestAnimationFrame(tick);
  }
  function render(now) {
    bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    pct.textContent = `${Math.round(progress * 100)}%`;
    const s = progress >= 1 ? 3 : Math.min(2, Math.floor(progress * 3));
    if (s !== lastStep) {
      lastStep = s;
      stepText.textContent = STEPS[s];
      step.classList.toggle('done', s === 3);
    }
    spin.textContent = s === 3 ? '✓' : SPIN[Math.floor(now / 80) % SPIN.length];
  }

  function finish() {
    if (finished) return;
    finished = true;
    progress = 1;
    typed.textContent = CMD;
    render(performance.now());
    setTimeout(() => {
      el.classList.add('exit');
      setTimeout(() => {
        root.classList.remove('is-loading');
        el.remove();
        // link direto para uma seção (ex.: #projetos): vai até ela; senão, topo
        const target = location.hash && document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
        resolveDone();
      }, reduced ? 200 : 750);
    }, reduced ? 80 : 380);
  }

  // pular: qualquer tecla ou clique
  const skip = () => finish();
  window.addEventListener('keydown', skip, { once: true });
  el.addEventListener('pointerdown', skip, { once: true });

  requestAnimationFrame(tick);
})();
