(function (w) {
  const api = w.BACKEND_CONFIG || w.B;
  if (!api) {
    console.error('BACKEND: BACKEND_CONFIG não encontrado. Confira a ordem dos scripts.');
    return;
  }
  w.B = api;
  api.health().then(
    (h) => console.log('BACKEND OK /health ->', h),
    (e) => console.warn('BACKEND FALHOU /health ->', e && (e.message || e))
  );
})(window);