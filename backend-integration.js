/* backend-integration.js
   Inicialização leve do backend (checa saúde e fornece utilitários).
*/
(function () {
  const api = window?.BACKEND?.api;
  if (!api) { console.warn('[BACKEND] api não encontrada. Inclua backend-config.js antes.'); return; }

  async function checkBackend() {
    try {
      const res = await api.health();
      window.BACKEND.online = true;
      console.log('[BACKEND] OK', res);
      return true;
    } catch (e) {
      window.BACKEND.online = false;
      console.warn('[BACKEND] Offline', e.message || e);
      return false;
    }
  }

  // Exponha no global para outros scripts
  window.BACKEND.check = checkBackend;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkBackend());
  } else {
    checkBackend();
  }
})();