/* ═══════════════════════════════════════════
   CARDÁPIO — CARDS DE SABORES, MODAL DE IMAGEM,
   ABAS, BANNER SAZONAL E DEPOIMENTOS DINÂMICOS
   Depende de: cardapio-dados.js
═══════════════════════════════════════════ */

/* ── FAVORITOS (localStorage, só no navegador do cliente) ── */
function getFavoritos() {
  try { return JSON.parse(localStorage.getItem('df_favoritos') || '[]'); }
  catch(e) { return []; }
}
function toggleFavorito(nome, btnEl) {
  let favoritos = getFavoritos();
  const idx = favoritos.indexOf(nome);
  if (idx >= 0) {
    favoritos.splice(idx, 1);
    btnEl.classList.remove('favorito-ativo');
    btnEl.textContent = '♡';
  } else {
    favoritos.push(nome);
    btnEl.classList.add('favorito-ativo');
    btnEl.textContent = '❤';
    dispararBurstCoracao(btnEl);
  }
  localStorage.setItem('df_favoritos', JSON.stringify(favoritos));
}

function dispararBurstCoracao(btnEl) {
  const burst = document.createElement('div');
  burst.className = 'burst';
  const angulos = [-60,-20,20,60,90,-90];
  burst.innerHTML = angulos.map(a => {
    const rad = a * Math.PI / 180;
    const tx = Math.cos(rad) * 26, ty = Math.sin(rad) * 26 - 10;
    return `<span style="--tx:${tx}px;--ty:${ty}px;">❤</span>`;
  }).join('');
  btnEl.appendChild(burst);
  setTimeout(() => burst.remove(), 650);
}

