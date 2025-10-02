(function(){
  const board = document.getElementById('board');
  const clock = document.getElementById('clock');
  function tick(){ const d=new Date(); clock.textContent = d.toLocaleString('pt-BR',{weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'}); }
  setInterval(tick, 1000); tick();

  async function load(){
    if(location.hash==="#pix"){
      board.innerHTML = `<div class="qr" style="align-items:center">
        <img src="assets/qr_code_oficial_2.png" alt="QR Code PIX"/>
        <div><div style="font-weight:700; letter-spacing:1px; text-transform:uppercase">Ofertas e Dízimos</div><h2 style="margin-top:6px">Aponte a câmera para contribuir</h2></div>
      </div>`;
      return;
    }
    try{
      const res = await API.getAvisos();
      const items = res?.data||[];
      board.innerHTML = items.length? items.map(a=>`<div style="padding:16px;border-bottom:1px solid #ffffff33">
        <div style="font-size:20px;font-weight:700">${a.titulo||''}</div>
        <div style="opacity:.8">${a.timestamp||''} · ${a.autor||''}</div>
        <div style="margin-top:8px">${a.mensagem||a.msg||''}</div>
      </div>`).join(''): '<div style="opacity:.8">Sem avisos no momento.</div>';
    }catch{
      board.innerHTML = '<div style="opacity:.8">Erro ao carregar avisos.</div>';
    }
  }
  window.addEventListener('hashchange', load); load();
})();