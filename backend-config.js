(function (window) {
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  ////const API_BASE = isLocal ? '/api' : 'https://jd-marcia-backend.onrender.com/api';
  const API_BASE = 'https://jd-marcia-backend.onrender.com/api';

  async function jfetch(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const text = await res.text();
    let data = null;
    try {
      console.log('response',text);
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(`HTTP ${res.status} @ ${path} -> ${text.slice(0, 120)}`);
    }
    console.log('res',res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
    return data;
  }

  const api = {
    health:      () => jfetch('/health'),
    getAvisos:   () => jfetch('/avisos'),
    addAviso:    (p) => jfetch('/avisos',    { method: 'POST', body: JSON.stringify(p) }),
    deleteAviso:   (id) => jfetch(`/avisos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    getLouvores: () => jfetch('/louvores'),
    addLouvor:   (p) => jfetch('/louvores',  { method: 'POST', body: JSON.stringify(p) }),
    deleteLouvor:  (id) => jfetch(`/louvores/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    getOracoes:  () => jfetch('/oracoes'),
    addOracao:   (p) => jfetch('/oracoes',   { method: 'POST', body: JSON.stringify(p) }),
    deleteOracao:  (id) => jfetch(`/oracoes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    getVisitantes: () => jfetch('/visitantes'),
    addVisitante:  (p) => jfetch('/visitantes', { method: 'POST', body: JSON.stringify(p) }),
    deleteVisitante: (id) => jfetch(`/visitantes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  };

  window.BACKEND_CONFIG = api;
  window.B = api;
})(window);
