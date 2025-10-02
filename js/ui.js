
const $=(s,el=document)=>el.querySelector(s); const $$=(s,el=document)=>Array.from(el.querySelectorAll(s));
function toast(msg,kind="ok"){let t=document.createElement("div");t.className="toast";
Object.assign(t.style,{position:"fixed",right:"18px",top:"18px",zIndex:9999,padding:"12px 14px",borderRadius:"10px",color:"#fff",fontWeight:"800",boxShadow:"0 10px 24px rgba(16,24,40,.18)",background:kind==="warn"?"linear-gradient(180deg,#f59e0b,#ea580c)":"linear-gradient(180deg,#22c55e,#16a34a)"});
t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),4200)}
function copyToClipboard(text){navigator.clipboard.writeText(text).then(()=>toast("Copiado!","ok")).catch(()=>toast("Falha ao copiar","warn"))}
