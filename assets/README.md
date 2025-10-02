# Assets - AD Jardim Márcia

Esta pasta contém todos os recursos visuais melhorados para o projeto AD Jardim Márcia.

## Logos

- **adbvelem1_refined.png** - Logo principal com fundo transparente (versão melhorada)
- **adbvelem2_refined.png** - Logo com fundo azul escuro e texto "AD. BELÉM • CAMPINAS" (versão melhorada)
- **adbvelem3_refined.png** - Logo alternativo com cores diferentes (versão melhorada)

## QR Codes

- **qr_code_oficial_1.png** - QR Code oficial para PIX com texto "SCAN ME"
- **qr_code_oficial_2.png** - QR Code oficial alternativo para PIX

### Informações do PIX
- **Chave PIX (CNPJ):** 44.595.304/0001-14
- **Observação:** JD MARCIA - SETOR 13
- **Descrição:** Contribua através do nosso PIX

## Uso no Projeto

Os arquivos desta pasta devem ser colocados na pasta `assets` do seu projeto. O arquivo `telao_corrigido.html` já está configurado para usar esses recursos automaticamente.

### Estrutura recomendada:
```
projeto/
├── assets/
│   ├── adbvelem1_refined.png
│   ├── adbvelem2_refined.png
│   ├── adbvelem3_refined.png
│   ├── qr_code_oficial_1.png
│   └── qr_code_oficial_2.png
└── telao_corrigido.html
```

## Melhorias Implementadas

### Logos
- Qualidade e nitidez aprimoradas
- Remoção de ruídos e imperfeições
- Manutenção das cores e design originais

### Telão HTML
- **Responsividade completa** - Adapta-se automaticamente a diferentes tamanhos de tela
- **Horário dinâmico** - Atualiza automaticamente a cada segundo
- **Logo correto** - Usa os logos melhorados com fallback automático
- **Posicionamento corrigido** - Elementos não se sobrepõem mais
- **Z-index otimizado** - Camadas organizadas corretamente
- **Unidades responsivas** - Uso de clamp(), vw, vh para melhor adaptação
- **Media queries aprimoradas** - Suporte para telas pequenas e grandes

