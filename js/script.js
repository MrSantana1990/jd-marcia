
document.addEventListener("DOMContentLoaded",()=>{
  $$("#link-instagram").forEach(a=>a.href=SiteConfig.instagram);
  $$("#link-area-membro").forEach(a=>a.href=SiteConfig.areaMembro);
  const links=$$(".nav a");
  function setActive(){const h=location.hash||"#inicio";links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===h));const fab=$(".fab");if(fab) fab.classList.toggle("hidden",h!=="#inicio");}
  window.addEventListener("hashchange",setActive); setActive();
  const agendaEl=$("#agenda-list"); if(agendaEl){ agendaEl.innerHTML = SiteConfig.agenda.map(ev=>`<li><strong>${ev.dia}:</strong> ${ev.titulo}${ev.hora?" - "+ev.hora:""}</li>`).join(""); }
  const pixKey=$("#pix-key"); const pixObs=$("#pix-obs"); if(pixKey) pixKey.value=SiteConfig.pix.chave; if(pixObs) pixObs.value=SiteConfig.pix.observacao;
  $$("#copy-pix").forEach(btn=>btn.addEventListener("click",()=>copyToClipboard(SiteConfig.pix.chave)));
  $$("#copy-obs").forEach(btn=>btn.addEventListener("click",()=>copyToClipboard(SiteConfig.pix.observacao)));
  const mural=$("#mural"); if(mural){ API.avisos.list().then(res=>{ if(!res?.data?.length){mural.innerHTML=`<p class="muted">Nenhum aviso publicado ainda.</p>`;return;} mural.innerHTML=res.data.map(a=>`<div class="card" style="margin:8px 0"><div class="badge">📣 <b>${a.titulo||"Aviso"}</b> <span class="muted">• ${new Date(a.timestamp||Date.now()).toLocaleString()}</span></div><p style="margin:8px 0 0 0">${a.mensagem||""}</p></div>`).join(""); }).catch(()=>{toast("Erro de conexão. Usando dados locais.","warn"); mural.innerHTML=`<p class="muted">Sem conexão agora.</p>`;}); }
  function serialize(form){return Object.fromEntries(new FormData(form).entries());}
  $$("#form-louvor,#form-oracao,#form-visitante").forEach(form=>{form?.addEventListener("submit",(e)=>{e.preventDefault();const data=serialize(form);const id=form.id;
    if(id==="form-louvor"){API.louvores.create({nome:data.nome,musica:data.musica,artista:data.artista,linkYouTube:data.link,observacoes:data.obs,status:"Pendente"}).then(()=>toast("Pedido de louvor enviado!")).catch(()=>toast("Erro ao enviar","warn"));}
    else if(id==="form-oracao"){API.oracoes.create({nome:data.nome,pedido:data.pedido,reservado:data.reservado,status:"Pendente"}).then(()=>toast("Pedido de oração enviado!")).catch(()=>toast("Erro ao enviar","warn"));}
    else if(id==="form-visitante"){API.visitantes.create({nome:data.nome,telefone:data.telefone,email:data.email,endereco:data.endereco,comoConheceu:data.comoConheceu,status:"Novo"}).then(()=>toast("Cadastro de visitante enviado!")).catch(()=>toast("Erro ao enviar","warn"));}
    form.reset();});});
});
