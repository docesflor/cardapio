/* ═══════════════════════════════════════════
   CARDÁPIO — DADOS, PREÇOS E CÁLCULOS
   Depende de: shared/firebase-config.js, shared/sabores-precos.js, shared/utils.js
   Precisa carregar ANTES de: cardapio-cards.js, cardapio-carrinho.js
═══════════════════════════════════════════ */

/* ── FOTOS (única coisa que continua local — é a única informação
   que não existe no catálogo compartilhado). Chave = nome exato do
   sabor em shared/sabores-precos.js. Se um sabor novo não tiver
   entrada aqui, cai automaticamente na foto placeholder abaixo. ── */
const BASE = 'https://raw.githubusercontent.com/docesflor/cardapio/main/imagens_cardapio/';

const FOTOS_SABORES = {
  // Tradicionais
  "Amendoim":              "amendoim.png",
  "Beijinho":               "beijinho.png",
  "Brigadeiro":             "brigadeiro.png",
  "Café":                   "cafe.png",
  "Chocotone":              "chocotone.png",
  "Dois Amores":            "dois-amores.png",
  "Leite Ninho":            "leite-ninho.png",
  "Moranguinho (Nesquik)":  "moranguinho.png",
  "Morango Ninho":          "morango-ninho.png",
  "Prestígio":              "prestigio.png",
  "Quebra Queixo":          "quebra-queixo.png",
  "Sensação":               "sensacao.png",
  "Tapioca":                "tapioca.png",
  // Frutas
  "Amora":            "amora.png",
  "Banana":           "banana.png",
  "Cereja":           "cereja.png",
  "Frutas Vermelhas": "frutas-vermelhas.png",
  "Limão":            "limao.png",
  "Maracujá":         "maracuja.png",
  "Milho":            "milho.png",
  "Uva":              "uva.png",
  // Gourmet
  "Banoffee":                "banoffee.png",
  "Black Cacau":             "black-cacau.png",
  "Canjica":                 "canjica.png",
  "Chocolate Gourmet":       "chocolate-gourmet.png",
  "Churros":                 "churros.png",
  "Confete":                 "confete.png",
  "Doritos":                 "doritos.png",
  "Ferrero Rocher":          "ferrero.png",
  "Floresta Negra":          "floresta-negra.png",
  "Guacamole":               "guacamole.png",
  "Leite Ninho com Nutella": "leite-ninho-nutella.png",
  "Menta":                   "menta.png",
  "Negresco":                "negresco.png",
  "Nutella":                 "nutella.png",
  "Ovomaltine":              "ovomaltine.png"
};

let trads    = [];
let frutas   = [];
let gourmets = [];
let PRECOS   = {};

/* Monta a lista de uma categoria a partir do catálogo compartilhado,
   resolvendo a foto de cada sabor (ou usando o placeholder + aviso
   no console, caso ainda não tenha entrada em FOTOS_SABORES). */
function montarCategoria(nomes) {
  return nomes
    .map(nome => {
      const arquivo = FOTOS_SABORES[nome];
      if (!arquivo) {
        console.warn(`[cardapio-dados] Sem foto cadastrada para "${nome}" — card vai usar o visual "foto em breve". Adicione em FOTOS_SABORES quando tiver a foto.`);
      }
      return { nome, fotos: arquivo ? [BASE + arquivo] : [] };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

async function carregarDados() {
  try {
    const s = window.CATALOGO_DOCES_FLOR.sabores;
    trads    = montarCategoria(s.trads);
    frutas   = montarCategoria(s.frutas);
    gourmets = montarCategoria(s.gourmets);

    const cat = window.CATALOGO_DOCES_FLOR.precos;
    PRECOS = {
      trad:    { 25: cat.trad[25],    50: cat.trad[50],    75: cat.trad[75],    100: cat.trad[100]    },
      frutas:  { 25: cat.frutas[25],  50: cat.frutas[50],  75: cat.frutas[75],  100: cat.frutas[100]  },
      gourmet: { 25: cat.gourmet[25], 50: cat.gourmet[50], 75: cat.gourmet[75], 100: cat.gourmet[100] },
      avulsa:  { trad: cat.trad.avulso, frutas: cat.frutas.avulso, gourmet: cat.gourmet.avulso }
    };
  } catch(e) {
    console.error('Erro ao carregar dados do catálogo compartilhado', e);
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
