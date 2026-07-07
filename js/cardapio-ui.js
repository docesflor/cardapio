/* DOCES FLOR - CARDAPIO: abas, modais, toast e banner */
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

/* ── TOAST ── */
let toastTimer;
function showToast(msg, erro = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (erro ? ' erro' : '');
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── CARRINHO ── */

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
