/* ═══════════════════════════════════════════
   CARDÁPIO — DADOS, PREÇOS E CÁLCULOS
   Depende de: shared/firebase-config.js, shared/sabores-precos.js, shared/utils.js
   Precisa carregar ANTES de: cardapio-cards.js, cardapio-carrinho.js
═══════════════════════════════════════════ */

/* ── DADOS (lidos do repo docesflor/admin) ── */
const BASE = 'https://raw.githubusercontent.com/docesflor/cardapio/main/imagens_cardapio/';
const DADOS_CARDAPIO = {
  "trads": [
    { "nome": "Amendoim",              "fotos": ["amendoim.png"] },
    { "nome": "Beijinho",              "fotos": ["beijinho.png"] },
    { "nome": "Brigadeiro",            "fotos": ["brigadeiro.png"] },
    { "nome": "Café",                  "fotos": ["cafe.png"] },
    { "nome": "Chocotone",             "fotos": ["chocotone.png"] },
    { "nome": "Dois Amores",           "fotos": ["dois-amores.png"] },
    { "nome": "Leite Ninho",           "fotos": ["leite-ninho.png"] },
    { "nome": "Moranguinho (Nesquik)", "fotos": ["moranguinho.png"] },
    { "nome": "Morango Ninho",         "fotos": ["morango-ninho.png"] },
    { "nome": "Prestígio",             "fotos": ["prestigio.png"] },
    { "nome": "Quebra Queixo",         "fotos": ["quebra-queixo.png"] },
    { "nome": "Sensação",              "fotos": ["sensacao.png"] },
    { "nome": "Tapioca",               "fotos": ["tapioca.png"] }
  ],
  "frutas": [
    { "nome": "Amora",            "fotos": ["amora.png"] },
    { "nome": "Banana",           "fotos": ["banana.png"] },
    { "nome": "Cereja",           "fotos": ["cereja.png"] },
    { "nome": "Frutas Vermelhas", "fotos": ["frutas-vermelhas.png"] },
    { "nome": "Limão",            "fotos": ["limao.png"] },
    { "nome": "Maracujá",         "fotos": ["maracuja.png"] },
    { "nome": "Milho",            "fotos": ["milho.png"] },
    { "nome": "Uva",              "fotos": ["uva.png"] }
  ],
  "gourmets": [
    { "nome": "Banoffee",                "fotos": ["banoffee.png"] },
    { "nome": "Black Cacau",             "fotos": ["black-cacau.png"] },
    { "nome": "Canjica",                 "fotos": ["canjica.png"] },
    { "nome": "Chocolate Gourmet",       "fotos": ["chocolate-gourmet.png"] },
    { "nome": "Churros",                 "fotos": ["churros.png"] },
    { "nome": "Confete",                 "fotos": ["confete.png"] },
    { "nome": "Doritos",                 "fotos": ["doritos.png"] },
    { "nome": "Ferrero Rocher",          "fotos": ["ferrero.png"] },
    { "nome": "Floresta Negra",          "fotos": ["floresta-negra.png"] },
    { "nome": "Guacamole",               "fotos": ["guacamole.png"] },
    { "nome": "Leite Ninho com Nutella", "fotos": ["leite-ninho-nutella.png"] },
    { "nome": "Menta",                   "fotos": ["menta.png"] },
    { "nome": "Negresco",                "fotos": ["negresco.png"] },
    { "nome": "Nutella",                 "fotos": ["nutella.png"] },
    { "nome": "Ovomaltine",              "fotos": ["ovomaltine.png"] }
  ],
  "precos": {
    "trad":    { "25": 35,  "50": 60,  "75": 85,  "100": 110 },
    "frutas":  { "25": 40,  "50": 70,  "75": 100, "100": 125 },
    "gourmet": { "25": 45,  "50": 80,  "75": 115, "100": 140 },
    "avulsa":  { "trad": 1.50, "frutas": 1.75, "gourmet": 2.00 }
  }
};

let trads    = [];
let frutas   = [];
let gourmets = [];
let PRECOS   = {};

async function carregarDados() {
  try {
    const d = DADOS_CARDAPIO;
    trads    = (d.trads    || []).map(i => ({ ...i, fotos: (i.fotos || []).map(f => BASE + f) }));
    frutas   = (d.frutas   || []).map(i => ({ ...i, fotos: (i.fotos || []).map(f => BASE + f) }));
    gourmets = (d.gourmets || []).map(i => ({ ...i, fotos: (i.fotos || []).map(f => BASE + f) }));
    
    // Ordena sabores alfabeticamente
    trads = trads.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    frutas = frutas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    gourmets = gourmets.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    const cat = window.CATALOGO_DOCES_FLOR.precos;
    PRECOS = {
      trad:    { 25: cat.trad[25],    50: cat.trad[50],    75: cat.trad[75],    100: cat.trad[100]    },
      frutas:  { 25: cat.frutas[25],  50: cat.frutas[50],  75: cat.frutas[75],  100: cat.frutas[100]  },
      gourmet: { 25: cat.gourmet[25], 50: cat.gourmet[50], 75: cat.gourmet[75], 100: cat.gourmet[100] },
      avulsa:  { trad: cat.trad.avulso, frutas: cat.frutas.avulso, gourmet: cat.gourmet.avulso }
    };
  } catch(e) {
    console.error('Erro ao carregar dados-cardapio.json', e);
  }
}

function fmtPreco(cat, qtd) {
  const v = PRECOS?.[cat]?.[qtd];
  if (!v) return '—';
  return 'R$ ' + parseFloat(v).toFixed(2).replace('.', ',');
}

/* ── CÁLCULO DE PREÇO ── */
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
