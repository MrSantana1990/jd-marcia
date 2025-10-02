
const Admin=(()=>{const set=(sel,val)=>{const el=$(sel); if(el) el.textContent=val;};
function loadKPIs(){Promise.all([API.louvores.list(),API.oracoes.list(),API.visitantes.list()]).then(([L,O,V])=>{const c=(obj)=>obj?.data?Object.keys(obj.data).length:0;set("#kpi-louvores",c(L));set("#kpi-oracoes",c(O));set("#kpi-visitantes",c(V));set("#kpi-docs",0);}).catch(()=>{set("#kpi-louvores",0);set("#kpi-oracoes",0);set("#kpi-visitantes",0);set("#kpi-docs",0);});}
function bindActions(){const form=$("#form-aviso");form?.addEventListener("submit",(e)=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());API.avisos.create({titulo:data.titulo,mensagem:data.mensagem,autor:data.autor,prioridade:data.prioridade||"Normal"}).then(()=>{toast("Aviso publicado!");form.reset();}).catch(()=>toast("Erro ao publicar","warn"));});$("#btn-sair")?.addEventListener("click",()=>{localStorage.removeItem("adm-role");location.href="/admin.html";});}
return{loadKPIs,bindActions};})();
document.addEventListener("DOMContentLoaded",()=>{Admin.loadKPIs();Admin.bindActions();});
