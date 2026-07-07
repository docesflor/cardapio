/* DOCES FLOR - CARDAPIO: dados e catalogo */
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
