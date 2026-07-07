/* DOCES FLOR - CARDAPIO: inicializacao */
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
