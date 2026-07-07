/* DOCES FLOR - CARDAPIO: montagem dos cards */
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
