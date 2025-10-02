
const API = (()=>{
  const B = () => (window.SiteConfig?.baseURL || "").replace(/\/+$/,"");
  const json = (r) => r.ok ? r.json() : Promise.reject(new Error(r.statusText || "HTTP"));
  const get = (p) => fetch(`${B()}${p}`, {mode:"cors"}).then(json);
  const post = (p, body) => fetch(`${B()}${p}`, {method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body: JSON.stringify(body)}).then(json);
  async function safe(fn, fallback){ try { return await fn(); } catch(e){ console.warn("API fallback:", e); return fallback; } }
  return {
    health: () => safe(()=>get("/api/health"), {status:"OFFLINE"}),
    avisos: { list: () => safe(()=>get("/api/avisos"), {data:[]}), create: (av) => post("/api/avisos", av) },
    louvores: { list: () => safe(()=>get("/api/louvores"), {data:{}}), create: (l) => post("/api/louvores", l) },
    oracoes: { list: () => safe(()=>get("/api/oracoes"), {data:{}}), create: (o) => post("/api/oracoes", o) },
    visitantes:{ list: () => safe(()=>get("/api/visitantes"), {data:{}}), create: (v) => post("/api/visitantes", v) }
  };
})();
