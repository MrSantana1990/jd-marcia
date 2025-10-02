
document.addEventListener("DOMContentLoaded",()=>{
  const role=localStorage.getItem("adm-role"); const loginBox=$("#login-box"); const panel=$("#panel"); const isLogged=!!role;
  if(isLogged){loginBox?.classList.add("hidden"); panel?.classList.remove("hidden");} else {panel?.classList.add("hidden"); loginBox?.classList.remove("hidden");}
  $("#form-login")?.addEventListener("submit",(e)=>{e.preventDefault();const tipo=$("#tipo").value;const senha=$("#senha").value.trim();if(senha==="123"){localStorage.setItem("adm-role",tipo);location.hash="#/dashboard";location.reload();} else {toast("Senha incorreta","warn");}});
  const roleSpan=$("#role-span"); if(roleSpan) roleSpan.textContent=localStorage.getItem("adm-role")||"Administrador";
});
