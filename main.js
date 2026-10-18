// JustLucasDev — interações da página
(() => {
  'use strict';

  // --------------------------------------------------------------- dados (edite aqui)
  const EMAIL = 'justlucasdev@gmail.com';
  const LINKS = {
    github: 'https://github.com/JustLucasDev',
    linkedin: 'https://www.linkedin.com/in/justlucasdev',
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*+=<>/';
  const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // textos gerados por script: L('português', 'inglês') escolhe pelo idioma atual (i18n.js)
  const i18n = window.i18n || { lang: 'pt', t: (pt) => pt, on: () => {}, set: () => {} };
  const L = (pt, en) => i18n.t(pt, en);

  // Aplica email e links do topo do arquivo no HTML
  $$('[data-email]').forEach((el) => { el.textContent = EMAIL; });
  $$('a[data-link="email"]').forEach((a) => { a.href = `mailto:${EMAIL}`; });
  $$('a[data-link="github"]').forEach((a) => { a.href = LINKS.github; });
  $$('a[data-link="linkedin"]').forEach((a) => { a.href = LINKS.linkedin; });
  // textos dos links dentro do contato.ts (sem o https://www.)
  $$('[data-link-text]').forEach((el) => {
    const url = LINKS[el.dataset.linkText];
    if (url) el.textContent = url.replace(/^https?:\/\/(www\.)?/, '');
  });
  $('#year').textContent = new Date().getFullYear();

  // --------------------------------------------------------------- ondas no fundo
  // O letters-effect.js escuta pointerdown na janela; disparamos cliques "virtuais".
  function ripple(x, y) {
    window.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, button: 0 }));
  }
  function waves(count = 3) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        ripple(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.2 + Math.random() * 0.6));
      }, i * 260);
    }
  }
  $$('[data-ripple]').forEach((el) => {
    el.addEventListener('click', () => {
      const r = el.getBoundingClientRect();
      ripple(r.left + r.width / 2, r.top + r.height / 2);
    });
  });
  $$('[data-waves]').forEach((el) => el.addEventListener('click', () => waves(3)));

  // --------------------------------------------------------------- marquee: duplica para loop contínuo
  $$('.marquee-track').forEach((track) => {
    [...track.children].forEach((chip) => track.appendChild(chip.cloneNode(true)));
  });

  // --------------------------------------------------------------- texto embaralhado
  function scramble(el, { duration = 900, delay = 0 } = {}) {
    const final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    if (reduced) { el.textContent = final; return; }
    const chars = [...final];
    const settle = chars.map((_, i) => (i / chars.length) * 0.65 + Math.random() * 0.35);
    const startAt = performance.now() + delay;
    let last = 0;
    const tick = (now) => {
      const t = (now - startAt) / duration;
      if (now - last > 45 || t >= 1) {
        last = now;
        el.textContent = t >= 1 ? final : chars.map((c, i) => (c === ' ' || t >= settle[i] ? c : randGlyph())).join('');
      }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Títulos do hero: entram embaralhados quando as fontes carregam
  const heroLines = $$('[data-scramble="load"]');
  heroLines.forEach((el) => { el.dataset.text = el.textContent; });
  // espera as fontes e a tela de carregamento (loader.js) sair
  const loaderDone = window.__loader ? window.__loader.done : Promise.resolve();
  Promise.all([document.fonts ? document.fonts.ready : null, loaderDone]).then(() => {
    heroLines.forEach((el, i) => scramble(el, { duration: 1100, delay: 150 + i * 180 }));
  });

  // --------------------------------------------------------------- título da abertura em forma de código
  // A string dentro de lucas.build("...") é apagada e redigitada, com um popup de autocompletar estilo VS Code.
  // Fonte variável (Fira Code): cada letra engorda e sobe quando o mouse chega perto; parada, "respira" em onda.
  const codeTitle = $('.code-title');
  if (codeTitle) {
    const wordEl = $('.ct-word', codeTitle);
    const suggest = $('.ct-suggest', codeTitle);
    const WORDS = wordEl.dataset.words.split('|');
    let chars = [];
    const state = new WeakMap();
    const refresh = () => { chars = $$('.k-ch', codeTitle); };

    // quebra o texto fixo (fora da palavra e do comentário) em letras individuais
    const walker = document.createTreeWalker(codeTitle, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('.ct-word, .ct-comment, .ct-suggest') || !n.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'k-ch';
        s.textContent = ch;
        frag.appendChild(s);
      });
      node.replaceWith(frag);
    });
    const setWord = (text) => {
      wordEl.textContent = '';
      [...text].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'k-ch';
        s.textContent = ch;
        wordEl.appendChild(s);
      });
      refresh();
    };
    setWord(WORDS[0]);
    // troca de idioma: o i18n.js atualiza data-words; a próxima palavra digitada já vem no idioma novo
    i18n.on(() => {
      WORDS.splice(0, WORDS.length, ...wordEl.dataset.words.split('|'));
      if (!suggest.classList.contains('show')) setWord(WORDS[0]);
    });

    // popup de autocompletar embaixo da palavra, como no editor enquanto se digita.
    // O subtítulo desce o suficiente para o popup caber no espaço (nunca cobre o texto).
    const strLine = wordEl.closest('.ct-line');
    const heroSub = $('.hero-sub');
    const MAX_ITEMS = 3;
    const visibleList = (prefix, active) => {
      const list = WORDS.filter((w) => w.startsWith(prefix));
      if (list.length <= MAX_ITEMS) return list;
      const i = Math.max(0, list.indexOf(active));
      const from = Math.min(Math.max(0, i - 1), list.length - MAX_ITEMS);
      return list.slice(from, from + MAX_ITEMS);
    };
    const renderList = (list, prefix, active) => {
      suggest.innerHTML = list.map((w) => `<span class="sg${w === active ? ' on' : ''}"><i>abc</i><span><b>${escapeHtml(w.slice(0, prefix.length))}</b>${escapeHtml(w.slice(prefix.length))}</span></span>`).join('');
    };
    const popupTop = () => strLine.offsetTop + strLine.offsetHeight + 4;
    // mede o popup cheio (3 itens) e afasta o subtítulo só o necessário
    const reserveSpace = () => {
      if (!heroSub) return;
      heroSub.style.marginTop = '';
      renderList(WORDS.slice(0, MAX_ITEMS), '', '');
      const popupBottom = codeTitle.offsetTop + popupTop() + suggest.offsetHeight;
      const gap = heroSub.offsetTop - popupBottom - 12;
      if (gap < 0) heroSub.style.marginTop = `${parseFloat(getComputedStyle(heroSub).marginTop) - gap}px`;
    };
    reserveSpace();
    let rsT = 0;
    window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(reserveSpace, 150); });
    i18n.on(() => setTimeout(reserveSpace, 0));
    const showSuggest = (prefix, active) => {
      const list = visibleList(prefix, active);
      renderList(list, prefix, active);
      suggest.style.left = `${wordEl.offsetLeft}px`;
      suggest.style.top = `${popupTop()}px`;
      suggest.classList.toggle('show', list.length > 0);
    };
    const hideSuggest = () => suggest.classList.remove('show');

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    async function typeLoop() {
      let i = 0;
      for (;;) {
        await wait(2600);
        const next = WORDS[(i + 1) % WORDS.length];
        // apaga letra por letra (backspace)
        while (wordEl.lastChild) { wordEl.lastChild.remove(); refresh(); await wait(38); }
        await wait(180);
        showSuggest('', next);
        await wait(420);
        // digita a próxima, filtrando o autocompletar a cada letra
        for (let k = 1; k <= next.length; k++) {
          setWord(next.slice(0, k));
          showSuggest(next.slice(0, k), next);
          await wait(70 + Math.random() * 60);
        }
        await wait(260);
        hideSuggest();
        i = (i + 1) % WORDS.length;
      }
    }

    // peso reagindo ao mouse
    let mx = -1e4, my = -1e4, lastMove = -1e4;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; lastMove = performance.now();
    }, { passive: true });
    let raf = 0, visibleHero = false;
    const loop = (now) => {
      raf = 0;
      const idle = now - lastMove > 2500;
      const t = now / 1000;
      chars.forEach((s, i) => {
        let w = 500, y = 0;
        if (!idle) {
          const r = s.getBoundingClientRect();
          const k = Math.max(0, 1 - Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my) / 260);
          w = 500 + 200 * k * k; y = -12 * k * k;
        } else {
          const wave = (Math.sin(t * 2.2 - i * 0.4) + 1) / 2;
          w = 380 + 280 * wave; y = -3 * wave;
        }
        const st = state.get(s) || { w, y };
        st.w += (w - st.w) * 0.14; st.y += (y - st.y) * 0.18;
        state.set(s, st);
        s.style.fontVariationSettings = `"wght" ${st.w.toFixed(0)}`;
        s.style.transform = `translateY(${st.y.toFixed(1)}px)`;
      });
      if (visibleHero) raf = requestAnimationFrame(loop);
    };
    if (!reduced) {
      new IntersectionObserver(([entry]) => {
        visibleHero = entry.isIntersecting;
        if (visibleHero && !raf) raf = requestAnimationFrame(loop);
      }).observe(codeTitle);
    }

    // entrada depois da tela de carregamento; então começa a digitação
    Promise.all([document.fonts ? document.fonts.ready : null, loaderDone]).then(() => {
      codeTitle.classList.add('k-in');
      reserveSpace();
      if (!reduced) setTimeout(typeLoop, 600);
    });
  }

  // Links da nav embaralham no hover
  $$('.nav-links a').forEach((a) => {
    const name = $('.nav-name', a) || a; // só o nome do arquivo, sem apagar o ícone
    a.addEventListener('mouseenter', () => scramble(name, { duration: 380 }));
  });

  // --------------------------------------------------------------- stack numa janela do VS Code
  // Cada área (Explorer ou aba) mostra seu painel de tecnologias. O conteúdo fica no index.html.
  const ide = $('#ide');
  if (ide) {
    const cats = $$('.stack-panel', ide).map((p) => p.dataset.panel);
    const fileEl = $('#ide-file');
    const countEl = $('#ide-count');
    let current = cats[0];

    function open(cat) {
      if (cat === current) return;
      current = cat;
      $$('[data-cat]', ide).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.cat === cat)));
      $$('.stack-panel', ide).forEach((p) => {
        const on = p.dataset.panel === cat;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
      labels();
      const tab = $(`.ide-tab[data-cat="${cat}"]`, ide);
      if (tab) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    // nome do arquivo e contagem na barra de status, no idioma atual
    function labels() {
      const n = $$(`.stack-panel[data-panel="${current}"] .tech`, ide).length;
      countEl.textContent = `${n} ${L('tecnologias', 'technologies')}`;
      fileEl.textContent = `${current === 'ferramentas' ? L('ferramentas', 'tools') : current}.md`;
    }
    i18n.on(labels);
    labels();

    ide.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (btn) open(btn.dataset.cat);
    });
    ide.addEventListener('keydown', (e) => {
      if (!e.target.matches('[data-cat]') || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      const next = cats[(cats.indexOf(current) + dir + cats.length) % cats.length];
      open(next);
      const same = e.target.classList.contains('ide-tab') ? '.ide-tab' : '.tree-file';
      $(`${same}[data-cat="${next}"]`, ide).focus();
    });
  }

  // --------------------------------------------------------------- git log da trajetória: abre/fecha commits
  $$('.commit-row').forEach((row) => {
    row.addEventListener('click', () => {
      const commit = row.closest('.commit');
      const open = !commit.classList.contains('open');
      commit.classList.toggle('open', open);
      row.setAttribute('aria-expanded', String(open));
    });
  });

  // --------------------------------------------------------------- reveal + títulos
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      $$('h2[data-scramble]', entry.target).forEach((h) => scramble(h, { duration: 1000, delay: 120 }));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  loaderDone.then(() => $$('.reveal').forEach((el) => revealObserver.observe(el)));

  // --------------------------------------------------------------- contadores
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const fmt = (n) => n.toLocaleString('pt-BR');
      counterObserver.unobserve(el);
      if (reduced) { el.textContent = fmt(target); return; }
      const start = performance.now(), dur = 1800;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(2, -10 * t);
        el.textContent = fmt(Math.round(target * (t >= 1 ? 1 : eased)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => counterObserver.observe(el));


  // --------------------------------------------------------------- scroll: progresso, nav, fundo
  const progress = $('.progress');
  const nav = $('#nav');
  const bgLayer = $('.bg-layer');
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle('scrolled', y > 20);
    bgLayer.classList.toggle('dim', y > innerHeight * 0.55);
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Link ativo da nav + caminho do prompt (JustLucasDev:~/projetos$) seguindo a seção na tela
  const navLinks = $$('[data-nav]');
  const navPath = $('#nav-path');
  const PATH_EN = { sobre: 'about', projetos: 'projects', trajetoria: 'journey', contato: 'contact' };
  let navSection = '';
  function setPath(animate) {
    const name = navLinks.some((a) => a.dataset.nav === navSection) ? navSection : '';
    navPath.textContent = name ? `/${L(name, PATH_EN[name] || name)}` : '';
    if (animate && !reduced) { navPath.classList.remove('typing'); void navPath.offsetWidth; navPath.classList.add('typing'); }
  }
  i18n.on(() => setPath(false));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === id));
      if (id !== navSection) { navSection = id; setPath(true); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => sectionObserver.observe(s));

  // --------------------------------------------------------------- cards: luz + inclinação
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      if (reduced || e.pointerType !== 'mouse') return;
      const rx = (y / r.height - 0.5) * -3.5;
      const ry = (x / r.width - 0.5) * 3.5;
      card.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  // --------------------------------------------------------------- botões magnéticos
  if (finePointer && !reduced) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // --------------------------------------------------------------- mini tabela periódica (card Química)
  const chem = $('[data-chem]');
  if (chem) {
    const COLOR = { alk: '#ff7b72', ear: '#ffb454', tr: '#1aadff', non: '#3ecf8e', hal: '#a78bfa', gas: '#7fd1ff' };
    for (let row = 1; row <= 7; row++) {
      for (let col = 1; col <= 18; col++) {
        const i = document.createElement('i');
        const exists = row === 1 ? col === 1 || col === 18 : row <= 3 ? col <= 2 || col >= 13 : true;
        if (!exists) i.className = 'blank';
        else {
          const g = col === 1 ? (row === 1 ? 'non' : 'alk') : col === 2 ? 'ear' : col <= 12 ? 'tr' : col <= 16 ? 'non' : col === 17 ? 'hal' : 'gas';
          i.style.setProperty('--c', COLOR[g]);
          if (row === 3 && col === 1) i.classList.add('hot'); // Na, o elemento em destaque
        }
        chem.appendChild(i);
      }
    }
  }

  // --------------------------------------------------------------- mini campos de letras (capas dos projetos)
  // Desenhados em canvas, bem mais leve que milhares de <span>. O do letter-field anima enquanto
  // está na tela; os das capas privadas ficam parados e só animam com o mouse em cima.
  const MINI_CW = 7.3, MINI_CH = 16;
  $$('[data-minifield]').forEach((mini) => {
    const always = !mini.closest('.is-private');
    const cv = document.createElement('canvas');
    mini.appendChild(cv);
    const ctx = cv.getContext('2d');
    let cols = 0, rows = 0, w = 0, h = 0, glyphs = [], alpha = new Float32Array(0);
    let mx = -999, my = -999, t = 0, timer = 0, onScreen = false, hover = false, settle = 0;

    const draw = (animate) => {
      if (animate) t += 0.08;
      ctx.clearRect(0, 0, w, h);
      const hot = [];
      ctx.fillStyle = '#a6a39b';
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = 14 + i * MINI_CW + MINI_CW / 2, y = 12 + j * MINI_CH + MINI_CH / 2;
          const d = Math.hypot(x - mx, y - my);
          // rajada diagonal que atravessa o card
          const wave = Math.sin(i * 0.16 - j * 0.42 + t * 1.6) + Math.sin(i * 0.05 + j * 0.2 - t * 0.7);
          let target = wave > 1.25 ? 0.7 : wave > 0.8 ? 0.45 : wave > 0.25 ? 0.22 : 0.08;
          if (d < 46) { hot.push(k, x, y); if (Math.random() < 0.5) glyphs[k] = randGlyph(); continue; }
          if (d < 80) target = Math.max(target, 0.45);
          alpha[k] = animate ? alpha[k] + (target - alpha[k]) * 0.35 : target;
          if (animate && Math.random() < (target > 0.08 ? 0.06 : 0.015)) glyphs[k] = randGlyph();
          ctx.globalAlpha = alpha[k];
          ctx.fillText(glyphs[k], x, y);
        }
      }
      // letras "quentes" embaixo do mouse, em azul
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#5cc4ff';
      for (let n = 0; n < hot.length; n += 3) { alpha[hot[n]] = 1; ctx.fillText(glyphs[hot[n]], hot[n + 1], hot[n + 2]); }
    };

    const build = () => {
      w = mini.clientWidth; h = mini.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `12px ${getComputedStyle(mini).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      cols = Math.ceil((w - 28) / MINI_CW) + 1;
      rows = Math.ceil((h - 24) / MINI_CH) + 1;
      glyphs = Array.from({ length: cols * rows }, randGlyph);
      alpha = new Float32Array(cols * rows);
      draw(false);
    };

    const active = () => !reduced && onScreen && (always || hover || settle > 0);
    const loop = () => {
      timer = 0;
      if (!active()) return;
      if (!hover && settle > 0) settle -= 1;
      draw(true);
      timer = setTimeout(loop, 70);
    };
    const kick = () => { if (!timer) loop(); };

    const visual = mini.parentElement;
    visual.addEventListener('pointermove', (e) => {
      const r = mini.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      hover = true;
      kick();
    });
    visual.addEventListener('pointerleave', () => { mx = my = -999; hover = false; settle = 12; });
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) { if (!w) build(); kick(); }
    }).observe(mini);
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  });

  // --------------------------------------------------------------- toast + copiar email
  const toast = $('#toast');
  let toastTimer = 0;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* sem cópia */ }
      ta.remove();
    }
    showToast(L('✓ Email copiado para a área de transferência', '✓ Email copied to clipboard'));
  }
  $$('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', () => {
      copyEmail();
      const r = btn.getBoundingClientRect();
      ripple(r.left + r.width / 2, r.top + r.height / 2);
      btn.classList.add('copied');
      const label = $('.email-label', btn);
      if (label) label.textContent = L('✓ copiado!', '✓ copied!');
      setTimeout(() => { btn.classList.remove('copied'); if (label) label.textContent = L('Copiar', 'Copy'); }, 2000);
    });
  });

  // --------------------------------------------------------------- navegação suave
  function go(hash) {
    const el = hash === '#top' ? document.body : $(hash);
    if (!el) return;
    if (hash === '#top') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
  }

  // --------------------------------------------------------------- terminal
  const termOut = $('#term-out');
  const termBody = $('#term-body');
  const termForm = $('#term-form');
  const termInput = $('#term-input');
  const termHistory = [];
  let hIdx = 0;

  function print(html, cls = '') {
    const div = document.createElement('div');
    div.className = `t-line ${cls}`;
    div.innerHTML = html;
    termOut.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  // arquivos do "ls"/"cat": [nome em pt, nome em en, conteúdo pt, conteúdo en]
  const FILES = [
    ['sobre.txt', 'about.txt',
      'Desenvolvedor full-stack e Power Platform em Guarulhos, São Paulo. Bacharel em Sistemas de Informação (São Judas). Gosto de interfaces que parecem vivas e de código que dá gosto de ler.',
      "Full-stack and Power Platform developer in Guarulhos, São Paulo. Bachelor's in Information Systems (São Judas). I like interfaces that feel alive and code that's a pleasure to read."],
    ['stack.json', 'stack.json',
      '{ "microsoft": ["Power Apps", "Power Automate", "SharePoint", "Microsoft 365"], "web": ["JavaScript", "TypeScript", "React", "Node.js"], "ia": true }',
      '{ "microsoft": ["Power Apps", "Power Automate", "SharePoint", "Microsoft 365"], "web": ["JavaScript", "TypeScript", "React", "Node.js"], "ai": true }'],
    ['contato.md', 'contact.md', `Email: ${EMAIL}\nGitHub: ${LINKS.github}`, `Email: ${EMAIL}\nGitHub: ${LINKS.github}`],
    ['MeuServidor.java', 'MyServer.java',
      'public class MeuServidor extends JavaPlugin {\n    @Override\n    public void onEnable() {\n        getLogger().info("Servidor online!");\n    }\n}',
      'public class MyServer extends JavaPlugin {\n    @Override\n    public void onEnable() {\n        getLogger().info("Server online!");\n    }\n}'],
    ['segredo.txt', 'secret.txt', 'Clique 3 vezes no fundo da página. A terceira onda é especial. 💙', 'Click the page background 3 times. The third wave is special. 💙'],
  ];
  const fileName = (f) => L(f[0], f[1]);
  const prompt = () => L('visitante@JustLucasDev:~$', 'guest@JustLucasDev:~$');

  // en: nome do comando em inglês (os dois nomes funcionam em qualquer idioma)
  const COMMANDS = {
    help: {
      desc: ['lista os comandos', 'list commands'],
      run: () => {
        const rows = Object.entries(COMMANDS)
          .filter(([, c]) => c.desc)
          .map(([name, c]) => `  <span class="t-acc">${L(name, c.en || name).padEnd(12)}</span><span class="t-dim">${L(...c.desc)}</span>`);
        print([L('Comandos disponíveis:', 'Available commands:'), ...rows, '', `<span class="t-dim">${L('Dica: use Tab para completar e ↑ ↓ para o histórico.', 'Tip: use Tab to autocomplete and ↑ ↓ for history.')}</span>`].join('\n'));
      },
    },
    sobre: {
      en: 'about',
      desc: ['quem sou eu', 'who I am'],
      run: () => print(L(
        'Olá! Eu sou o <span class="t-acc">Lucas</span>, desenvolvedor full-stack e Power Platform em Guarulhos, São Paulo.\nHoje crio soluções e integrações para a St. Paul\'s School pela Computécnica Tecnologia.\nDigite <span class="t-acc">experiencia</span> para ver minha trajetória.',
        'Hi! I\'m <span class="t-acc">Lucas</span>, a full-stack and Power Platform developer in Guarulhos, São Paulo.\nToday I build solutions and integrations for St. Paul\'s School through Computécnica Tecnologia.\nType <span class="t-acc">experience</span> to see my journey.',
      )),
    },
    experiencia: {
      en: 'experience',
      desc: ['minha trajetória', 'my journey'],
      run: () => print([
        `<span class="t-ok">●</span> <span class="t-acc">${L('mai. 2026 — atual', 'May 2026 — present').padEnd(23)}</span>${L('Desenvolvedor Power Platform', 'Power Platform Developer')}`,
        `${' '.repeat(25)}<span class="t-dim">${L("Computécnica Tecnologia · alocado na St. Paul's School", "Computécnica Tecnologia · assigned to St. Paul's School")}</span>`,
        `<span class="t-dim">○</span> <span class="t-acc">${L('set. 2025 — mar. 2026', 'Sep 2025 — Mar 2026').padEnd(23)}</span>Digital Assurance &amp; Transparency (DAT)`,
        `${' '.repeat(25)}<span class="t-dim">${L('PwC Brasil · Auditoria Digital', 'PwC Brazil · Digital Assurance')}</span>`,
        '',
        L('<span class="t-dim">formação</span>  Bacharelado em Sistemas de Informação · São Judas', '<span class="t-dim">education</span> Bachelor\'s in Information Systems · São Judas'),
        L('<span class="t-dim">idiomas </span>  Português · Inglês avançado (Wizard by Pearson)', '<span class="t-dim">languages</span> Portuguese · Advanced English (Wizard by Pearson)'),
        L('<span class="t-dim">início  </span>  Minecraft → Java, para criar meu próprio servidor', '<span class="t-dim">start    </span> Minecraft → Java, to run my own server'),
      ].join('\n')),
    },
    herobrine: { run: () => print('Removed Herobrine. 👀', 't-dim') },
    minecraft: {
      desc: ['onde tudo começou', 'where it all began'],
      run: () => {
        print(L(
          '<span class="t-ok">[Servidor]</span> Lucas entrou no jogo.\nTudo começou aqui: aprendi Java para criar meu próprio servidor. Abrindo o portal…',
          '<span class="t-ok">[Server]</span> Lucas joined the game.\nIt all started here: I learned Java to run my own server. Opening the portal…',
        ));
        setTimeout(() => {
          go('#origin');
          setTimeout(() => { const b = $('#origin [data-replay]'); if (b) b.click(); }, reduced ? 0 : 700);
        }, 400);
      },
    },
    projetos: {
      en: 'projects',
      desc: ['lista meus projetos', 'list my projects'],
      run: () => {
        print([
          `<span class="t-acc">01</span>  ${L('Intranet escolar  ', 'School intranet   ')}   <span class="t-dim">SharePoint · JavaScript · Microsoft Graph</span>`,
          '<span class="t-acc">02</span>  Student Dashboard    <span class="t-dim">SharePoint · JavaScript</span>',
          `<span class="t-acc">03</span>  ${L('Portal de Química ', 'Chemistry portal  ')}   <span class="t-dim">SharePoint · JavaScript</span>`,
          `<span class="t-acc">04</span>  ${L('Sistema financeiro', 'Finance system    ')}   <span class="t-dim">Power Apps · Power Automate</span>`,
          `<span class="t-acc">05</span>  ${L('Portal da Fundação', 'Foundation portal ')}   <span class="t-dim">SharePoint · HTML & CSS</span>`,
          `<span class="t-acc">06</span>  Letter Field         <span class="t-dim">Canvas 2D · ${L('ruído Perlin', 'Perlin noise')}</span>`,
          '',
          `<span class="t-dim">${L('🔒 Projetos internos: sem links públicos.', '🔒 Internal projects: no public links.')}</span>`,
          '',
          L('<span class="t-dim">Digite</span> <span class="t-acc">ir projetos</span> <span class="t-dim">para vê-los na página.</span>', '<span class="t-dim">Type</span> <span class="t-acc">go projects</span> <span class="t-dim">to see them on the page.</span>'),
        ].join('\n'));
      },
    },
    stack: {
      desc: ['tecnologias que uso', 'technologies I use'],
      run: () => print([
        '<span class="t-ok">microsoft</span>  Power Apps, Power Automate, SharePoint, Microsoft 365',
        '<span class="t-ok">front    </span>  JavaScript, TypeScript, React, Next.js, Tailwind',
        '<span class="t-ok">back     </span>  Node.js, Express, PostgreSQL, MongoDB',
        `<span class="t-ok">tools    </span>  Git, Docker, GitHub Actions, Figma, ${L('IA', 'AI')}`,
      ].join('\n')),
    },
    contato: {
      en: 'contact',
      desc: ['como falar comigo', 'how to reach me'],
      run: () => print(`Email   <a href="mailto:${EMAIL}">${EMAIL}</a>\nGitHub  <a href="${LINKS.github}" target="_blank" rel="noopener">${LINKS.github.replace('https://', '')}</a>\nLinkedIn <a href="${LINKS.linkedin}" target="_blank" rel="noopener">${LINKS.linkedin.replace('https://www.', '')}</a>`),
    },
    email: {
      desc: ['copia meu email', 'copy my email'],
      run: () => { copyEmail(); print(`<span class="t-ok">✓</span> ${EMAIL} ${L('copiado.', 'copied.')}`); },
    },
    onda: {
      en: 'wave',
      desc: ['dispara ondas no fundo', 'send waves across the background'],
      run: () => { waves(3); print(`<span class="t-acc">≋≋≋</span> ${L('Ondas disparadas. Olhe o fundo da página.', 'Waves sent. Look at the page background.')}`); },
    },
    ir: {
      en: 'go',
      desc: ['vai para uma seção (ex: ir contato)', 'jump to a section (e.g. go contact)'],
      run: (args) => {
        const map = {
          inicio: '#top', início: '#top', topo: '#top', sobre: '#sobre', projetos: '#projetos', stack: '#stack', trajetoria: '#trajetoria', trajetória: '#trajetoria', experiencia: '#trajetoria', terminal: '#terminal', contato: '#contato',
          home: '#top', top: '#top', about: '#sobre', projects: '#projetos', journey: '#trajetoria', experience: '#trajetoria', contact: '#contato',
        };
        const dest = map[(args[0] || '').toLowerCase()];
        const names = L('inicio|sobre|projetos|stack|trajetoria|terminal|contato', 'home|about|projects|stack|journey|terminal|contact');
        if (!dest) { print(`${L('uso: ir', 'usage: go')} &lt;${names}&gt;`, 't-warn'); return; }
        print(`→ ${L('indo para', 'going to')} ${escapeHtml(args[0])}…`, 't-dim');
        setTimeout(() => go(dest), 250);
      },
    },
    lang: {
      desc: ['muda o idioma (lang en | lang pt)', 'change language (lang pt | lang en)'],
      run: (args) => {
        const next = (args[0] || '').toLowerCase();
        if (next !== 'pt' && next !== 'en') { print(L('uso: lang &lt;pt|en&gt;  · atual: pt', 'usage: lang &lt;pt|en&gt;  · current: en'), 't-warn'); return; }
        if (next === i18n.lang) { print(L('O site já está em português.', 'The site is already in English.'), 't-dim'); return; }
        i18n.set(next);
      },
    },
    ls: {
      desc: ['lista arquivos', 'list files'],
      run: () => print(FILES.map((f) => `<span class="t-acc">${fileName(f)}</span>`).join('   ')),
    },
    cat: {
      desc: ['mostra um arquivo (ex: cat sobre.txt)', 'show a file (e.g. cat about.txt)'],
      run: (args) => {
        const f = FILES.find((x) => x[0] === args[0] || x[1] === args[0]);
        if (!args[0]) print(L('uso: cat &lt;arquivo&gt;', 'usage: cat &lt;file&gt;'), 't-warn');
        else if (!f) print(`cat: ${escapeHtml(args[0])}: ${L('arquivo não encontrado', 'no such file')}`, 't-err');
        else print(escapeHtml(L(f[2], f[3])));
      },
    },
    data: { en: 'date', desc: ['data e hora', 'date and time'], run: () => print(new Date().toLocaleString(L('pt-BR', 'en-US'), { dateStyle: 'full', timeStyle: 'medium' })) },
    echo: { desc: ['repete o texto', 'print the text'], run: (args) => print(escapeHtml(args.join(' '))) },
    whoami: { run: () => print(L('visitante. Seja bem-vindo! 😉', 'guest. Welcome! 😉')) },
    history: { desc: ['comandos anteriores', 'previous commands'], run: () => print(termHistory.map((c, i) => `${String(i + 1).padStart(3)}  ${escapeHtml(c)}`).join('\n') || L('(vazio)', '(empty)')) },
    clear: { desc: ['limpa a tela', 'clear the screen'], run: () => { termOut.textContent = ''; } },
    sudo: { run: () => print(L('visitante não está no arquivo sudoers. Este incidente será reportado. 👀', 'guest is not in the sudoers file. This incident will be reported. 👀'), 't-err') },
    rm: { run: (args) => print(args.includes('-rf') ? L('Boa tentativa. Este portfólio é à prova de rm -rf. 😎', 'Nice try. This portfolio is rm -rf proof. 😎') : L('rm: operação não permitida', 'rm: operation not permitted'), 't-err') },
    exit: { run: () => { print(L('Não dá pra sair de um site com exit 😄 Voltando ao topo…', "You can't exit a website 😄 Back to the top…"), 't-dim'); setTimeout(() => go('#top'), 600); } },
    vim: { run: () => print(L('Você entrou no vim. Boa sorte para sair. (brincadeira: digite qualquer coisa)', 'You entered vim. Good luck getting out. (kidding: type anything)'), 't-warn') },
  };
  // nomes em inglês apontam para o mesmo comando
  const ALIAS = {};
  Object.entries(COMMANDS).forEach(([name, c]) => { if (c.en) ALIAS[c.en] = name; });

  function runCommand(raw) {
    const line = raw.trim();
    print(`<span class="t-prompt">${prompt()}</span> ${escapeHtml(line)}`);
    if (!line) return;
    termHistory.push(line);
    hIdx = termHistory.length;
    const [name, ...args] = line.split(/\s+/);
    const key = name.toLowerCase();
    const cmd = COMMANDS[key] || COMMANDS[ALIAS[key]];
    if (cmd) cmd.run(args);
    else print(`${L('comando não encontrado', 'command not found')}: ${escapeHtml(name)}. ${L('Digite', 'Type')} <span class="t-acc">help</span>.`, 't-err');
  }

  const banner = '  JustLucasDev · terminal v1.0  ';
  function welcome() {
    print([
      `<span class="t-ascii">┌${'─'.repeat(banner.length)}┐\n│${banner}│\n└${'─'.repeat(banner.length)}┘</span>`,
      '',
      L('Bem-vindo! Você está navegando pelo portfólio do <span class="t-acc">Lucas</span>.', 'Welcome! You\'re browsing <span class="t-acc">Lucas</span>\'s portfolio.'),
      L('Digite <span class="t-acc">help</span> para ver os comandos.', 'Type <span class="t-acc">help</span> to see the commands.'),
      '',
    ].join('\n'));
  }
  welcome();
  // trocou o idioma: o terminal recomeça no idioma novo
  i18n.on(() => {
    termOut.textContent = '';
    welcome();
    print(`<span class="t-ok">✓</span> ${L('Idioma: português. Use', 'Language: English. Use')} <span class="t-acc">lang ${L('en', 'pt')}</span> ${L('para voltar ao inglês.', 'to switch back to Portuguese.')}`);
  });

  termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(termInput.value);
    termInput.value = '';
  });
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdx > 0) termInput.value = termHistory[--hIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIdx = Math.min(termHistory.length, hIdx + 1);
      termInput.value = termHistory[hIdx] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = termInput.value.trim().toLowerCase();
      const hits = [...Object.keys(COMMANDS), ...Object.keys(ALIAS)].filter((c) => c.startsWith(v));
      if (hits.length === 1) termInput.value = hits[0] + ' ';
      else if (hits.length > 1 && v) print(hits.join('   '), 't-dim');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      termOut.textContent = '';
    }
  });
  termBody.addEventListener('click', () => {
    if (!window.getSelection().toString()) termInput.focus({ preventScroll: true });
  });

  // --------------------------------------------------------------- command palette
  const palette = $('#palette');
  const pInput = $('#palette-input');
  const pList = $('#palette-list');
  let lastFocus = null;
  let pActive = 0;
  let pItems = [];

  // textos em pares [pt, en]; o idioma é escolhido na hora de desenhar a lista
  const NAV = ['Navegar', 'Navigate'], ACT = ['Ações', 'Actions'];
  const ACTIONS = [
    { group: NAV, icon: '⌂', label: ['Início', 'Home'], hint: ['topo', 'top'], run: () => go('#top') },
    { group: NAV, icon: '01', label: ['Sobre mim', 'About me'], run: () => go('#sobre') },
    { group: NAV, icon: '02', label: ['Projetos', 'Projects'], run: () => go('#projetos') },
    { group: NAV, icon: '03', label: ['Stack', 'Stack'], run: () => go('#stack') },
    { group: NAV, icon: '04', label: ['Trajetória', 'Journey'], run: () => go('#trajetoria') },
    { group: NAV, icon: '05', label: ['Terminal', 'Terminal'], run: () => go('#terminal') },
    { group: NAV, icon: '06', label: ['Contato', 'Contact'], run: () => go('#contato') },
    { group: ACT, icon: 'Aa', label: ['Switch to English', 'Mudar para português'], hint: ['lang en', 'lang pt'], run: () => i18n.set(L('en', 'pt')) },
    { group: ACT, icon: '@', label: ['Copiar email', 'Copy email'], hint: [EMAIL, EMAIL], run: copyEmail },
    { group: ACT, icon: '≋', label: ['Disparar ondas no fundo', 'Send waves across the background'], hint: ['efeito', 'effect'], run: () => waves(3) },
    {
      group: ACT, icon: '>_', label: ['Abrir o terminal', 'Open the terminal'], hint: ['digite help', 'type help'], run: () => {
        go('#terminal');
        setTimeout(() => termInput.focus({ preventScroll: true }), reduced ? 0 : 700);
      },
    },
    { group: ['Links', 'Links'], icon: '↗', label: ['GitHub', 'GitHub'], hint: [LINKS.github.replace('https://', ''), LINKS.github.replace('https://', '')], run: () => window.open(LINKS.github, '_blank', 'noopener') },
    { group: ['Links', 'Links'], icon: '↗', label: ['LinkedIn', 'LinkedIn'], hint: ['linkedin', 'linkedin'], run: () => window.open(LINKS.linkedin, '_blank', 'noopener') },
  ];

  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function renderPalette() {
    const q = normalize(pInput.value.trim());
    // busca nos dois idiomas: "projects" e "projetos" encontram o mesmo item
    pItems = ACTIONS.filter((a) => !q || normalize(`${a.label.join(' ')} ${a.group.join(' ')} ${(a.hint || []).join(' ')}`).includes(q));
    pActive = Math.min(pActive, Math.max(0, pItems.length - 1));
    pList.textContent = '';
    if (!pItems.length) {
      pList.innerHTML = `<li class="palette-empty">${L('Nada encontrado. Tente “projetos” ou “email”.', 'Nothing found. Try “projects” or “email”.')}</li>`;
      return;
    }
    let group = '';
    pItems.forEach((a, i) => {
      if (L(...a.group) !== group) {
        group = L(...a.group);
        const g = document.createElement('li');
        g.className = 'palette-group';
        g.setAttribute('role', 'presentation');
        g.textContent = group;
        pList.appendChild(g);
      }
      const li = document.createElement('li');
      li.className = `palette-item${i === pActive ? ' active' : ''}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === pActive));
      li.id = `p-opt-${i}`;
      li.innerHTML = `<span class="p-icon">${escapeHtml(a.icon)}</span><span>${escapeHtml(L(...a.label))}</span>${a.hint ? `<span class="p-hint">${escapeHtml(L(...a.hint))}</span>` : ''}`;
      li.addEventListener('mousemove', () => { if (pActive !== i) { pActive = i; highlight(); } });
      li.addEventListener('click', () => execute(i));
      pList.appendChild(li);
    });
    pInput.setAttribute('aria-activedescendant', `p-opt-${pActive}`);
  }
  function highlight() {
    $$('.palette-item', pList).forEach((li, i) => {
      li.classList.toggle('active', i === pActive);
      li.setAttribute('aria-selected', String(i === pActive));
    });
    pInput.setAttribute('aria-activedescendant', `p-opt-${pActive}`);
    const el = $(`#p-opt-${pActive}`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function execute(i) {
    const action = pItems[i];
    if (!action) return;
    closePalette(false);
    action.run();
  }
  function openPalette() {
    if (!palette.hidden) return;
    lastFocus = document.activeElement;
    palette.hidden = false;
    pInput.value = '';
    pActive = 0;
    renderPalette();
    pInput.focus();
  }
  function closePalette(restore = true) {
    if (palette.hidden) return;
    palette.hidden = true;
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  pInput.addEventListener('input', () => { pActive = 0; renderPalette(); });
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); pActive = (pActive + 1) % Math.max(1, pItems.length); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pActive = (pActive - 1 + pItems.length) % Math.max(1, pItems.length); highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(pActive); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', openPalette));
  $$('[data-palette-close]').forEach((b) => b.addEventListener('click', () => closePalette()));

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('.cmd-kbd').forEach((k) => { k.textContent = isMac ? '⌘ K' : 'Ctrl K'; });

  document.addEventListener('keydown', (e) => {
    const typing = e.target instanceof HTMLElement && (e.target.matches('input, textarea') || e.target.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape' && !palette.hidden) {
      closePalette();
    } else if (e.key === '/' && !typing && palette.hidden) {
      e.preventDefault();
      openPalette();
    }
  });

  // --------------------------------------------------------------- "hackeado" ao abrir o inspecionar
  // Não existe API para saber se o DevTools abriu; usamos os atalhos e a área visível encolhendo de repente.
  let hacking = false, lastHack = 0;
  function hackMode() {
    const now = Date.now();
    if (hacking || now - lastHack < 20000) return;
    hacking = true;
    lastHack = now;

    const el = document.createElement('div');
    el.className = 'hack';
    el.setAttribute('aria-hidden', 'true');
    // faixas de "rasgo" na imagem (deslocam e clareiam, sem cor)
    const bars = Array.from({ length: 5 }, () => {
      const b = document.createElement('div');
      b.className = 'hack-bar';
      el.appendChild(b);
      return b;
    });
    // janela de terminal de verdade (estilo GNOME Terminal com Kali): barra de título, prompt colorido, cursor
    const ASCII = [
      '  ███╗   ███╗ █████╗ ██╗     ██╗    ██╗ █████╗ ██████╗ ███████╗',
      '  ████╗ ████║██╔══██╗██║     ██║    ██║██╔══██╗██╔══██╗██╔════╝',
      '  ██╔████╔██║███████║██║     ██║ █╗ ██║███████║██████╔╝█████╗  ',
      '  ██║╚██╔╝██║██╔══██║██║     ██║███╗██║██╔══██║██╔══██╗██╔══╝  ',
      '  ██║ ╚═╝ ██║██║  ██║███████╗╚███╔███╔╝██║  ██║██║  ██║███████╗',
      '  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝',
    ].join('\n');
    const win = document.createElement('div');
    win.className = 'hw';
    win.innerHTML = `
      <div class="hw-bar">
        <span class="hw-tab">⌁</span>
        <span class="hw-title">root@JustLucasDev: ~</span>
        <span class="hw-ctl"><i>─</i><i>□</i><i class="x">✕</i></span>
      </div>
      <div class="hw-body">
        <pre class="hw-ascii">${ASCII}</pre>
        <p class="hw-sub">v6.6.6 · remote access toolkit · ${L('não feche esta janela', 'do not close this window')}</p>
        <div class="hw-log"></div>
        <p class="hw-alert"></p>
        <button type="button" class="hw-confirm">${L('PRESSIONE <b>Esc</b> OU CLIQUE AQUI PARA CANCELAR', 'PRESS <b>Esc</b> OR CLICK HERE TO ABORT')}</button>
      </div>`;
    el.append(win);
    document.body.appendChild(el);
    document.body.classList.add('hacked');

    // glitch em rajadas: a tela fica parada e de repente "rasga" por um instante
    const glitch = setInterval(() => {
      const burst = Math.random() < 0.35;
      win.classList.toggle('glitch', burst);
      el.classList.toggle('glitch', burst);
      bars.forEach((b) => {
        const on = burst && Math.random() < 0.7;
        b.style.display = on ? 'block' : 'none';
        if (!on) return;
        b.style.top = `${Math.random() * 100}%`;
        b.style.height = `${1 + Math.random() * 28}px`;
        b.style.transform = `translateX(${(Math.random() - 0.5) * 80}px)`;
      });
    }, 110);

    // títulos embaralhados
    $$('[data-scramble]').forEach((h) => scramble(h, { duration: 3200 }));
    waves(3);

    // texto digitado aos poucos: log do terminal, alerta em vermelho e legenda embaixo
    const typeInto = (target, text, speed) => new Promise((done) => {
      let i = 0;
      const step = () => {
        i += 1;
        target.textContent = text.slice(0, i);
        const box = target.parentElement;
        if (box && box.classList.contains('hw-log')) box.scrollTop = box.scrollHeight; // log sempre mostra a última linha
        if (i < text.length && !closed) setTimeout(step, speed); else done();
      };
      step();
    });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // tudo é encenação: nenhum arquivo do visitante é lido ou alterado
    const FAKE_FILES = L([
      '/home/visitante/Documentos/senhas.txt',
      '/home/visitante/.ssh/id_rsa',
      '/home/visitante/Fotos/ferias_2019/',
      '/home/visitante/Desktop/projeto_final_FINAL_v3.docx',
      '/home/visitante/.mozilla/cookies.sqlite',
      '/home/visitante/Downloads/minecraft_server.jar',
      '/home/visitante/historico_navegador.db',
    ], [
      '/home/guest/Documents/passwords.txt',
      '/home/guest/.ssh/id_rsa',
      '/home/guest/Pictures/vacation_2019/',
      '/home/guest/Desktop/final_project_FINAL_v3.docx',
      '/home/guest/.mozilla/cookies.sqlite',
      '/home/guest/Downloads/minecraft_server.jar',
      '/home/guest/browser_history.db',
    ]);
    const bar = (p) => '█'.repeat(Math.round(p / 5)) + '░'.repeat(20 - Math.round(p / 5));
    let closed = false;
    const onKey = (e) => { if (e.key === 'Escape') finish(); };
    function finish() {
      if (closed) return;
      closed = true;
      clearInterval(glitch);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('hacked');
      el.classList.add('out');
      setTimeout(() => { el.remove(); hacking = false; }, 450);
    }
    document.addEventListener('keydown', onKey);
    // com o DevTools aberto o foco fica nele e o Esc não chega na página: dá para fechar clicando
    $('.hw-confirm', win).addEventListener('click', finish);
    $('.hw-ctl .x', win).addEventListener('click', finish);
    el.addEventListener('click', (e) => { if (!win.contains(e.target)) finish(); });

    (async () => {
      const log = $('.hw-log', win);
      const alertEl = $('.hw-alert', win);
      const line = (cls) => {
        const p = document.createElement('p');
        if (cls) p.className = cls;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
        return p;
      };
      await wait(500);
      const cmd = line('cmd');
      cmd.innerHTML = '<span class="pr-u">root@JustLucasDev</span>:<span class="pr-p">~</span># <span class="pr-c"></span><span class="hw-cursor"></span>';
      await typeInto($('.pr-c', cmd), L('sudo ./instalar_malware.sh --silencioso', 'sudo ./install_malware.sh --silent'), 45);
      $('.hw-cursor', cmd).remove();
      await wait(350);
      await typeInto(line(), L('[*] Conectando ao servidor remoto... OK', '[*] Connecting to remote server... OK'), 14);
      await wait(250);

      // download com barra de progresso
      const dl = line();
      for (let p = 0; p < 100 && !closed; p = Math.min(100, p + 2 + Math.random() * 7)) {
        dl.textContent = `[*] ${L('Baixando payload', 'Downloading payload')}   [${bar(p)}] ${Math.floor(p)}%`;
        await wait(70);
      }
      dl.textContent = `[*] ${L('Baixando payload', 'Downloading payload')}   [${bar(100)}] 100%`;
      await wait(300);

      // "copiando" arquivos (falsos)
      await typeInto(line(), L('[*] Copiando arquivos do sistema...', '[*] Copying system files...'), 14);
      for (const f of FAKE_FILES) {
        if (closed) return;
        line('dim').textContent = `    ${f}  ✓`;
        log.scrollTop = log.scrollHeight;
        await wait(170);
      }
      await typeInto(line(), L('[*] Desativando antivírus... OK', '[*] Disabling antivirus... OK'), 18);
      await wait(300);
      await typeInto(line('red'), L('[!] Malware instalado. Acesso remoto ativado.', '[!] Malware installed. Remote access enabled.'), 20);
      if (closed) return;

      // modo perigo: tela pulsando em vermelho e contagem regressiva
      win.classList.add('ready', 'danger');
      el.classList.add('danger');
      await typeInto(alertEl, L('malware instalado', 'malware installed'), 45);
      await wait(700);
      for (let s = 5; s >= 1 && !closed; s--) {
        alertEl.textContent = L(`formatando o sistema em ${s}...`, `formatting system in ${s}...`);
        await wait(800);
      }
      if (closed) return;

      // a revelação
      win.classList.remove('danger');
      el.classList.remove('danger');
      win.classList.add('unmasked') /* não usar 'reveal': é a classe do efeito de entrada da página */;
      // a revelação fica fora do log (que já está cheio e cortado), em destaque embaixo
      alertEl.textContent = '';
      alertEl.classList.add('joke');
      await typeInto(alertEl,L('> brincadeira, nada foi instalado. Curtiu o código? Vamos conversar.', '> just kidding, nothing was installed. Like the code? Let\'s talk.'), 28);
      await wait(6000); // tempo para ler a brincadeira
      finish();
    })();
  }

  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === 'F12' || (mod && (e.shiftKey || e.altKey) && ['i', 'j', 'c'].includes(k)) || (mod && k === 'u')) hackMode();
  });
  if (finePointer) {
    // DevTools acoplado: a área interna encolhe bastante sem a janela mudar de tamanho
    const docked = () => window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 260;
    let wasDocked = docked();
    window.addEventListener('resize', () => {
      const d = docked();
      if (d && !wasDocked) hackMode();
      wasDocked = d;
    });
  }
  window.__hack = hackMode; // para testar no console: __hack()

  // --------------------------------------------------------------- console
  console.log(
    '%c JustLucasDev %c Curioso com o código? Eu também. Vamos conversar: ' + EMAIL,
    'background:#1aadff;color:#0b0b0b;font-weight:700;padding:4px 8px;border-radius:4px',
    'color:#a19c95;padding:4px'
  );
})();
