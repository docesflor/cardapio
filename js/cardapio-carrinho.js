/* ═══════════════════════════════════════════
   CARDÁPIO — TOAST, CARRINHO DE COMPRAS E ENVIO WHATSAPP
   Depende de: cardapio-dados.js
   Carrega por ÚLTIMO (tem o listener de clique fora do modal de qtd).
═══════════════════════════════════════════ */

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

/* ── MODAL DE CONFIRMAÇÃO (substitui confirm() nativo) ── */
function showConfirmModal(mensagem, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--white,#fff);border-radius:16px;padding:24px;max-width:320px;width:100%;text-align:center;font-family:"DM Sans",sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
  box.innerHTML = `
    <p style="margin:0 0 20px;color:var(--brown-dark,#3E2412);font-size:0.95rem;line-height:1.4;">${escaparHTML(mensagem)}</p>
    <div style="display:flex;gap:10px;">
      <button type="button" id="btnConfirmModalCancelar" style="flex:1;padding:10px;border:1.5px solid var(--cream-dark,#E8DCC8);border-radius:50px;background:none;color:var(--brown-warm,#7A5230);font-weight:600;font-family:inherit;cursor:pointer;">Cancelar</button>
      <button type="button" id="btnConfirmModalOk" style="flex:1;padding:10px;border:none;border-radius:50px;background:var(--amber,#D97706);color:#fff;font-weight:700;font-family:inherit;cursor:pointer;">Confirmar</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  function fechar() { overlay.remove(); document.body.style.overflow = ''; }
  box.querySelector('#btnConfirmModalCancelar').addEventListener('click', fechar);
  box.querySelector('#btnConfirmModalOk').addEventListener('click', () => { fechar(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });
}

/* ── CARRINHO ── */
let carrinho = [];
try {
  const salvo = localStorage.getItem('docesflor_carrinho');
  if (salvo) carrinho = JSON.parse(salvo);
} catch(e) { carrinho = []; }
let itemPendente = null, qtdSelecionada = 0;

function abrirQtdModal(nome, tipo) {
  itemPendente  = { nome, tipo: tipo === 'trad' ? 'Tradicional' : tipo === 'frutas' ? 'Frutas' : 'Gourmet' };
  qtdSelecionada = 0;
  document.getElementById('qtdModalNome').textContent = nome;
  document.getElementById('qtdCustom').value = '';
  document.getElementById('qtdCustom').classList.remove('input-erro');
  document.getElementById('msgErroQtd').textContent = '';
  document.querySelectorAll('.btn-qtd-opcao').forEach(b => b.classList.remove('selecionado'));
  const infoEl = document.getElementById('qtdPrecoInfo');
  if (infoEl) infoEl.textContent = 'Selecione uma quantidade';
  document.getElementById('qtdModal').classList.add('active');
}
function fecharQtdModal() {
  document.getElementById('qtdModal').classList.remove('active');
  itemPendente = null;
  qtdSelecionada = 0;
}
function selecionarQtd(qtd) {
  qtdSelecionada = qtd;
  document.getElementById('qtdCustom').value = '';
  document.getElementById('qtdCustom').classList.remove('input-erro');
  document.getElementById('msgErroQtd').textContent = '';
  document.querySelectorAll('.btn-qtd-opcao').forEach(b => {
    b.classList.toggle('selecionado', parseInt(b.textContent) === qtd);
  });
  atualizarPrecoModal(qtd);
}

function atualizarPrecoModal(qtd) {
  if (!itemPendente || !qtd) return;
  const tipo = itemPendente.tipo;
  const chave = tipo === 'Tradicional' ? 'trad' : tipo === 'Frutas' ? 'frutas' : 'gourmet';
  const tabela = PRECOS[chave];
  let precoUn;
  if      (qtd >= 100) precoUn = tabela[100] / 100;
  else if (qtd >= 75)  precoUn = tabela[75]  / 75;
  else if (qtd >= 50)  precoUn = tabela[50]  / 50;
  else if (qtd >= 25)  precoUn = tabela[25]  / 25;
  else                 precoUn = PRECOS.avulsa[chave];
  const total = precoUn * qtd;
  const el = document.getElementById('qtdPrecoInfo');
  if (el) el.innerHTML = `${qtd} un × <span>R$ ${precoUn.toFixed(2).replace('.',',')} /un</span> = <span>R$ ${total.toFixed(2).replace('.',',')}</span>`;
}
function limparErroQtd() {
  document.getElementById('qtdCustom').classList.remove('input-erro');
  document.getElementById('msgErroQtd').textContent = '';
  const qtdCustomVal = parseInt(document.getElementById('qtdCustom').value);
  if (qtdCustomVal >= 25) atualizarPrecoModal(qtdCustomVal);
}
function mostrarErroQtd(msg) {
  document.getElementById('qtdCustom').classList.add('input-erro');
  document.getElementById('msgErroQtd').textContent = msg;
}

function confirmarQtd() {
  const custom = parseInt(document.getElementById('qtdCustom').value);
  const qtd    = custom > 0 ? custom : qtdSelecionada;

  if (!qtd || qtd <= 0) {
    mostrarErroQtd('Selecione uma quantidade.');
    return;
  }
  if (qtd < 25) {
    mostrarErroQtd('Mínimo de 25 unidades por sabor.');
    return;
  }
  if (qtd % 25 !== 0) {
    mostrarErroQtd('Use múltiplos de 25 (ex: 25, 50, 75...).');
    return;
  }

  const existente = carrinho.find(i => i.nome === itemPendente.nome);
  if (existente) {
    existente.qtd += qtd;
  } else {
    carrinho.push({ nome: itemPendente.nome, tipo: itemPendente.tipo, qtd });
  }

  const nomeAdicionado = itemPendente.nome;
  fecharQtdModal();
  atualizarCarrinho();
  showToast(`✓ ${qtd}x ${nomeAdicionado} adicionado!`);
  const fab = document.getElementById('carrinhoFab');
  if (fab) {
    fab.classList.remove('animando');
    void fab.offsetWidth; // força reflow para reiniciar animação
    fab.classList.add('animando');
    setTimeout(() => fab.classList.remove('animando'), 500);
  }
}

function atualizarCarrinho() {
  // Persiste no localStorage
  try { localStorage.setItem('docesflor_carrinho', JSON.stringify(carrinho)); } catch(e) {}
  const fab   = document.getElementById('carrinhoFab');
  const count = document.getElementById('carrinhoCount');
  // Atualiza badges das abas
  const qtdTradTab    = carrinho.filter(i => i.tipo === 'Tradicional').reduce((s, i) => s + i.qtd, 0);
  const qtdGourmetTab = carrinho.filter(i => i.tipo === 'Gourmet').reduce((s, i) => s + i.qtd, 0);
  const qtdFrutasTab  = carrinho.filter(i => i.tipo === 'Frutas').reduce((s, i) => s + i.qtd, 0);
  const tabTrad    = document.getElementById('tab-tradicionais');
  const tabGourmet = document.getElementById('tab-gourmet');
  const tabFrutas  = document.getElementById('tab-frutas');
  if (tabTrad)    tabTrad.textContent    = qtdTradTab    > 0 ? `Tradicionais (${qtdTradTab} un)`  : 'Tradicionais';
  if (tabGourmet) tabGourmet.textContent = qtdGourmetTab > 0 ? `Gourmet (${qtdGourmetTab} un)`    : 'Gourmet';
  if (tabFrutas)  tabFrutas.textContent  = qtdFrutasTab  > 0 ? `Frutas (${qtdFrutasTab} un)`      : 'Frutas';

  fab.style.display = carrinho.length > 0 ? 'flex' : 'none';
  count.textContent = carrinho.length;

  const container = document.getElementById('carrinhoItens');
  const resumoEl  = document.getElementById('carrinhoResumo');

  if (carrinho.length === 0) {
    container.innerHTML = '<div class="carrinho-vazio">Nenhum item adicionado ainda.</div>';
    resumoEl.innerHTML  = '';
    return;
  }

  // Botões "Adicionar mais"
  const atalhos = document.getElementById('carrinhoAtalhos');
  if (carrinho.length > 0) {
    atalhos.style.display = 'flex';
    const cats = [
      { label: '+ Tradicionais', section: 'tradicionais', tab: 'tab-tradicionais' },
      { label: '+ Frutas',       section: 'frutas',       tab: 'tab-frutas'       },
      { label: '+ Gourmet',      section: 'gourmet',      tab: 'tab-gourmet'      },
    ];
    atalhos.innerHTML = cats.map(c => `
      <button onclick="irParaCategoria('${c.section}')"
        style="padding:5px 12px;border:1.5px solid var(--amber);border-radius:50px;background:none;
        color:var(--amber);font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:600;
        cursor:pointer;transition:all 0.2s;"
        onmouseover="this.style.background='var(--amber)';this.style.color='white'"
        onmouseout="this.style.background='none';this.style.color='var(--amber)'">${c.label}</button>
    `).join('');
  } else {
    atalhos.style.display = 'none';
  }

  container.innerHTML = '';
  const tipoInfo = {
    'Tradicional': { classe: 'trad',    emoji: '🍫' },
    'Frutas':      { classe: 'frutas',  emoji: '🍓' },
    'Gourmet':     { classe: 'gourmet', emoji: '✨' }
  };
  carrinho.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'carrinho-item';
    const info = tipoInfo[item.tipo] || { classe: 'trad', emoji: '' };
    div.innerHTML = `
      <div class="carrinho-item-info">
        <span class="carrinho-item-nome">${item.nome}</span>
        <span class="badge badge-${info.classe} carrinho-item-badge">${info.emoji} ${item.tipo}</span>
      </div>
      <div class="carrinho-item-qtd">
        <button class="btn-qtd" onclick="ajustarQtd(${idx}, -25)" aria-label="Diminuir quantidade">−</button>
        <span>${item.qtd} un</span>
        <button class="btn-qtd" onclick="ajustarQtd(${idx}, 25)" aria-label="Aumentar quantidade">+</button>
      </div>
      <button class="btn-remover-item" onclick="removerItem(${idx})" aria-label="Remover ${item.nome}">×</button>
    `;
    container.appendChild(div);
  });

  // botão limpar
  const btnLimpar = document.createElement('button');
  btnLimpar.className = 'btn-limpar-carrinho';
  btnLimpar.textContent = 'Limpar carrinho';
  btnLimpar.onclick = () => {
    showConfirmModal('Remover todos os itens do pedido?', () => {
      carrinho = [];
      atualizarCarrinho();
    });
  };
  container.appendChild(btnLimpar);

  // resumo de preços
const { total, totalTrad, totalFrutas, totalGourmet, descontoCombo } = calcularTotalCarrinho();
  const totalQtd = carrinho.reduce((s, i) => s + i.qtd, 0);

  let resumoHTML = `<div class="carrinho-resumo">`;
  resumoHTML += `<div class="carrinho-resumo-linha"><span>Total de unidades</span><span>${totalQtd} un</span></div>`;
  if (totalTrad > 0) {
    const subtotalTrad = carrinho.filter(i => i.tipo === 'Tradicional').reduce((s, i) => s + calcularPrecoItem(i.tipo, i.qtd, totalTrad), 0);
    resumoHTML += `<div class="carrinho-resumo-linha"><span>🍫 Tradicionais (${totalTrad} un)</span><span>${fmtBRL(subtotalTrad)}</span></div>`;
  }
  if (totalFrutas > 0) {
    const subtotalFrutas = carrinho.filter(i => i.tipo === 'Frutas').reduce((s, i) => s + calcularPrecoItem(i.tipo, i.qtd, totalFrutas), 0);
    resumoHTML += `<div class="carrinho-resumo-linha"><span>🍓 Frutas (${totalFrutas} un)</span><span>${fmtBRL(subtotalFrutas)}</span></div>`;
  }
  if (totalGourmet > 0) {
    const subtotalGourmet = carrinho.filter(i => i.tipo === 'Gourmet').reduce((s, i) => s + calcularPrecoItem(i.tipo, i.qtd, totalGourmet), 0);
    resumoHTML += `<div class="carrinho-resumo-linha"><span>✨ Gourmet (${totalGourmet} un)</span><span>${fmtBRL(subtotalGourmet)}</span></div>`;
  }
  // calcula economia vs preço avulso
  const economiaTotal = carrinho.reduce((s, i) => {
    const chave = i.tipo === 'Tradicional' ? 'trad' : i.tipo === 'Frutas' ? 'frutas' : 'gourmet';
    const precoAvulso = PRECOS.avulsa[chave];
    const totalTipoAtual = carrinho.filter(x => x.tipo === i.tipo).reduce((a, x) => a + x.qtd, 0);
    let precoReal;
    const tab = PRECOS[chave];
    if      (totalTipoAtual >= 100) precoReal = tab[100] / 100;
    else if (totalTipoAtual >= 75)  precoReal = tab[75]  / 75;
    else if (totalTipoAtual >= 50)  precoReal = tab[50]  / 50;
    else if (totalTipoAtual >= 25)  precoReal = tab[25]  / 25;
    else                            precoReal = precoAvulso;
    return s + (precoAvulso - precoReal) * i.qtd;
  }, 0) + descontoCombo;

  if (descontoCombo > 0) {
    resumoHTML += `<div class="carrinho-resumo-linha" style="color:var(--green);font-weight:700;"><span>🎁 Desconto Combo Misto</span><span>- ${fmtBRL(descontoCombo)}</span></div>`;
  }
  resumoHTML += `<div class="carrinho-resumo-linha total"><span>Total estimado</span><span>${fmtBRL(total)}</span></div>`;
  if (economiaTotal > 0) {
    resumoHTML += `<div class="carrinho-resumo-linha economia">🎉 Você economizou ${fmtBRL(economiaTotal)} vs preço avulso!</div>`;
  }

  // dica de próxima faixa
  ['Tradicional','Frutas','Gourmet'].forEach(tipo => {
    const chave = tipo === 'Tradicional' ? 'trad' : tipo === 'Frutas' ? 'frutas' : 'gourmet';
    const qtdTipo = carrinho.filter(i => i.tipo === tipo).reduce((s, i) => s + i.qtd, 0);
    if (qtdTipo === 0) return;
    const faixas = [25, 50, 75, 100];
    const proxima = faixas.find(f => f > qtdTipo);
    if (proxima) {
      const faltam = proxima - qtdTipo;
      const tab = PRECOS[chave];
      const precoProx = tab[proxima] / proxima;
      resumoHTML += `<div style="font-size:0.72rem;color:var(--brown-warm);margin-top:4px;">💡 Adicione mais ${faltam} un de ${tipo} e pague R$ ${precoProx.toFixed(2).replace('.',',')} /un</div>`;
    }
  });
  resumoHTML += `<p class="carrinho-resumo-nota">* Valor estimado conforme tabela. Prazo mín. 48h. Preço final confirmado pelo WhatsApp.</p>`;
  resumoHTML += `</div>`;
  resumoEl.innerHTML = resumoHTML;
}

function ajustarQtd(idx, delta) {
  carrinho[idx].qtd += delta;
  if (carrinho[idx].qtd < 25) carrinho.splice(idx, 1);
  atualizarCarrinho();
}
function removerItem(idx) {
  carrinho.splice(idx, 1);
  atualizarCarrinho();
}
function abrirCarrinho() {
  gtag('event', 'open_cart', {});
  atualizarCarrinho();
  const nomeInput = document.getElementById('nomeCarrinho');
  if (nomeInput && !nomeInput.value) {
    try {
      const nomeSalvo = localStorage.getItem('docesflor_nome_cliente');
      if (nomeSalvo) nomeInput.value = nomeSalvo;
    } catch(e) {}
  }
  document.getElementById('carrinhoDrawer').classList.add('aberto');
  document.getElementById('carrinhoOverlay').classList.add('visivel');
  document.body.style.overflow = 'hidden';
}
function fecharCarrinho() {
  document.getElementById('carrinhoDrawer').classList.remove('aberto');
  document.getElementById('carrinhoOverlay').classList.remove('visivel');
  document.body.style.overflow = '';
}
function irParaCategoria(section) {
  fecharCarrinho();
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('visible', s.id === section));
  const tab = document.querySelector(`[data-section="${section}"]`);
  if (tab) tab.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function enviarPedidoWhatsApp() {
  if (carrinho.length === 0) return;
  sessionStorage.setItem('docesflor_pedido_enviado', '1');

  const nomeInput = document.getElementById('nomeCarrinho');
  const nome = nomeInput.value.trim();
  if (!nome) {
    document.getElementById('msgErroNome').textContent = 'Por favor, informe seu nome.';
    nomeInput.classList.add('input-erro');
    nomeInput.focus();
    return;
  }
  document.getElementById('msgErroNome').textContent = '';
  nomeInput.classList.remove('input-erro');
  try { localStorage.setItem('docesflor_nome_cliente', nome); } catch(e) {}

  gtag('event', 'send_order_whatsapp', { items: carrinho.length });

  const { total } = calcularTotalCarrinho();
  const totalQtd = carrinho.reduce((s, i) => s + i.qtd, 0);
  const obsCliente = (document.getElementById('obsCarrinho')?.value || '').trim();
  let msg = `🌸 *Pedido Doces Flor*\n\n*Nome:* ${nome}\n\n`;
  carrinho.forEach(item => { msg += `• ${item.qtd}x ${item.nome} (${item.tipo})\n`; });
  msg += `\n*Total:* ${totalQtd} unidades`;
  msg += `\n*Valor estimado:* ${fmtBRL(total)}`;
  if (obsCliente) msg += `\n\n_Observações:_ ${obsCliente}`;
  msg += '\n\nPoderia confirmar disponibilidade e valor final? 😊';

  if (window.notificarTelegram) {
    window.notificarTelegram(`✅ *Pedido enviado via WhatsApp!*\n👤 Cliente: ${nome}\n📦 ${totalQtd} unidades\n💰 ${fmtBRL(total)}`);
  }
  window.open('https://wa.me/5547992745896?text=' + encodeURIComponent(msg), '_blank');
}

document.getElementById('qtdModal').addEventListener('click', function(e) {
  if (e.target === this) fecharQtdModal();
});

/* ── Carrinho abandonado ── */
window.addEventListener('pagehide', function () {
  const jaEnviou = sessionStorage.getItem('docesflor_pedido_enviado');
  if (carrinho.length > 0 && !jaEnviou && window.notificarTelegram) {
    const totalQtd = carrinho.reduce((s, i) => s + i.qtd, 0);
    const itens = carrinho.map(i => `${i.qtd}x ${i.nome}`).join(', ');
    window.notificarTelegram(`🛒 *Carrinho abandonado*\n📦 ${totalQtd} un — ${itens}`);
  }
});
