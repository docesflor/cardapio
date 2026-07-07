/* DOCES FLOR - CARDAPIO: depoimentos dinamicos */
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
