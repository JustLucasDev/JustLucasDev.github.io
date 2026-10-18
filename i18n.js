// JustLucasDev — idiomas (pt / en)
// O HTML é escrito em português. Este arquivo troca os textos para inglês na hora e guarda o original
// para voltar sem recarregar. Para traduzir um texto novo, adicione a linha "português": "inglês" em TEXT.
(() => {
  'use strict';

  // textos simples (o texto exato de um nó, sem espaços extras)
  const TEXT = {
    'Pular para o conteúdo': 'Skip to content',
    // pastas da nav (cd sobre/ projetos/ ...)
    'sobre': 'about',
    'projetos': 'projects',
    'trajetoria': 'journey',
    'contato': 'contact',
    'sobre.md': 'about.md',
    'projetos.tsx': 'projects.tsx',
    'trajetoria.git': 'journey.git',
    'contato.ts': 'contact.ts',
    'comandos': 'commands',
    'Trabalhando na Computécnica Tecnologia': 'Working at Computécnica Tecnologia',
    '// olá, eu sou o Lucas': "// hi, I'm Lucas",
    'Ver projetos': 'View projects',
    '// role para descobrir': '// scroll to discover',
    'Fale comigo': 'Get in touch',

    // sobre
    '01 — Sobre': '01 — About',
    'Código com cuidado de artesão.': 'Code crafted with care.',
    "Hoje sou Desenvolvedor Power Platform na Computécnica Tecnologia, alocado na St. Paul's School, onde crio soluções e integrações que apoiam as operações acadêmicas e administrativas, do levantamento de requisitos (em português e inglês) à implantação.":
      "Today I'm a Power Platform Developer at Computécnica Tecnologia, assigned to St. Paul's School, where I build solutions and integrations that support academic and administrative operations, from requirements gathering (in Portuguese and English) to deployment.",
    'Antes, passei pela PwC Brasil em Auditoria Digital, onde aprendi a olhar para dados, riscos e controles com rigor. Sou bacharel em Sistemas de Informação pela São Judas e uso IA no dia a dia para construir mais rápido e melhor.':
      "Before that, I worked at PwC Brazil in Digital Assurance, where I learned to look at data, risks and controls with rigor. I hold a bachelor's degree in Information Systems from São Judas and use AI every day to build faster and better.",
    'sobre-mim.ts': 'about-me.ts',
    '// quem está do outro lado do teclado': "// who's on the other side of the keyboard",
    'cargo': 'role',
    'empresa': 'company',
    'local': 'location',
    'formacao': 'education',
    'idiomas': 'languages',
    'trabalhando': 'working',
    '"Desenvolvedor Power Platform"': '"Power Platform Developer"',
    '"Guarulhos, São Paulo, Brasil 🇧🇷"': '"Guarulhos, São Paulo, Brazil 🇧🇷"',
    '"Sistemas de Informação · São Judas"': '"Information Systems · São Judas"',
    '"Português"': '"Portuguese"',
    '"Inglês avançado"': '"Advanced English"',

    // projetos
    '02 — Projetos': '02 — Projects',
    'Trabalhos selecionados.': 'Selected work.',
    'Projetos que construí no trabalho e por conta própria. Os internos são privados, então mostro só o essencial de cada um.':
      "Projects I've built at work and on my own. The internal ones are private, so I only show the essentials of each.",
    'Fixados': 'Pinned',
    '5 repositórios · 3 privados': '5 repositories · 3 private',
    '// você está aqui': '// you are here',
    'Este portfólio: feito do zero com HTML, CSS e JavaScript puro, com fundo generativo, cena em Three.js, terminal navegável e versão em inglês.':
      'This portfolio: built from scratch with plain HTML, CSS and JavaScript, with a generative background, a Three.js scene, a navigable terminal and an English version.',
    'Projeto privado': 'Private project',
    "Intranet da St. Paul's School: mais de 40 páginas para equipe e alunos, com agenda, calendário de provas, mural, organograma, campeonato das casas e RH.":
      "St. Paul's School intranet: 40+ pages for staff and pupils, with agenda, exam calendar, staff bulletin, org chart, house championship and HR.",
    'Atualizado em 2026': 'Updated in 2026',
    'Painel do aluno dentro da intranet: matérias, boletim, pontuação das casas e mensagens pelo Teams, com login Microsoft e dados do SharePoint e do Microsoft Graph.':
      'Pupil dashboard inside the intranet: subjects, report card, house points and Teams messages, with Microsoft sign-in and data from SharePoint and Microsoft Graph.',
    "Portal institucional da Fundação St. Paul's em português e inglês: história, a escola, onboarding, centenário, treinamentos, relatórios anuais e equipe, com um widget de suporte escrito em TypeScript.":
      "The St. Paul's Foundation website in Portuguese and English: story, the school, onboarding, centenary, training, annual reports and people, with a support widget written in TypeScript.",
    'passe o mouse': 'hover me',
    'Textura generativa com vento procedural e ondas de choque no clique. É o fundo deste site.':
      "Generative texture with procedural wind and shockwaves on click. It's the background of this site.",
    '▶ executar': '▶ run',

    // stack
    'Ferramentas do dia a dia.': 'Everyday tools.',
    'As tecnologias que uso no dia a dia, organizadas por área.':
      'The technologies I use every day, organized by area.',
    'ferramentas': 'tools',
    'ferramentas.md': 'tools.md',
    '· Pré-visualização': '· Preview',
    'Power Platform & IA': 'Power Platform & AI',
    'Soluções e automações no ecossistema Microsoft, com IA onde ela faz diferença.': 'Solutions and automations in the Microsoft ecosystem, with AI where it makes a difference.',
    'Apps de negócio low-code': 'Low-code business apps',
    'Fluxos e automações': 'Flows and automations',
    'Listas, sites e documentos': 'Lists, sites and documents',
    'Integrações e Microsoft Graph': 'Integrations and Microsoft Graph',
    'IA generativa': 'Generative AI',
    'Automação e produtividade': 'Automation and productivity',
    'Interfaces responsivas, acessíveis e animadas com propósito.': 'Responsive, accessible interfaces, animated with purpose.',
    'A linguagem da web': 'The language of the web',
    'JavaScript com tipos': 'JavaScript with types',
    'Interfaces em componentes': 'Component-based interfaces',
    'React com rotas e SSR': 'React with routing and SSR',
    'Estilo rápido e consistente': 'Fast, consistent styling',
    'Semântica e layout responsivo': 'Semantics and responsive layout',
    'APIs claras, dados bem modelados e sistemas que aguentam o tranco.': 'Clear APIs, well-modeled data and systems that hold up under pressure.',
    'JavaScript no servidor': 'JavaScript on the server',
    'APIs enxutas em Node': 'Lean APIs in Node',
    'Integrações entre sistemas': 'Integrations between systems',
    'Banco relacional': 'Relational database',
    'Banco de documentos': 'Document database',
    'Scripts, dados e automações': 'Scripts, data and automations',
    'Ferramentas': 'Tools',
    'O que mantém o projeto saudável do primeiro commit à entrega.': 'What keeps a project healthy from the first commit to delivery.',
    'Versionamento de tudo': 'Version control for everything',
    'CI/CD automatizado': 'Automated CI/CD',
    'Mesmo ambiente do dev à produção': 'Same environment from dev to production',
    'Protótipos antes do código': 'Prototypes before code',
    'Scrum & Ágil': 'Scrum & Agile',
    'Sprints, requisitos e UAT': 'Sprints, requirements and UAT',
    'Terminal é casa': 'The terminal is home',
    '✓ 0 problemas': '✓ 0 problems',

    // trajetória
    '04 — Trajetória': '04 — Journey',
    'Do bloco ao código.': 'From blocks to code.',
    'Uma história que começou no Minecraft e virou profissão.': 'A story that started in Minecraft and became a career.',
    'Capítulo 0 · O começo': 'Chapter 0 · The beginning',
    'Tudo começou com um bloco.': 'It all started with a block.',
    'Ver de novo': 'Play again',
    'Animação em estilo Minecraft: o Steve caminha por um mundo de blocos até um portal do Nether e atravessa.':
      'Minecraft-style animation: Steve walks through a world of blocks to a Nether portal and steps through.',
    'Depois do portal ↓': 'After the portal ↓',
    'git log — JustLucasDev/carreira': 'git log — JustLucasDev/career',
    'no momento': 'current',
    'ver detalhes': 'see details',
    'recolher': 'collapse',
    '# clique em um commit para ver os detalhes': '# click a commit to see the details',
    'Desenvolvedor Power Platform': 'Power Platform Developer',
    "Computécnica Tecnologia · alocado na St. Paul's School · mai. 2026 — atual": "Computécnica Tecnologia · assigned to St. Paul's School · May 2026 — present",
    'Planejo, desenvolvo e implemento soluções digitais e integrações que apoiam as operações acadêmicas e administrativas da escola.':
      "I plan, build and deploy digital solutions and integrations that support the school's academic and administrative operations.",
    'Levantamento de requisitos em reuniões em português e inglês, definindo escopo e alinhando soluções.':
      'Requirements gathering in meetings in Portuguese and English, defining scope and aligning solutions.',
    'Integração de aplicações, listas do SharePoint e ferramentas do ecossistema Microsoft.': 'Integration of applications, SharePoint lists and Microsoft ecosystem tools.',
    'Soluções com Inteligência Artificial para automatizar tarefas e acelerar o desenvolvimento.': 'AI-powered solutions to automate tasks and speed up development.',
    'Ciclo completo: requisitos, desenvolvimento, testes, homologação (UAT) e implantação.': 'Full cycle: requirements, development, testing, user acceptance (UAT) and deployment.',
    'Interfaces modernas e responsivas, com foco em usabilidade e desempenho.': 'Modern, responsive interfaces focused on usability and performance.',
    'IA': 'AI',
    'Gestão de projetos': 'Project management',
    'PwC Brasil · temporário · set. 2025 — mar. 2026': 'PwC Brazil · temporary · Sep 2025 — Mar 2026',
    'Auditoria Digital: testes de controle, avaliação de riscos e análise de controles internos em projetos de tecnologia no setor financeiro, assegurando a integridade dos dados.':
      'Digital Assurance: control testing, risk assessment and analysis of internal controls in technology projects in the financial sector, ensuring data integrity.',
    'Auditoria de TI': 'IT audit',
    'Controles internos': 'Internal controls',
    'Gestão de riscos': 'Risk management',
    'Integridade de dados': 'Data integrity',
    'tag: formação': 'tag: education',
    'Bacharelado em Sistemas de Informação': "Bachelor's in Information Systems",
    'Engenharia de software, desenvolvimento web e full stack, bancos de dados, análise de dados, metodologias ágeis, modelagem (UML), segurança da informação e inteligência artificial.':
      'Software engineering, web and full-stack development, databases, data analysis, agile methodologies, modeling (UML), information security and artificial intelligence.',
    'Engenharia de software': 'Software engineering',
    'Bancos de dados': 'Databases',
    'Metodologias ágeis': 'Agile methodologies',
    'Segurança': 'Security',
    'Inglês avançado': 'Advanced English',
    'Wizard by Pearson · certificado · jan. 2020 — dez. 2025': 'Wizard by Pearson · certificate · Jan 2020 — Dec 2025',
    'Escrita, conversação e comunicação profissional em inglês para ambientes corporativos, usadas hoje no dia a dia com stakeholders.':
      'Writing, conversation and professional communication in English for corporate settings, used every day with stakeholders.',
    'Escrita avançada': 'Advanced writing',
    'Comunicação avançada': 'Advanced communication',
    'Minecraft + Java, aos 15 anos': 'Minecraft + Java, at age 15',
    'onde tudo começou': 'where it all began',
    'Para ter meu próprio servidor de Minecraft, fui atrás de aprender Java. Foi o meu primeiro portal para a programação.':
      'To run my own Minecraft server, I set out to learn Java. It was my first portal into programming.',

    // terminal e contato
    'Prefere a linha de comando?': 'Prefer the command line?',
    'visitante@JustLucasDev: ~': 'guest@JustLucasDev: ~',
    'visitante@JustLucasDev:~$': 'guest@JustLucasDev:~$',
    '06 — Contato': '06 — Contact',
    'Copiar': 'Copy',
    'Abrir ↗': 'Open ↗',
    'Enviar email': 'Send email',
    'Voltar ao topo ↑': 'Back to top ↑',
    'navegar': 'navigate',
    'abrir': 'open',
  };

  // atributos (aria-label, title, placeholder, data-words)
  const ATTR = {
    'Carregando o portfólio': 'Loading the portfolio',
    'Início': 'Home',
    'Seções': 'Sections',
    'Sobre': 'About',
    'Projetos': 'Projects',
    'Trajetória': 'Journey',
    'Contato': 'Contact',
    'Abrir menu de comandos': 'Open command menu',
    'lucas.build: interfaces, automações, dashboards, integrações, aplicativos e experiências': 'lucas.build: interfaces, automations, dashboards, integrations, apps and experiences',
    'interfaces|automações|dashboards|integrações|aplicativos|experiências': 'interfaces|automations|dashboards|integrations|apps|experiences',
    'Resumo em código': 'Summary in code',
    'Pesquisar': 'Search',
    'Controle de código': 'Source control',
    'Extensões': 'Extensions',
    'Áreas da stack': 'Stack areas',
    'Áreas abertas': 'Open areas',
    'Ver de novo': 'Play again',
    'Comando do terminal': 'Terminal command',
    'Menu de comandos': 'Command menu',
    'Idioma': 'Language',
    'Role para descobrir': 'Scroll to discover',
    'Para onde vamos? Digite um comando…': 'Where to? Type a command…',
  };

  // blocos com tags no meio do texto: o HTML inteiro é trocado (data-i18n="chave")
  const HTML = {
    'hero-sub': 'I build <strong>web</strong> solutions that make everyday work simpler, from the code to the last detail of the interface.',
    'about-lead': 'I like building things that work <em class="serif">and</em> delight: from the database to the last pixel of the animation.',
    'origin-text': '<p>At <strong>15</strong>, before any job or college, there was <strong>Minecraft</strong>. I wanted my own server, and to get there I set out to learn <strong>Java</strong>.</p><p>Between configs, plugins and countless console errors, I realized I liked reading lines of code and getting the server running more than actually playing. It was my first portal into programming.</p>',
    'term-intro': 'This portfolio also works from the terminal. Type <code>help</code> to get started.',
    'contact-title': 'Find me<br />right <em class="serif shine">here</em>.',
  };

  const META = {
    title: ['JustLucasDev — Portfólio', 'JustLucasDev — Portfolio'],
    description: [
      'Portfólio do Lucas: projetos, stack e a história na programação, que começou com um servidor de Minecraft.',
      "Lucas's portfolio: projects, stack and the story in programming that started with a Minecraft server.",
    ],
  };

  const ATTRS = ['aria-label', 'title', 'placeholder', 'data-words'];
  // elementos que o main.js reescreve por inteiro (efeito de embaralhar): traduzidos pelo texto todo
  const WHOLE = '[data-scramble], .nav-name';
  // áreas geradas por script: cada uma cuida do próprio idioma
  const SKIP = 'script, style, svg, canvas, [data-i18n], #term-out, .palette-list, .mc-hud, .hack, .toast, ' + WHOLE;

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const origText = new WeakMap();
  const origAttr = new WeakMap();

  let lang = 'pt';
  try { lang = localStorage.getItem('lang') || ''; } catch { /* sem storage */ }
  if (lang !== 'pt' && lang !== 'en') lang = /^pt/i.test(navigator.language || 'pt') ? 'pt' : 'en';
  const listeners = [];

  function apply() {
    const en = lang === 'en';
    document.documentElement.lang = en ? 'en' : 'pt-BR';
    document.title = META.title[en ? 1 : 0];
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = META.description[en ? 1 : 0];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      const html = HTML[el.dataset.i18n];
      el.innerHTML = en && html ? html : el.dataset.pt;
    });

    document.querySelectorAll(WHOLE).forEach((el) => {
      if (el.dataset.ptText === undefined) el.dataset.ptText = el.dataset.text || norm(el.textContent);
      const v = en ? TEXT[el.dataset.ptText] || el.dataset.ptText : el.dataset.ptText;
      el.textContent = v;
      el.dataset.text = v;
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const pt = origText.has(n) ? origText.get(n) : n.nodeValue;
      const key = norm(pt);
      if (!key || !TEXT[key]) continue;
      origText.set(n, pt);
      // mantém os espaços das pontas (ex.: " Ver de novo" depois do ícone)
      n.nodeValue = en ? pt.match(/^\s*/)[0] + TEXT[key] + pt.match(/\s*$/)[0] : pt;
    }

    document.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(',')).forEach((el) => {
      let saved = origAttr.get(el);
      ATTRS.forEach((a) => {
        if (!el.hasAttribute(a)) return;
        if (!saved) { saved = {}; origAttr.set(el, saved); }
        if (!(a in saved)) saved[a] = el.getAttribute(a);
        const tr = ATTR[saved[a]];
        if (tr) el.setAttribute(a, en ? tr : saved[a]);
      });
    });

    document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
  }

  window.i18n = {
    get lang() { return lang; },
    t: (pt, en) => (lang === 'en' ? en : pt),
    set(next) {
      if ((next !== 'pt' && next !== 'en') || next === lang) return;
      lang = next;
      try { localStorage.setItem('lang', lang); } catch { /* sem storage */ }
      apply();
      listeners.forEach((fn) => fn(lang));
    },
    on: (fn) => listeners.push(fn),
  };

  apply();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-lang]');
    if (b) window.i18n.set(b.dataset.setLang);
  });
})();