/* ── BUILD CARDS ── */
function buildCards(list, containerId, type) {
  const container = document.getElementById(containerId);
  list.forEach((item, i) => {
    const fotos = Array.isArray(item.fotos) ? item.fotos : [item.foto];
    const card  = document.createElement('div');
    card.className = 'card';

    const favoritos = getFavoritos();
    const ehFavorito = favoritos.includes(item.nome);

    card.innerHTML = `
      <div class="card-img-wrap">
        <button class="btn-favorito ${ehFavorito ? 'favorito-ativo' : ''}" onclick="event.stopPropagation(); toggleFavorito('${item.nome.replace(/'/g,"\\'")}', this)">${ehFavorito ? '❤' : '♡'}</button>
        ${fotos[0] ? `<img src="${fotos[0]}" alt="Brigadeiro sabor ${item.nome} — Doces Flor"
          width="300" height="300" loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
        ${fotos.length > 1 ? `<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.55);color:white;font-size:0.7rem;padding:3px 8px;border-radius:50px;pointer-events:none;">📷 ${fotos.length}</div>` : ''}
          <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;background:linear-gradient(135deg,var(--cream-dark),var(--cream));padding:1rem;">
            <span style="font-size:2.5rem;">🍫</span>
            <span style="font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;color:var(--brown-warm);text-align:center;line-height:1.3;">${item.nome}</span>
            <span style="font-size:0.7rem;color:#bbb;letter-spacing:0.05em;">foto em breve</span>
          </div>
        </div>
      </div>
      <div class="card-body">
<span class="badge badge-${type}">${type === 'trad' ? 'Tradicional' : type === 'frutas' ? 'Frutas' : 'Gourmet'}</span>
        <h3>${item.nome}</h3>
        <p class="card-preco-hint">a partir de R$ ${(PRECOS[type === 'trad' ? 'trad' : type === 'frutas' ? 'frutas' : 'gourmet'][100] / 100).toFixed(2).replace('.', ',')}/un</p>
      </div>
    `;

    const btnAdd = document.createElement('button');
    btnAdd.className = 'btn-adicionar';
    btnAdd.textContent = '+ Adicionar ao pedido';
    btnAdd.addEventListener('click', () => {
      gtag('event', 'add_to_cart', { item_name: item.nome, category: type });
      abrirQtdModal(item.nome, type, card.querySelector('.card-img-wrap img'));
    });
    card.querySelector('.card-body').appendChild(btnAdd);

    const imgEl = card.querySelector('.card-img-wrap img');
    if (imgEl) imgEl.addEventListener('click', () => openModal(fotos[0], fotos));

    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      // limpa o transform inline depois da entrada, senão ele "trava"
      // o transform do :hover (estilo inline sempre vence o CSS)
      setTimeout(() => {
        card.style.transition = '';
        card.style.transform = '';
      }, 420);
    }, i * 60);

    ativarTiltCard(card);
    container.appendChild(card);
  });
}

function ativarTiltCard(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    const tiltX = ((rect.height / 2 - y) / (rect.height / 2)) * 8;
    card.style.setProperty('--tiltX', tiltX + 'deg');
    card.style.setProperty('--tiltY', tiltY + 'deg');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--tiltX', '0deg');
    card.style.setProperty('--tiltY', '0deg');
  });
}

(async () => {
  await carregarDados();
  ['trad','frutas','gourmet'].forEach(cat => {
    const sk = document.getElementById(`skeleton-${cat}`);
    if (sk) sk.style.display = 'none';
  });

  const linhasTabela = [
    { label: 'Caixa 25 un.',   trad: fmtPreco('trad',25),   frutas: fmtPreco('frutas',25),   gourmet: fmtPreco('gourmet',25)  },
    { label: 'Caixa 50 un.',   trad: fmtPreco('trad',50),   frutas: fmtPreco('frutas',50),   gourmet: fmtPreco('gourmet',50)  },
    { label: 'Caixa 75 un.',   trad: fmtPreco('trad',75),   frutas: fmtPreco('frutas',75),   gourmet: fmtPreco('gourmet',75)  },
    { label: 'Cento (100 un)', trad: fmtPreco('trad',100),  frutas: fmtPreco('frutas',100),  gourmet: fmtPreco('gourmet',100) },
  ];
  const tabelaEl = document.getElementById('tabelaPrecos');
  linhasTabela.forEach((linha, idx) => {
    const div = document.createElement('div');
    div.style.cssText = `display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:0.75rem 1.25rem;text-align:center;background:${idx % 2 === 0 ? 'var(--cream)' : 'var(--white)'};border-bottom:1px solid var(--cream-dark);`;
    div.innerHTML = `
      <span style="font-weight:600;color:var(--brown-dark);font-size:0.88rem;text-align:left;">${linha.label}</span>
      <span style="color:var(--brown-warm);font-size:0.88rem;">${linha.trad}</span>
      <span style="color:var(--brown-warm);font-size:0.88rem;">${linha.frutas}</span>
      <span style="color:var(--brown-warm);font-size:0.88rem;">${linha.gourmet}</span>
    `;
    tabelaEl.appendChild(div);
  });

  buildCards(trads,    'grid-trad',    'trad');
  buildCards(frutas,   'grid-frutas',  'frutas');
  buildCards(gourmets, 'grid-gourmet', 'gourmet');

  const elTrad    = document.getElementById('contador-trad');
  const elFrutas  = document.getElementById('contador-frutas');
  const elGourmet = document.getElementById('contador-gourmet');
  if (elTrad)    elTrad.textContent    = `✦ ${trads.length} sabores disponíveis`;
  if (elFrutas)  elFrutas.textContent  = `✦ ${frutas.length} sabores disponíveis`;
  if (elGourmet) elGourmet.textContent = `✦ ${gourmets.length} sabores disponíveis`;
})();

/* ── TABS ── */
document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.section;
    gtag('event', 'nav_click', { section: target });
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section').forEach(s => {
      s.classList.toggle('visible', s.id === target);
    });
    document.querySelectorAll(`#${target} .card`).forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        setTimeout(() => {
          card.style.transition = '';
          card.style.transform = '';
        }, 420);
      }, i * 50);
    });
  });
});

/* ── MODAL IMAGEM ── */
let modalImages = [], modalIndex = 0;

function openModal(src, fotos) {
  modalImages = Array.isArray(fotos) ? fotos : [src];
  modalIndex  = Math.max(0, modalImages.indexOf(src));
  document.getElementById('modalImage').src = modalImages[modalIndex];
  document.getElementById('imageModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('imageModal').classList.remove('active');
  document.body.style.overflow = '';
}
function prevImage() {
  if (modalImages.length < 2) return;
  modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
  document.getElementById('modalImage').src = modalImages[modalIndex];
}
function nextImage() {
  if (modalImages.length < 2) return;
  modalIndex = (modalIndex + 1) % modalImages.length;
  document.getElementById('modalImage').src = modalImages[modalIndex];
}
document.getElementById('imageModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')     closeModal();
  if (e.key === 'ArrowLeft')  prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

/* ── BANNER SAZONAL ── */
function dispararParticulasBanner(emoji) {
  const banner = document.getElementById('bannerSazonal');
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('span');
    p.className = 'banner-particula';
    p.textContent = emoji;
    p.style.left = `${Math.random() * 90 + 5}%`;
    p.style.animationDuration = `${3 + Math.random() * 2}s`;
    p.style.animationDelay = `${Math.random() * 3}s`;
    p.style.fontSize = `${0.8 + Math.random() * 0.6}rem`;
    banner.appendChild(p);
  }
}

