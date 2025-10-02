/* admin-manager.js
   Controla o carregamento das seções do admin usando o backend (window.B ou BACKEND_CONFIG).
*/
(function () {
  const api = window.B || window.BACKEND_CONFIG;
  if (!api) {
    console.warn('[ADMIN] API do backend não encontrada (window.B / BACKEND_CONFIG).');
  }

  const state = { cache: {}, expanded: {} };

  // Fallback local (quando o backend falhar)
  const LOCAL_KEYS = {
    avisos: 'ad_jardim_marcia_avisos',
    louvores: 'ad_jardim_marcia_louvores',
    oracoes: 'ad_jardim_marcia_oracoes',
    visitantes: 'ad_jardim_marcia_visitantes',
    documentos: 'ad_jardim_marcia_documentos'
  };
  function getLocal(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
  function setLocal(key, arr){ try { localStorage.setItem(key, JSON.stringify(arr)); } catch {} }
  function addLocal(type, item){ const k = LOCAL_KEYS[type]; if (!k) return; const arr = getLocal(k); item = { ...item }; item.id = item.id || (Date.now().toString(36)+Math.random().toString(36).slice(2)); item.timestamp = item.timestamp || new Date().toISOString(); arr.unshift(item); setLocal(k, arr); }
  function delLocal(type, id){ const k = LOCAL_KEYS[type]; if (!k) return; const arr = getLocal(k).filter(x => (x.id||x._id) !== id); setLocal(k, arr); }

  function qs(sel) { return document.querySelector(sel); }

  function setLoading(container, msg) {
    if (!container) return;
    container.innerHTML = `<div class="loading">${msg}</div>`;
  }

  function timeValue(item) {
    const keys = ['timestamp', 'data', 'data_da_visita'];
    for (const k of keys) {
      if (item && item[k]) {
        const t = Date.parse(item[k]);
        if (!Number.isNaN(t)) return t;
      }
    }
    return 0;
  }

  function renderLimitedList(container, allItems, mapItem, key) {
    if (!container) return;
    if (!Array.isArray(allItems) || allItems.length === 0) {
      container.innerHTML = '<div class="vazio">Nenhum registro encontrado.</div>';
      return;
    }
    const sorted = [...allItems].sort((a, b) => timeValue(b) - timeValue(a));
    const expanded = !!state.expanded[key];
    const toShow = expanded ? sorted : sorted.slice(0, 4);
    const admin = (function(){
      try {
        const saved = localStorage.getItem('admin_session');
        if (saved) { const s = JSON.parse(saved); if (s && s.userType === 'admin') return true; }
        if (window.adminAuth && window.adminAuth.getCurrentUser) {
          const u = window.adminAuth.getCurrentUser();
          if (u && (u.permissions?.includes('all'))) return true;
        }
      } catch {}
      return false;
    })();
    const html = toShow.map((item) => {
      const base = mapItem(item);
      if (!admin) return base;
      let rawId = '';
      try { if (item && typeof item === 'object') rawId = (item.id !== undefined ? item.id : (item._id !== undefined ? item._id : '')); } catch {}
      const id = (rawId && typeof rawId === 'object') ? (rawId.$oid || rawId.oid || rawId.id || '') : (rawId !== undefined ? String(rawId) : '');
      const del = id ? `<div class="data-actions" style="margin-top:8px;"><button class="btn-reject" data-action="delete" data-type="${key}" data-id="${id}">Apagar</button></div>` : '';
      return base.replace('</div>', `${del}</div>`);
    }).join('');
    const hasMore = sorted.length > 4;
    const toggleLabel = expanded ? '− Ver menos' : '+ Ver mais';
    const footer = hasMore ? `<div class="list-footer" style="margin-top:10px; text-align:center;">
        <button class="btn-secondary" style="padding:6px 10px; font-size:12px;" data-action="toggle-more" data-key="${key}">${toggleLabel}</button>
      </div>` : '';
    container.innerHTML = `<div class="data-list">${html}</div>${footer}`;
    container.querySelectorAll('[data-action="toggle-more"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.expanded[key] = !expanded;
        renderLimitedList(container, allItems, mapItem, key);
      });
    });
    container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async (ev) => {
        const isAdm = (function(){
          try { const s = localStorage.getItem('admin_session'); if (s) { const j = JSON.parse(s); if (j && j.userType === 'admin') return true; } } catch {}
          if (window.adminAuth && window.adminAuth.getCurrentUser) { const u = window.adminAuth.getCurrentUser(); if (u && (u.permissions?.includes('all'))) return true; }
          return false;
        })();
        if (!isAdm) { window.showMessage ? showMessage('Apenas administradores podem apagar', 'error') : alert('Apenas administradores podem apagar'); return; }
        const id = ev.currentTarget.getAttribute('data-id');
        const type = ev.currentTarget.getAttribute('data-type');
        if (!confirm('Deseja realmente apagar este registro?')) return;
        try {
          const api = window.B || window.BACKEND_CONFIG;
          const map = { avisos: 'deleteAviso', louvores: 'deleteLouvor', oracoes: 'deleteOracao', visitantes: 'deleteVisitante', documentos: null };
          const fn = map[type];
          if (api && fn && typeof api[fn] === 'function') {
            await api[fn](id);
          } else {
            const localKey = { avisos: 'ad_jardim_marcia_avisos', louvores: 'ad_jardim_marcia_louvores', oracoes: 'ad_jardim_marcia_oracoes', visitantes: 'ad_jardim_marcia_visitantes', documentos: 'ad_jardim_marcia_documentos' }[type];
            if (localKey) {
              const arr = JSON.parse(localStorage.getItem(localKey) || '[]');
              localStorage.setItem(localKey, JSON.stringify(arr.filter(x => x.id !== id)));
            }
          }
          window.showMessage ? showMessage('Registro apagado', 'success') : null;
          await (window.adminManager && window.adminManager.refreshData ? window.adminManager.refreshData() : Promise.resolve());
        } catch (e) {
          console.error(e);
          // Fallback: remover localmente
          try {
            const localKey = { avisos: 'ad_jardim_marcia_avisos', louvores: 'ad_jardim_marcia_louvores', oracoes: 'ad_jardim_marcia_oracoes', visitantes: 'ad_jardim_marcia_visitantes', documentos: 'ad_jardim_marcia_documentos' }[type];
            if (localKey) {
              const arr = JSON.parse(localStorage.getItem(localKey) || '[]');
              localStorage.setItem(localKey, JSON.stringify(arr.filter(x => (x.id||x._id) !== id)));
            }
          } catch {}
          window.showMessage ? showMessage('Sem conexão. Remoção local aplicada.', 'warning') : alert('Sem conexão. Remoção local aplicada.');
          await (window.adminManager && window.adminManager.refreshData ? window.adminManager.refreshData() : Promise.resolve());
        }
      });
    });
  }

  function fmtDate(v) {
    try {
      if (!v) return '';
      const d = new Date(v);
      if (isNaN(d)) return '';
      return d.toLocaleString('pt-BR');
    } catch { return ''; }
  }

  function unwrapList(resp) {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray(resp.data)) return resp.data;
    if (resp && resp.items && Array.isArray(resp.items)) return resp.items;
    return [];
  }

  async function loadLouvores() {
    const c = qs('#louvores-list');
    setLoading(c, 'Carregando pedidos de louvor...');
    try {
      const dataRaw = api ? await api.getLouvores() : (JSON.parse(localStorage.getItem('ad_jardim_marcia_louvores')||'[]'));
      const data = unwrapList(dataRaw);
      state.cache.louvores = data;
      renderLimitedList(c, data, (l) => {
        const nome = l.nome || l.cantor || 'Anônimo';
        const musica = l.musica || l.música || '-';
        const yt = l.linkYouTube || l.youtubeLink || '';
        const obs = l.observacoes || l.observações || '';
        const when = fmtDate(l.data || l.timestamp);
        return `<div class="data-item">
          <div class="data-header"><div class="data-title">${nome} - ${musica}</div><div class="data-meta"><span>${when}</span></div></div>
          ${yt ? `<div class="data-content"><a href="${yt}" target="_blank">YouTube</a></div>` : ''}
          ${obs ? `<div class="data-content">${obs}</div>` : ''}
        </div>`;
      }, 'louvores');
    } catch (e) {
      c && (c.innerHTML = `<div class="error">Erro ao carregar louvores: ${e.message || e}</div>`);
    }
  }

  async function loadOracoes() {
    const c = qs('#oracoes-list');
    setLoading(c, 'Carregando pedidos de oração...');
    try {
      const dataRaw = api ? await api.getOracoes() : (JSON.parse(localStorage.getItem('ad_jardim_marcia_oracoes')||'[]'));
      const data = unwrapList(dataRaw);
      state.cache.oracoes = data;
      renderLimitedList(c, data, (o) => {
        const nome = o.nome || 'Anônimo';
        const pedido = o.pedido || o.motivo || '';
        const reservado = (o.reservado === true || o.reservado === 'Sim') ? 'Reservado' : '';
        const when = fmtDate(o.data || o.timestamp);
        return `<div class="data-item ${reservado?'urgent':''}">
          <div class="data-header"><div class="data-title">${nome}</div><div class="data-meta"><span>${when}</span> ${reservado?`<span class="status-badge status-orando">Reservado</span>`:''}</div></div>
          <div class="data-content">${pedido}</div>
        </div>`;
      }, 'oracoes');
    } catch (e) {
      c && (c.innerHTML = `<div class="error">Erro ao carregar orações: ${e.message || e}</div>`);
    }
  }

  async function loadVisitantes() {
    const c = qs('#visitantes-list');
    setLoading(c, 'Carregando visitantes...');
    try {
      const dataRaw = api ? await api.getVisitantes() : (JSON.parse(localStorage.getItem('ad_jardim_marcia_visitantes')||'[]'));
      const data = unwrapList(dataRaw);
      state.cache.visitantes = data;
      renderLimitedList(c, data, (v) => {
        const nome = v.nome || 'Sem nome';
        const tel = v.telefone || v.celular || '';
        const end = v.endereco || v.endereço || '';
        const conheceu = v.comoConheceu || '';
        const when = fmtDate(v.data || v.data_da_visita || v.timestamp);
        return `<div class="data-item">
          <div class="data-header"><div class="data-title">${nome}</div><div class="data-meta"><span>${tel}</span><span>${when}</span></div></div>
          ${end ? `<div class="data-content">${end}</div>` : ''}
          ${conheceu ? `<div class="data-content">Como conheceu: ${conheceu}</div>` : ''}
        </div>`;
      }, 'visitantes');
    } catch (e) {
      c && (c.innerHTML = `<div class="error">Erro ao carregar visitantes: ${e.message || e}</div>`);
    }
  }

  async function loadDocumentos() {
    const c = qs('#documentos-list');
    setLoading(c, 'Carregando documentos...');
    try {
      // Sem endpoint no backend-config atual: usar localStorage como fallback
      const data = JSON.parse(localStorage.getItem('ad_jardim_marcia_documentos')||'[]');
      state.cache.documentos = data;
      renderLimitedList(c, data, (d) => {
        const nome = d.nome || 'Solicitante';
        const tipo = d.tipo || d.finalidade || '';
        const obs = d.observacoes || '';
        const status = d.status || 'Solicitado';
        const when = fmtDate(d.data || d.data_da_solicitacao || d.timestamp);
        return `<div class="data-item">
          <div class="data-header"><div class="data-title">${nome}</div><div class="data-meta"><span>${tipo}</span><span class="status-badge status-novo">${status}</span><span>${when}</span></div></div>
          ${obs ? `<div class="data-content">${obs}</div>` : ''}
        </div>`;
      }, 'documentos');
    } catch (e) {
      c && (c.innerHTML = `<div class="error">Erro ao carregar documentos: ${e.message || e}</div>`);
    }
  }

  async function loadAvisos() {
    const c = qs('#avisos-list');
    setLoading(c, 'Carregando avisos...');
    try {
      const dataRaw = api ? await api.getAvisos() : (JSON.parse(localStorage.getItem('ad_jardim_marcia_avisos')||'[]'));
      const data = unwrapList(dataRaw);
      state.cache.avisos = data;
      renderLimitedList(c, data, (a) => {
        const t = a.titulo || '(sem título)';
        const msg = a.mensagem || a.conteudo || '';
        const autor = a.autor || 'Administração';
        const when = fmtDate(a.data || a.timestamp);
        return `<div class="data-item">
          <div class="data-header"><div class="data-title">${t}</div><div class="data-meta"><span>${autor}</span><span>${when}</span></div></div>
          <div class="data-content">${msg}</div>
        </div>`;
      }, 'avisos');
    } catch (e) {
      // Fallback local quando backend falhar
      const locais = (function(){ try { return JSON.parse(localStorage.getItem('ad_jardim_marcia_avisos')||'[]'); } catch { return []; } })();
      state.cache.avisos = locais;
      renderLimitedList(c, locais, (a) => {
        const t = a.titulo || '(sem título)';
        const msg = a.mensagem || a.conteudo || '';
        const autor = a.autor || 'Administração';
        const when = fmtDate(a.data || a.timestamp);
        return `<div class="data-item">
          <div class="data-header"><div class="data-title">${t}</div><div class="data-meta"><span>${autor}</span><span>${when}</span></div></div>
          <div class="data-content">${msg}</div>
        </div>`;
      }, 'avisos');
    }
  }

  function activeSectionId() {
    const el = document.querySelector('.admin-section.active');
    return el ? el.id : null;
  }

  async function loadSectionData(section) {
    switch (section) {
      case 'louvores':   return loadLouvores();
      case 'oracoes':    return loadOracoes();
      case 'visitantes': return loadVisitantes();
      case 'documentos': return loadDocumentos();
      case 'avisos':     return loadAvisos();
      default: return;
    }
  }

  async function refreshData() {
    const id = activeSectionId();
    if (id) return loadSectionData(id);
  }

  function exportSection(type) {
    const data = state.cache[type] || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `export-${type}-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function showAddAvisoForm() { const el = qs('#add-aviso-form'); if (el) el.style.display = 'block'; }
  function hideAddAvisoForm() { const el = qs('#add-aviso-form'); if (el) el.style.display = 'none'; }

  function bindAvisoForm() {
    const form = qs('#aviso-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        titulo: fd.get('titulo') || '',
        mensagem: fd.get('conteudo') || '',
        autor: fd.get('autor') || 'Administração',
        prioridade: fd.get('prioridade') || 'Normal'
      };
      if (!payload.titulo || !payload.mensagem) {
        window.showMessage ? showMessage('Preencha título e conteúdo', 'error') : alert('Preencha título e conteúdo');
        return;
      }
      try {
        if (!api || !api.addAviso) throw new Error('Backend não disponível');
        await api.addAviso(payload);
        form.reset();
        hideAddAvisoForm();
        await loadAvisos();
        window.showMessage ? showMessage('Aviso publicado!', 'success') : alert('Aviso publicado!');
      } catch (e2) {
        console.error(e2);
        // Fallback: salva localmente quando o backend estiver indisponível
        try { 
          const item = { ...payload, timestamp: new Date().toISOString() };
          const arr = JSON.parse(localStorage.getItem('ad_jardim_marcia_avisos')||'[]');
          arr.unshift(item);
          localStorage.setItem('ad_jardim_marcia_avisos', JSON.stringify(arr));
        } catch {}
        await loadAvisos();
        window.showMessage ? showMessage('Sem conexão. Aviso salvo localmente.', 'warning') : alert('Sem conexão. Aviso salvo localmente.');
      }
    });
  }

  function init() {
    bindAvisoForm();
  }

  // Expor globalmente para o admin.html
  window.adminManager = { loadSectionData, refreshData, exportSection, showAddAvisoForm, hideAddAvisoForm };
  // Compatibilidade com os handlers inline no HTML
  window.refreshData = refreshData;
  window.exportSection = exportSection;
  window.showAddAvisoForm = showAddAvisoForm;
  window.hideAddAvisoForm = hideAddAvisoForm;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
