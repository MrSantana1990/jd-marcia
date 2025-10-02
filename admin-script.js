/* admin-script.js
   Liga o painel admin aos endpoints do backend. Não altera estilos.
*/
(function () {
  const api = window?.BACKEND?.api;
  if (!api) { console.warn('[ADMIN] BACKEND.api não disponível.'); return; }

  const qs = (sel) => document.querySelector(sel);

  function getValueByNameOrId(name) {
    const byName = document.querySelector(`[name="${name}"]`);
    if (byName) return byName.value.trim();
    const byId = document.getElementById(name);
    return byId ? byId.value.trim() : '';
  }

  async function carregarAvisos() {
    const container = qs('#lista-avisos') || qs('.lista-avisos') || qs('#avisos');
    if (container) {
      container.innerHTML = '<div class="loading">Carregando avisos...</div>';
    }
    try {
      const itens = await api.listarAvisos();
      if (!container) return;
      if (!Array.isArray(itens) || itens.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhum aviso cadastrado.</div>';
        return;
      }
      const html = itens.map(a => {
        const t = a.titulo || '(sem título)';
        const msg = a.mensagem || '';
        const when = a.timestamp ? new Date(a.timestamp).toLocaleString('pt-BR') : '';
        return `<li class="aviso-item">
          <div class="aviso-cabec"><strong>${t}</strong> <small>${when}</small></div>
          <div class="aviso-msg">${msg}</div>
        </li>`;
      }).join('');
      // Se container for UL/OL, use <li>; se for DIV, encapsula.
      if (/^(UL|OL)$/i.test(container.tagName)) {
        container.innerHTML = html;
      } else {
        container.innerHTML = `<ul class="aviso-lista">${html}</ul>`;
      }
    } catch (e) {
      if (container) container.innerHTML = `<div class="erro">Falha ao carregar avisos: ${e.message || e}</div>`;
      console.error(e);
    }
  }

  async function publicarAviso(e) {
    if (e && e.preventDefault) e.preventDefault();
    const dados = {
      titulo: getValueByNameOrId('titulo'),
      mensagem: getValueByNameOrId('mensagem'),
      autor: getValueByNameOrId('autor') || 'Administrador',
      prioridade: getValueByNameOrId('prioridade') || 'Normal'
    };
    if (!dados.titulo || !dados.mensagem) {
      alert('Preencha Título e Mensagem para publicar.');
      return;
    }
    try {
      await api.criarAviso(dados);
      // Limpa campos conhecidos, se existirem
      ['titulo', 'mensagem', 'autor'].forEach(n => {
        const elByName = document.querySelector(`[name="${n}"]`);
        if (elByName) elByName.value = '';
        const elById = document.getElementById(n);
        if (elById) elById.value = '';
      });
      await carregarAvisos();
      alert('Aviso publicado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao publicar aviso: ' + (e.message || e));
    }
  }

  function ligarEventos() {
    const form = qs('#form-publicar-aviso');
    const btn = qs('#btn-publicar-aviso') || (form ? form.querySelector('[type="submit"]') : null);
    const btnAtualizar = qs('#btn-atualizar-avisos') || qs('#btnAtualizarAvisos');

    if (form) form.addEventListener('submit', publicarAviso);
    if (btn)  btn.addEventListener('click', publicarAviso);
    if (btnAtualizar) btnAtualizar.addEventListener('click', carregarAvisos);
  }

  function init() {
    ligarEventos();
    carregarAvisos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();