(function() {
  const agora = new Date();
  const mes   = agora.getMonth(); // 0=Jan
  const dia   = agora.getDate();

  const eventos = [
    { mes: 1,  diaIni: 1,  diaFim: 13, emoji: '🥚', titulo: 'Páscoa chegando!',                  texto: 'Brigadeiros especiais para adoçar sua Páscoa. Faça já sua encomenda!',        badge: '🐣 Edição Especial de Páscoa' },
    { mes: 1,  diaIni: 25, diaFim: 28, emoji: '🎭', titulo: 'Carnaval chegando!',                 texto: 'Adoce sua folia com brigadeiros artesanais. Encomende com antecedência!',      badge: '🎉 Edição Carnaval' },
    { mes: 4,  diaIni: 1,  diaFim: 10, emoji: '💐', titulo: 'Dia das Mães se aproxima!',          texto: 'Presenteie quem você ama com brigadeiros feitos com carinho.',                badge: '💐 Encomendas abertas' },
    { mes: 5,  diaIni: 1,  diaFim: 12, emoji: '💘', titulo: 'Dia dos Namorados chegando!',        texto: 'Surpreenda com uma caixa especial de brigadeiros. Encomende com antecedência!', badge: '💘 Pedidos até 10/06' },
    { mes: 5,  diaIni: 15, diaFim: 30, emoji: '💛', titulo: 'Festa Junina chegando!',             texto: 'Brigadeiros temáticos para sua festa! Faça seu pedido com antecedência.',     badge: '🎪 Tema Junino disponível' },
    { mes: 7,  diaIni: 1,  diaFim: 10, emoji: '👔', titulo: 'Dia dos Pais se aproxima!',          texto: 'Surpreenda papai com uma caixa especial de brigadeiros artesanais.',           badge: '👔 Encomendas abertas' },
    { mes: 9,  diaIni: 1,  diaFim: 11, emoji: '👶', titulo: 'Dia das Crianças chegando!',         texto: 'Brigadeiros coloridos para a festa das crianças! Faça seu pedido.',           badge: '🎈 Edição Infantil' },
    { mes: 10, diaIni: 10, diaFim: 24, emoji: '🎄', titulo: 'Natal chegando!',                    texto: 'Brigadeiros especiais para adoçar as festas de fim de ano.',                  badge: '🎁 Encomendas de Natal abertas' },
    { mes: 11, diaIni: 20, diaFim: 31, emoji: '🥂', titulo: 'Feliz Ano Novo!',                    texto: 'Celebre com brigadeiros artesanais. Encomendas para a virada abertas!',       badge: '🎆 Réveillon' },
  ];

  const ativo = eventos.find(e => e.mes === mes && dia >= e.diaIni && dia <= e.diaFim);
  if (ativo) {
    document.getElementById('bannerEmoji').textContent  = ativo.emoji;
    document.getElementById('bannerTitulo').textContent = ativo.titulo;
    document.getElementById('bannerTexto').textContent  = ativo.texto;
    document.getElementById('bannerBadge').textContent  = ativo.badge;
    document.getElementById('bannerSazonal').style.display = 'block';
    dispararParticulasBanner(ativo.emoji);
  }
})();

/* ── CARROSSEL AUTOMÁTICO DE DEPOIMENTOS ── */
function iniciarCarrosselDepoimentos() {
  const grid = document.getElementById('depoimentos-grid');
  if (!grid || grid.dataset.carrosselAtivo) return;

  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzMovimento) return;

  const cardsOriginais = Array.from(grid.children);
  if (cardsOriginais.length < 2) return;

  cardsOriginais.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    grid.appendChild(clone);
  });
  grid.dataset.carrosselAtivo = '1';

  let pos = 0;
  let pausado = false;
  function passo() {
    if (!pausado) {
      pos -= 0.4;
      if (Math.abs(pos) >= grid.scrollWidth / 2) pos = 0;
      grid.style.transform = `translateX(${pos}px)`;
    }
    requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);

  const wrapper = grid.closest('.depoimentos-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => { pausado = true; });
    wrapper.addEventListener('mouseleave', () => { pausado = false; });
  }
}

