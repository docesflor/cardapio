/* DOCES FLOR - CARDAPIO: precos e calculos */
function calcularPrecoItem(tipo, qtd, totalTipo) {
  const tabela = tipo === 'Tradicional' ? PRECOS.trad : tipo === 'Frutas' ? PRECOS.frutas : PRECOS.gourmet;
  const chave  = tipo === 'Tradicional' ? 'trad' : tipo === 'Frutas' ? 'frutas' : 'gourmet';
  let precoUn;
  if      (totalTipo >= 100) precoUn = tabela[100] / 100;
  else if (totalTipo >= 75)  precoUn = tabela[75]  / 75;
  else if (totalTipo >= 50)  precoUn = tabela[50]  / 50;
  else if (totalTipo >= 25)  precoUn = tabela[25]  / 25;
  else                       precoUn = PRECOS.avulsa[chave];
  return precoUn * qtd;
}

const COMBOS_MISTOS = {
  100: { '100-0': 110, '75-25': 120, '50-50': 125, '25-75': 130, '0-100': 140 },
  50:  { '100-0':  60, '75-25':  65, '50-50':  70, '25-75':  75, '0-100':  80 }
};

function calcularTotalCarrinho() {
  const totalTrad    = carrinho.filter(i => i.tipo === 'Tradicional').reduce((s, i) => s + i.qtd, 0);
  const totalFrutas  = carrinho.filter(i => i.tipo === 'Frutas').reduce((s, i) => s + i.qtd, 0);
  const totalGourmet = carrinho.filter(i => i.tipo === 'Gourmet').reduce((s, i) => s + i.qtd, 0);
  const totalGeral   = totalTrad + totalFrutas + totalGourmet;

  // Identifica se exatamente 2 categorias estão presentes (combo misto)
  const categoriasAtivas = [
    { nome: 'Tradicional', qtd: totalTrad },
    { nome: 'Frutas',      qtd: totalFrutas },
    { nome: 'Gourmet',     qtd: totalGourmet }
  ].filter(c => c.qtd > 0);

  let precoCombo = null;

  if (categoriasAtivas.length === 2 && (totalGeral === 50 || totalGeral === 100)) {
    const [a, b] = categoriasAtivas;
    const tabela = COMBOS_MISTOS[totalGeral];
    const fator = 100 / totalGeral;
    const pctA = a.qtd * fator;
    const pctB = b.qtd * fator;
    const chave = `${pctA}-${pctB}`;
    if (tabela[chave] !== undefined) {
      precoCombo = tabela[chave];
    }
  }

  // Soma normal (sem combo) — usada para calcular o desconto a exibir
  const subtotalNormal = carrinho.reduce((s, i) => s + calcularPrecoItem(
    i.tipo, i.qtd,
    i.tipo === 'Tradicional' ? totalTrad : i.tipo === 'Frutas' ? totalFrutas : totalGourmet
  ), 0);

  const total = precoCombo !== null ? precoCombo : subtotalNormal;
  const descontoCombo = precoCombo !== null ? Math.max(0, subtotalNormal - precoCombo) : 0;

  return { total, totalTrad, totalFrutas, totalGourmet, totalGeral, descontoCombo };
}

function fmtBRL(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

/* ── BUILD CARDS ── */
