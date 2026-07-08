/* ═══════════════════════════════════════════
   CARDÁPIO — CARDS DE SABORES, MODAL DE IMAGEM,
   ABAS, BANNER SAZONAL E DEPOIMENTOS DINÂMICOS
   Depende de: cardapio-dados.js
═══════════════════════════════════════════ */

/* ── BUILD CARDS ── */
function buildCards(list, containerId, type) {
  const container = document.getElementById(containerId);
  list.forEach((item, i) => {
    const fotos = Array.isArray(item.fotos) ? item.fotos : [item.foto];
    const card  = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-img-wrap">
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
      abrirQtdModal(item.nome, type);
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
    }, i * 60);

    container.appendChild(card);
  });
}

(async () => {
  await carregarDados();

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
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
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
  }
})();

/* ── DEPOIMENTOS DINÂMICOS (vindos das avaliações dos clientes) ── */
(function() {
  const appDepoimentos = firebase.initializeApp(window.FIREBASE_CONFIG, "depoimentosApp");
  const dbDepoimentos = appDepoimentos.database();

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
  }).catch(err => console.error('Erro ao carregar depoimentos:', err));
})();
