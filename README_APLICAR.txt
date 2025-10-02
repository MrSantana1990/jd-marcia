HOTFIX – Backend funcional sem alterar o visual
===============================================

O que tem aqui
--------------
1) js/backend-config.js
   - Única fonte de verdade do backend (window.B).
   - Usa '/api' no localhost (proxy do Netlify Dev) e domínio Render em produção.

2) js/admin-backend-wire.js
   - Camada de compatibilidade para o admin atual que chama B.getLouvores(), B.getAvisos(), etc.

3) netlify.toml
   - Redirecionamento /api/* para o Render colocado ANTES do catch‑all.
   - Mantém /admin, /telao e /*.

Como aplicar (passo a passo)
----------------------------
1) Copie os dois arquivos para a pasta:
   jd-marcia-netlify/js/
   (substitua se perguntar)

2) Garanta a ORDEM dos scripts:

   2.1) Em **admin.html**, antes do `admin-script.js`, deixe assim:
        <script src="js/backend-config.js"></script>
        <script src="js/admin-backend-wire.js"></script>
        <script src="js/admin-script.js"></script>

        *Remova* QUALQUER inclusão de `backend-integration.js` ou outro que também defina B/BACKEND_CONFIG.

   2.2) Em **index.html** (no <head> ou logo antes dos scripts do site):
        <script src="js/backend-config.js" defer></script>
        (não precisa incluir admin-backend-wire no index)

3) Substitua o **netlify.toml** do projeto por este ou mova o bloco /api/* para o topo.
   O catch‑all `/* -> /index.html` DEVE ficar por último.

4) Reinicie o servidor local:
   - Pare o que estiver rodando
   - Rode:  netlify dev

5) Testes rápidos
   - Abra http://localhost:8888/api/health  → deve retornar JSON.
   - Abra o admin e clique em "Atualizar" nas seções → dados devem carregar.
   - No index e telão, os avisos devem aparecer sem o alerta "Erro de conexão".

Se ainda travar no "Carregando..."
----------------------------------
- Abra o DevTools (F12) → aba **Network** → clique no botão "Atualizar".
- Verifique se /api/alguma_coisa está vindo com **200**.  
  Se for **200** e o erro for "Unexpected token '<'", o catch‑all ainda está pegando /api (ordem errada).
- Verifique também se não há *dois arquivos* diferentes definindo `window.B` (remova duplicados).