JD-MÁRCIA — PATCH DE INTEGRAÇÃO DE BACKEND (SEM MUDAR O VISUAL)

Arquivos incluídos:
- netlify.toml
- backend-config.js
- js/backend-config.js
- js/admin-backend-wire.js

COMO APLICAR
1) Copie tudo para a pasta do site: jd-marcia-netlify\
   (onde você roda `netlify dev`). Aceite substituir.
2) Remova/renomeie _redirects e _redirects.txt (se existirem).
3) No final do admin.html, mantenha APENAS nesta ordem:
   <script src="./backend-config.js"></script>
   <script src="./js/admin-backend-wire.js"></script>
4) Rode: netlify dev
5) Teste no navegador: http://localhost:8888/api/health  (deve retornar JSON)