/* ── DEPOIMENTOS DINÂMICOS (vindos das avaliações dos clientes) ── */
(function() {
  const appDepoimentos = firebase.initializeApp(window.FIREBASE_CONFIG, "depoimentosApp");
  const dbDepoimentos = appDepoimentos.database();

  iniciarCarrosselDepoimentos();

  dbDepoimentos.ref('depoimentos-publicos').once('value').then(snapshot => {
    if (!snapshot.exists()) return; // mantém os depoimentos fixos de fallback

    const lista = [];
    snapshot.forEach(child => {
      const d = child.val();
      if (d && d.comentario) lista.push(d);
    });

    if (lista.length === 0) return;

    lista.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const grid = document.getElementById('depoimentos-grid');
    grid.innerHTML = lista.map(d => `
      <div class="depoimento-card">
        <div class="depoimento-estrelas" style="font-size:1.8rem;">😊</div>
        <p class="depoimento-texto">"${escaparHTML(d.comentario)}"</p>
        <span class="depoimento-autor">— ${escaparHTML(d.nome || 'Cliente')}</span>
      </div>
    `).join('');
    delete grid.dataset.carrosselAtivo;
    iniciarCarrosselDepoimentos();
  }).catch(err => console.error('Erro ao carregar depoimentos:', err));
})();

/* ── BADGE "SABOR MAIS PEDIDO" (calculado no admin) ── */
(function() {
  const appDestaque = firebase.initializeApp(window.FIREBASE_CONFIG, "destaqueApp");
  const dbDestaque = appDestaque.database();
  dbDestaque.ref('estatisticas-publicas/saborMaisVendido').once('value').then(snap => {
    const nome = snap.val();
    if (!nome) return;
    document.querySelectorAll('.card h3').forEach(h3 => {
      if (h3.textContent.trim() === nome) {
        const badge = document.createElement('span');
        badge.className = 'badge-mais-vendido';
        badge.textContent = '🔥 Mais pedido';
        h3.insertAdjacentElement('afterend', badge);
      }
    });
  }).catch(err => console.error('Erro ao carregar destaque:', err));
})();

/* ── CALCULADORA "PRA QUANTAS PESSOAS" ── */
function calcularQuantidadePessoas() {
  const convidados = parseInt(document.getElementById('calcConvidados').value) || 0;
  const resultado = document.getElementById('calcResultadoPessoas');
  if (convidados <= 0) {
    resultado.innerHTML = '<p style="color:var(--red);font-size:0.85em;margin-top:10px;">Informe o número de convidados.</p>';
    return;
  }

  const mediaPorPessoa = 4;
  let sugerida = Math.ceil((convidados * mediaPorPessoa) / 25) * 25;
  if (sugerida < 25) sugerida = 25;

  let textoCombo;
  if (sugerida === 50 || sugerida === 100) {
    const precoMisto = COMBOS_MISTOS[sugerida]['50-50'];
    textoCombo = `<p style="margin-top:8px;font-size:0.85rem;">💡 Combo mais econômico: <strong>Caixa Mista ${sugerida} un</strong> (metade Tradicional, metade Gourmet) — <strong>${fmtBRL(precoMisto)}</strong></p>`;
  } else {
    const precoTrad = calcularPrecoItem('Tradicional', sugerida, sugerida);
    textoCombo = `<p style="margin-top:8px;font-size:0.85rem;">💰 Estimativa (todos Tradicionais): <strong>${fmtBRL(precoTrad)}</strong></p>`;
  }

  resultado.innerHTML = `
    <div style="background:var(--cream);border-radius:14px;padding:16px;margin-top:14px;text-align:center;">
      <p style="font-size:0.85em;color:var(--brown-warm);">Para <strong>${convidados}</strong> convidados, sugerimos:</p>
      <p style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--brown-dark);margin:6px 0;">${sugerida} brigadeiros</p>
      ${textoCombo}
    </div>`;
}

let saborSorteadoAtual = null;
let intervalDado = null;

