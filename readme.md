# AD Jardim Márcia - Site Melhorado

Este é o site melhorado da AD Jardim Márcia com design modernizado e integração com o novo backend Flask.

## Melhorias Implementadas

### 1. Design e Layout
- ✅ **Menu melhorado**: Navegação com melhor contraste e visibilidade em fundo branco
- ✅ **Botão de oração destacado**: Seção de ação rápida na página inicial para enviar pedidos de oração
- ✅ **Design modernizado**: Gradientes, sombras, animações e tipografia melhorada
- ✅ **Responsividade**: Layout otimizado para desktop e mobile

### 2. Telão de Transmissão
- ✅ **Layout reorganizado**: Design profissional com melhor organização visual
- ✅ **Animações suaves**: Transições e efeitos visuais melhorados
- ✅ **Controles intuitivos**: Botões de navegação e atualização melhorados
- ✅ **PIX melhorado**: Layout em grid com informações organizadas

### 3. Funcionalidades
- ✅ **Formulários corrigidos**: Campos com nomes corretos para integração com o backend
- ✅ **Validação em tempo real**: Feedback visual para campos obrigatórios
- ✅ **Notificações toast**: Sistema de notificações melhorado
- ✅ **Auto-refresh**: Atualização automática dos avisos

## Estrutura de Arquivos

```
jd-marcia-melhorado/
├── index.html              # Página principal melhorada
├── style-melhorado.css     # Estilos modernizados
├── script-melhorado.js     # JavaScript com integração ao novo backend
├── telao.html              # Telão de transmissão melhorado
├── config.js               # Configuração do backend
├── backend-config.js       # Configuração da API
├── admin.html              # Painel administrativo (original)
├── admin_completo.html     # Painel administrativo completo (original)
├── icons/                  # Ícones do PWA
├── qr_codes/              # QR Codes do PIX
└── README.md              # Esta documentação
```

## Configuração do Backend

### 1. Variáveis de Ambiente (Render)

Configure as seguintes variáveis no seu serviço Render:

```bash
PYTHON_VERSION=3.11.9
SHEETS_ID=1VCzpN_lkaeX8C8wIk77Nw4_YFjgnuXrL3Zle19q0Yig
GOOGLE_CREDENTIALS_JSON=<COLAR o JSON COMPLETO da service account>
ALLOWED_ORIGINS=https://jd-marcia.netlify.app,http://localhost:8888,http://127.0.0.1:8888
```

### 2. Atualizar URL do Backend

No arquivo `config.js`, substitua a URL do backend pela URL do seu serviço no Render:

```javascript
const CONFIG = {
    BACKEND_URL: 'https://seu-backend-render.onrender.com', // Substitua pela URL real
    WEB_APP_URL: 'https://jd-marcia.netlify.app'
};
```

## Endpoints da API

O backend Flask fornece os seguintes endpoints:

- `GET /api/health` - Verificação de saúde do sistema
- `GET/POST /api/avisos` - Gerenciar avisos
- `GET/POST /api/louvores` - Gerenciar pedidos de louvor
- `GET/POST /api/oracoes` - Gerenciar pedidos de oração
- `GET/POST /api/visitantes` - Gerenciar cadastro de visitantes

## Mapeamento de Campos

### Louvores
- `nome` - Nome do cantor/grupo
- `musica` - Nome da música
- `artista` - Artista
- `linkYouTube` - Link do YouTube
- `observacoes` - Observações

### Orações
- `nome` - Nome da pessoa (opcional)
- `pedido` - Pedido de oração
- `reservado` - "Sim" ou "Não"

### Visitantes
- `nome` - Nome completo
- `telefone` - Telefone/WhatsApp
- `email` - E-mail (opcional)
- `endereco` - Endereço (opcional)
- `comoConheceu` - Como conheceu a igreja

## Funcionalidades Especiais

### 1. Botão de Ação Rápida para Oração
- Localizado na página inicial
- Destaque visual com animação
- Navegação direta para a seção de orações

### 2. Telão de Transmissão
- Controles de teclado (1=Avisos, 2=PIX, R=Atualizar)
- Fullscreen automático
- Auto-refresh a cada 30 segundos
- Layout responsivo

### 3. Sistema de Notificações
- Toast notifications para feedback
- Diferentes tipos: success, error, warning, info
- Animações suaves

### 4. Validação de Formulários
- Validação em tempo real
- Feedback visual nos campos
- Mensagens de erro claras

## Deploy

### Frontend (Netlify)
1. Faça upload dos arquivos para o Netlify
2. Configure o domínio personalizado se necessário
3. Atualize a URL no `config.js`

### Backend (Render)
1. Faça deploy do código Flask no Render
2. Configure as variáveis de ambiente
3. Atualize a URL do backend no frontend

## Suporte

Para dúvidas ou problemas:
1. Verifique se o backend está funcionando (`/api/health`)
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique o console do navegador para erros JavaScript
4. Teste a conectividade entre frontend e backend

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Python Flask
- **Banco de Dados**: Google Sheets (via gspread)
- **Deploy**: Netlify (frontend) + Render (backend)
- **PWA**: Service Worker, Web App Manifest

