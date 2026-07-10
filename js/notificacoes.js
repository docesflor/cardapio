/* ═══════════════════════════════════════════
   NOTIFICAÇÕES TELEGRAM — cardápio
   Depende de: firebase-config.js (já carregado antes no <head>)
═══════════════════════════════════════════ */
  (function() {
    const BOT_TOKEN = '8673405432:AAH9AGF4vKrW_5eXblcodFy3mbS5u6bL0JM';
    const CHAT_IDS = ['6374174682'];

  // ── Filtro de bots/crawlers ──
  const BOT_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|googlebot|bingbot|semrush|ahrefs|mj12bot|petalbot|discordbot|linkedinbot|preview/i;
  if (BOT_REGEX.test(navigator.userAgent)) return; // não faz nada se for bot

  const agora = new Date();
  const agoraFmt = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const hojeISO = agora.toISOString().slice(0, 10); // AAAA-MM-DD

  // ── Dispositivo / navegador / origem ──
  const ua = navigator.userAgent;
  let dispositivo = '💻 Desktop';
  if (/iPhone/i.test(ua)) dispositivo = '📱 iPhone';
  else if (/Android/i.test(ua)) dispositivo = '📱 Android';
  else if (/iPad/i.test(ua)) dispositivo = '📱 iPad';

  let navegador = 'Outro';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) navegador = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) navegador = 'Safari';
  else if (/Firefox/i.test(ua)) navegador = 'Firefox';
  else if (/Edg/i.test(ua)) navegador = 'Edge';
  else if (/Instagram/i.test(ua)) navegador = 'Instagram (in-app)';
  else if (/WhatsApp/i.test(ua)) navegador = 'WhatsApp (in-app)';

  let origem = 'Acesso direto / desconhecido';
  if (document.referrer) {
    try { origem = new URL(document.referrer).hostname; } catch (e) {}
  }

  // ── Envio genérico ao Telegram (com Markdown) ──
  function enviarTelegram(mensagem) {
    CHAT_IDS.forEach(chatId => {
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: mensagem, parse_mode: 'Markdown' })
      }).catch(err => console.log('Erro notificação Telegram:', err));
    });
  }

  // ── Novo visitante vs recorrente ──
  let primeiraVisita = false;
  let visitanteId = localStorage.getItem('docesflor_visitante_id');
  if (!visitanteId) {
    visitanteId = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('docesflor_visitante_id', visitanteId);
    localStorage.setItem('docesflor_primeira_visita', agora.toISOString());
    primeiraVisita = true;
  }

  // ── Dedup de sessão removida: todo acesso notifica ──
  sessionStorage.setItem('docesflor_hora_entrada', agora.getTime().toString());

  // ── Contador do dia via Firebase RTDB ──
  function contarEnviar(localizacao) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG, 'notifApp');
      const app = firebase.apps.find(a => a.name === 'notifApp') || firebase.app();
      const ref = app.database().ref('stats/acessos/' + hojeISO);
      ref.transaction(v => (v || 0) + 1).then(res => {
        const contagem = res.snapshot.val();
        montarEEnviar(localizacao, contagem);
      }).catch(() => montarEEnviar(localizacao, null));
    } catch (e) {
      montarEEnviar(localizacao, null);
    }
  }

  function montarEEnviar(localizacao, contagem) {
    const tag = primeiraVisita ? '🆕 *Novo visitante*' : '🔁 *Visitante recorrente*';
    let msg = `🍬 *Novo acesso ao cardápio!*\n`;
    msg += `${tag}\n`;
    msg += `🕐 ${agoraFmt}\n`;
    msg += `📄 Página: ${window.location.pathname}\n`;
    msg += `${dispositivo} • ${navegador}\n`;
    msg += `🔗 Veio de: ${origem}\n`;
    msg += `📍 Local: ${localizacao}`;
    if (contagem) msg += `\n📊 Esse é o *${contagem}º* acesso hoje`;
    enviarTelegram(msg);
  }

  // ── Geolocalização por IP (timeout 2s) ──
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  fetch('https://ipapi.co/json/', { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      clearTimeout(timeout);
      if (!data || data.error) throw new Error('ipapi falhou');
      contarEnviar(`${data.city || '?'}, ${data.region || '?'} (${data.country_name || '?'})`);
    })
    .catch(() => {
      // Fallback: tenta um segundo serviço
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 2000);
      fetch('https://ipwho.is/', { signal: controller2.signal })
        .then(res => res.json())
        .then(data => {
          clearTimeout(timeout2);
          contarEnviar(`${data.city || '?'}, ${data.region || '?'} (${data.country || '?'})`);
        })
        .catch(() => {
          clearTimeout(timeout2);
          clearTimeout(timeout);
          contarEnviar('Não foi possível obter');
        });
    });

  // ── Tempo de permanência (ao sair/fechar) ──
  let jaSaiu = false;
  function notificarSaida() {
    if (jaSaiu) return;
    jaSaiu = true;
    const inicio = parseInt(sessionStorage.getItem('docesflor_hora_entrada') || agora.getTime());
    const segundos = Math.round((Date.now() - inicio) / 1000);
    if (segundos < 5) return; // ignora saídas instantâneas
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    const tempoFmt = min > 0 ? `${min}min ${seg}s` : `${seg}s`;
    enviarTelegram(`⏱️ *Visitante saiu do cardápio*\n🕐 Ficou navegando: ${tempoFmt}`);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') notificarSaida();
  });
  window.addEventListener('pagehide', notificarSaida);

  // Expõe função pro carrinho.js usar (clique WhatsApp / abandono)
  window.notificarTelegram = enviarTelegram;
})();
