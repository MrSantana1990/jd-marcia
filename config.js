const CONFIG = {
    BACKEND_URL: 'https://jd-marcia-backend.onrender.com',
    // Usa o domínio atual para evitar hardcode ao mudar de site
    WEB_APP_URL: (typeof window !== 'undefined' ? window.location.origin : 'https://jd-marcia.netlify.app')
};

window.CONFIG = CONFIG;