function abrirSurpresa() {
  const favoritos = getFavoritos();
  const todos = [...trads, ...frutas, ...gourmets].filter(i => !favoritos.includes(i.nome));
  if (todos.length === 0) {
    showToast('Você já favoritou todos os sabores! 😄');
    return;
  }

  gtag('event', 'sabor_surpresa', {});

  document.getElementById('surpresaResultado').style.display = 'none';
  document.getElementById('surpresaRoletaWrap').style.display = 'block';
  document.getElementById('btnGirarRoleta').style.display = 'block';
  document.getElementById('btnGirarRoleta').disabled = false;

  const nomeGirando = document.getElementById('surpresaNomeGirando');
  nomeGirando.textContent = '?';
  nomeGirando.style.color = '';
  document.getElementById('surpresaDado').style.transform = 'rotate(0deg) scale(1)';

  document.getElementById('surpresaModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function girarRoleta() {
  const favoritos = getFavoritos();
  const todos = [...trads, ...frutas, ...gourmets].filter(i => !favoritos.includes(i.nome));
  if (todos.length === 0) return;

  document.getElementById('btnGirarRoleta').disabled = true;

  const sorteado = todos[Math.floor(Math.random() * todos.length)];
  saborSorteadoAtual = sorteado;

  const nomeGirando = document.getElementById('surpresaNomeGirando');
  const dado        = document.getElementById('surpresaDado');
  nomeGirando.style.color = '';

  const totalTicks = 22; // quantidade de "trocas" de nome até parar
  let tick = 0;

  if (intervalDado) clearInterval(intervalDado);

  function passoDado() {
    // sacode o dado a cada troca de nome
    const anguloAleatorio = Math.random() * 30 - 15;
    dado.style.transform = `rotate(${anguloAleatorio}deg) scale(0.94)`;
    setTimeout(() => { dado.style.transform = 'rotate(0deg) scale(1)'; }, 70);

    tick++;
    if (tick >= totalTicks) {
      // última troca: já mostra o sabor sorteado
      nomeGirando.textContent = sorteado.nome;
      finalizarSorteio(sorteado);
      return;
    }

    // mostra um sabor aleatório (pode repetir, é só efeito visual)
    const aleatorio = todos[Math.floor(Math.random() * todos.length)];
    nomeGirando.textContent = aleatorio.nome;

    // desacelera: intervalo cresce a cada tick (efeito "freando")
    const delay = 60 + tick * 6;
    intervalDado = setTimeout(passoDado, delay);
  }

  passoDado();
}

function girarNovamente() {
  document.getElementById('surpresaResultado').style.display = 'none';
  document.getElementById('surpresaRoletaWrap').style.display = 'flex';
  document.getElementById('btnGirarRoleta').style.display = 'block';
  document.getElementById('btnGirarRoleta').disabled = false;
  girarRoleta();
}

function finalizarSorteio(sabor) {
  const nomeGirando = document.getElementById('surpresaNomeGirando');
  if (nomeGirando) nomeGirando.style.color = 'var(--amber)';
  document.getElementById('btnGirarRoleta').style.display = 'none';
  document.getElementById('surpresaRoletaWrap').style.display = 'none';

  const resultado = document.getElementById('surpresaResultado');
  document.getElementById('surpresaNomeFinal').textContent = sabor.nome;
  resultado.style.display = 'block';

  // força o reinício das animações CSS em cascata (selo, label, card, botões)
  const elementosAnimados = resultado.querySelectorAll(
    '.surpresa-selo, .surpresa-resultado-label, .surpresa-nome-card, .btn-ver-sabor, .btn-girar-novo'
  );
  elementosAnimados.forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // reflow: reseta o estado antes de reaplicar
    el.style.animation = '';
  });

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 70,
      spread: 65,
      origin: { y: 0.45 },
      colors: ['#E8943A', '#8B4513', '#639922', '#FDF8F0']
    });
  }
}

function irParaSaborSorteado() {
  if (!saborSorteadoAtual) return;
  const nomeAlvo = saborSorteadoAtual.nome;
  fecharSurpresa();
  const card = [...document.querySelectorAll('.card h3')].find(h => h.textContent.trim() === nomeAlvo);
  if (card) {
    const secao = card.closest('.section').id;
    irParaCategoria(secao);
    setTimeout(() => {
      card.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.closest('.card').style.boxShadow = '0 0 0 3px var(--amber)';
      setTimeout(() => { card.closest('.card').style.boxShadow = ''; }, 1600);
    }, 350);
  }
}

function fecharSurpresa() {
  document.getElementById('surpresaModal').classList.remove('active');
  document.body.style.overflow = '';
}
