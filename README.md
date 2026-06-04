# Canva Apps SDK — Guia em Português para Configuração, Integração e Uso em Projetos Criativos

> Versão traduzida, adaptada e expandida do README original do **Canva Apps SDK starter kit**.
> Este guia foi reorganizado para uso prático em projetos de design, apresentações, Brand Kits, templates, assets, automações e agentes IDE.

---

## 1. Visão geral

O **Canva Apps SDK starter kit** é um kit inicial para desenvolver aplicativos dentro do ecossistema do Canva. Ele permite criar apps que aparecem no painel lateral do editor do Canva e podem interagir com designs, elementos, imagens, textos, assets e fluxos de publicação.

Na prática, este starter kit serve para criar ferramentas como:

- painel interno para inserir assets padronizados em apresentações;
- conector de dados para alimentar tabelas, cards ou templates;
- gerador de layouts com IA;
- app para aplicar componentes de Brand Kit;
- app para publicar ou organizar conteúdos;
- integração com backend próprio para buscar dados em Google Sheets, Supabase, Firebase, n8n, Make.com ou APIs externas;
- assistente visual para projetos como guias editoriais, apresentações comerciais e sistemas de templates.

A documentação oficial completa fica em:

- https://www.canva.dev/docs/apps/

---

## 2. Pré-requisitos técnicos

O projeto original exige:

```bash
Node.js v24
npm v11
```

Recomendação prática: use `nvm` para evitar conflito com outros projetos.

### Instalar ou atualizar o nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Depois, reinicie o terminal ou rode:

```bash
source ~/.zshrc
```

### Instalar a versão correta do Node

Dentro da pasta do projeto:

```bash
nvm install
nvm use
node -v
npm -v
```

O arquivo `.nvmrc` do starter kit define a versão correta do Node para o projeto.

---

## 3. Instalação rápida do starter kit

```bash
git clone git@github.com:canva-sdks/canva-apps-sdk-starter-kit.git
cd canva-apps-sdk-starter-kit
npm install
```

Se você não usa SSH no GitHub, use HTTPS:

```bash
git clone https://github.com/canva-sdks/canva-apps-sdk-starter-kit.git
cd canva-apps-sdk-starter-kit
npm install
```

---

## 4. Estrutura básica do projeto

A pasta principal para editar o app é:

```txt
src/
└── app.tsx
```

O arquivo mais importante no início é:

```txt
src/app.tsx
```

É nele que você altera a interface e o comportamento inicial do app exibido dentro do Canva.

Estrutura típica:

```txt
canva-apps-sdk-starter-kit/
├── src/
│   └── app.tsx
├── examples/
├── package.json
├── .env
├── .nvmrc
└── README.md
```

---

## 5. Rodando o app localmente

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

O bundle local ficará disponível em:

```txt
http://localhost:8080
```

Atenção: você não visualiza o app apenas abrindo essa URL no navegador. O app precisa ser aberto dentro do editor do Canva, via Developer Portal.

---

## 6. Criando o app no Canva Developer Portal

1. Acesse o Developer Portal:
   - https://www.canva.com/developers/apps
2. Crie um novo app.
3. Vá em **App source**.
4. Escolha **Development URL**.
5. Insira:

```txt
http://localhost:8080
```

6. Clique em **Preview**.
7. O Canva abrirá o editor em uma nova aba.
8. Clique em **Open** para carregar o app no painel lateral.

---

## 7. Ativando Hot Module Replacement — HMR

O HMR permite ver alterações no app sem recarregar tudo manualmente.

### Passos

1. Acesse o app no Developer Portal.
2. Vá em:

```txt
Security > Credentials > .env file
```

3. Copie o conteúdo do `.env` gerado pelo Canva.
4. Cole no arquivo `.env` local do projeto.

Exemplo:

```env
CANVA_APP_ORIGIN=https://app-aabbccddeeff.canva-apps.com
CANVA_HMR_ENABLED=true
```

5. Reinicie o servidor:

```bash
npm start
```

6. Recarregue o app no Canva uma vez para o HMR entrar em efeito.

Observação crítica: HMR não funciona quando o servidor roda dentro de Docker.

---

## 8. Preview no Safari

O Safari bloqueia scripts carregados por HTTP dentro de páginas HTTPS. Como o Canva roda em HTTPS, o servidor local também precisa rodar em HTTPS para testes no Safari.

### Rodar com HTTPS

```bash
npm start --use-https
```

Para exemplos específicos:

```bash
npm start <example_name> --use-https
```

Depois acesse:

```txt
https://localhost:8080
```

Aceite o aviso de certificado inválido:

1. Clique em **Show details**.
2. Clique em **Visit website**.
3. Volte ao Developer Portal.
4. Troque a Development URL para:

```txt
https://localhost:8080
```

Se o app tiver backend, ajuste também:

```env
CANVA_BACKEND_HOST=https://localhost:3001
```

---

## 9. Rodando exemplos oficiais

O starter kit inclui exemplos prontos na pasta `examples`.

Para listar os exemplos:

```bash
npm start examples
```

Você verá categorias como:

```txt
app elements > app text elements
app elements > app image elements
assets and media > asset upload
assets and media > digital asset management
assets and media > fonts
assets and media > image editing overlay
```

Para rodar um exemplo:

```bash
npm start <example_category>/<example_name>
```

Ou:

```bash
npm start <example_name>
```

---

## 10. Rodando exemplos com backend

Alguns exemplos precisam de backend. Nesses casos, o backend costuma ficar em:

```txt
examples/<nome-do-exemplo>/backend/server.ts
```

O backend sobe automaticamente junto com o comando `npm start` e fica disponível em:

```txt
http://localhost:3001
```

### Configuração do `.env` para backend

No Developer Portal:

```txt
Security > Credentials > .env file
```

Copie as variáveis e cole no `.env` local.

Exemplo:

```env
CANVA_APP_ID=AABBccddeeff
CANVA_APP_ORIGIN=https://app-aabbccddeeff.canva-apps.com
CANVA_BACKEND_PORT=3001
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_HMR_ENABLED=TRUE
```

Depois rode:

```bash
npm start fetch
```

O `CANVA_APP_ID` é obrigatório para envio e verificação de requisições HTTP entre Canva e backend.

---

## 11. Configurando backend para desenvolvimento e produção

Durante o desenvolvimento:

```env
CANVA_BACKEND_HOST=http://localhost:3001
```

Em produção:

```env
CANVA_BACKEND_HOST=https://api.seudominio.com
```

No frontend, use:

```ts
const response = await fetch(`${BACKEND_HOST}/custom-route`);
```

`BACKEND_HOST` é uma constante global injetada pelo webpack com base em `CANVA_BACKEND_HOST`.

---

# 12. Integração com seus projetos criativos

## 12.1. Uso recomendado para projetos de design e apresentações

Para seu fluxo de trabalho, o Canva Apps SDK faz mais sentido quando o app resolve uma dor recorrente, não quando apenas replica ações manuais simples.

Casos de uso com ROI real:

1. **Inserção padronizada de componentes**
   - headers;
   - tabelas editoriais;
   - CTAs;
   - cards de produto;
   - blocos de conteúdo;
   - selos e tags;
   - divisores;
   - rodapés.

2. **Conector de dados**
   - Google Sheets;
   - Airtable;
   - Supabase;
   - Firebase;
   - n8n;
   - Make.com;
   - Basecamp;
   - Trello.

3. **Automação de layouts**
   - preencher slides com dados estruturados;
   - gerar variações de páginas;
   - montar guias editoriais;
   - aplicar padrões de design system;
   - criar versões para social media.

4. **Assistente de Brand Kit**
   - listar cores oficiais;
   - sugerir combinações;
   - validar hierarquia visual;
   - aplicar estilos de títulos, subtítulos e corpo;
   - organizar assets por categoria.

5. **Fluxo com IA**
   - gerar copy para slides;
   - transformar briefing em estrutura de apresentação;
   - gerar prompts de imagem;
   - gerar descrições de assets;
   - criar variações de blocos editoriais.

---

## 12.2. Arquitetura recomendada para seus projetos

Modelo ideal:

```txt
Canva App Frontend
        ↓
Backend Node/Express
        ↓
Camada de integrações
        ↓
Google Sheets / Supabase / Firebase / n8n / Make / OpenAI API
```

Fluxo prático:

```txt
Usuário abre app no Canva
↓
Seleciona projeto ou template
↓
App busca dados no backend
↓
Backend consulta planilha/API/banco
↓
App exibe componentes disponíveis
↓
Usuário insere blocos no design
```

---

## 12.3. Estrutura de pastas recomendada para seu app

```txt
canva-app-project/
├── src/
│   ├── app.tsx
│   ├── components/
│   │   ├── AssetPicker.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── BrandTokenCard.tsx
│   │   └── DataTableImporter.tsx
│   ├── config/
│   │   ├── brand-kit.ts
│   │   ├── projects.ts
│   │   └── integrations.ts
│   ├── services/
│   │   ├── canva.ts
│   │   ├── backend.ts
│   │   └── openai.ts
│   └── types/
│       └── index.ts
├── backend/
│   ├── server.ts
│   ├── routes/
│   │   ├── assets.ts
│   │   ├── templates.ts
│   │   ├── sheets.ts
│   │   └── ai.ts
│   └── services/
│       ├── googleSheets.ts
│       ├── supabase.ts
│       ├── n8n.ts
│       └── make.ts
├── .env
├── package.json
└── README.md
```

---

# 13. Integração com Canva Brand Kit e assets

## 13.1. O que o app pode fazer

Um app interno pode facilitar o uso do Brand Kit, mas não deve ser visto como substituto completo do painel nativo do Canva.

Funções úteis:

- exibir tokens da marca;
- organizar links de assets;
- sugerir componentes por tipo de slide;
- carregar imagens externas;
- aplicar padrões textuais;
- inserir elementos no design;
- conectar bibliotecas externas de conteúdo.

## 13.2. Modelo de configuração de marca

Crie um arquivo:

```txt
src/config/brand-kit.ts
```

Conteúdo sugerido:

```ts
export const brandKit = {
  name: "Johnny's by Anthonia",
  colors: {
    paper: "#F7F1E8",
    cloudBlue: "#D8EAF3",
    softWhite: "#FFFFFF",
    cocoa: "#6B4A3A",
    mutedGold: "#C8A96A",
  },
  typography: {
    title: "Cormorant Garamond",
    body: "Inter",
    accent: "Playfair Display",
  },
  components: [
    "Editorial Table",
    "Product Card",
    "CTA Button",
    "Category Header",
    "Curated Tip Block",
  ],
};
```

---

# 14. Integração com Google Sheets

## 14.1. Quando usar

Use Google Sheets quando o projeto tiver conteúdo estruturado, como:

- lista de produtos;
- títulos de slides;
- descrições;
- links de imagens;
- status de produção;
- comentários;
- categorias;
- CTAs;
- links de compra.

## 14.2. Modelo de planilha recomendado

```txt
ID | Projeto | Categoria | Título | Descrição | Imagem_URL | CTA | Status | Observações
```

## 14.3. Rota backend sugerida

```ts
app.get("/api/sheets/project-content", async (req, res) => {
  const projectId = req.query.projectId;

  // Buscar dados no Google Sheets
  // Normalizar os dados
  // Retornar JSON para o Canva App

  res.json({
    projectId,
    items: [],
  });
});
```

## 14.4. Chamada no frontend

```ts
const response = await fetch(`${BACKEND_HOST}/api/sheets/project-content?projectId=johnnys`);
const data = await response.json();
```

---

# 15. Integração com Supabase

Use Supabase quando precisar de:

- banco mais robusto que Google Sheets;
- autenticação;
- storage de imagens;
- filtros avançados;
- histórico de versões;
- dados compartilhados entre vários apps.

## 15.1. Tabela sugerida

```sql
create table canva_assets (
  id uuid primary key default gen_random_uuid(),
  project text not null,
  category text,
  title text,
  description text,
  asset_url text,
  tags text[],
  status text default 'active',
  created_at timestamp default now()
);
```

## 15.2. Rota backend sugerida

```ts
app.get("/api/assets", async (req, res) => {
  const { project } = req.query;

  // Consultar Supabase filtrando por projeto
  // Retornar lista de assets

  res.json({ assets: [] });
});
```

---

# 16. Integração com n8n, Make.com e webhooks

## 16.1. Quando usar n8n ou Make.com

Use automação externa quando precisar:

- sincronizar Basecamp, Trello e Google Sheets;
- processar arquivos;
- gerar conteúdo com OpenAI;
- aprovar etapas;
- enviar notificações por Slack ou WhatsApp;
- atualizar dados sem mexer no código do app Canva.

## 16.2. Fluxo recomendado

```txt
Canva App
↓
Backend próprio
↓
Webhook n8n ou Make
↓
Processamento / IA / Planilha / Banco
↓
Retorno JSON para o Canva App
```

## 16.3. Exemplo de chamada para webhook

```ts
const response = await fetch(`${BACKEND_HOST}/api/generate-slide-content`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    project: "johnnys",
    slideType: "editorial-table",
    source: "google-sheets",
  }),
});

const result = await response.json();
```

---

# 17. Integração com OpenAI API

## 17.1. Usos práticos

- transformar briefing em estrutura de slides;
- gerar textos para cards;
- revisar consistência de tom de voz;
- criar prompts para Midjourney, Veo ou Canva AI;
- sugerir layout por tipo de conteúdo;
- resumir comentários de clientes;
- classificar assets por tags.

## 17.2. Regra de segurança

Nunca exponha a chave da OpenAI no frontend do Canva App.

Errado:

```ts
const apiKey = "sk-...";
```

Correto:

```txt
Canva App frontend → seu backend → OpenAI API
```

## 17.3. Variável de ambiente

```env
OPENAI_API_KEY=sk-proj-xxxx
```

## 17.4. Rota backend sugerida

```ts
app.post("/api/ai/slide-copy", async (req, res) => {
  const { briefing, slideType, brandTone } = req.body;

  // Chamar OpenAI no backend
  // Retornar copy estruturada

  res.json({
    title: "",
    subtitle: "",
    body: "",
    cta: "",
  });
});
```

---

# 18. Workflow recomendado para projeto Johnny’s by Anthonia

## 18.1. Objetivo

Criar um app interno no Canva para acelerar a produção do **Guia de Enxoval Johnny’s**, mantendo consistência editorial, Brand Kit, templates e dados estruturados.

## 18.2. Módulos do app

```txt
1. Project Selector
2. Brand Kit Viewer
3. Template Selector
4. Editorial Table Builder
5. Product Card Generator
6. CTA Inserter
7. Asset Library
8. AI Copy Assistant
9. Export / QA Checklist
```

## 18.3. Dados necessários

```txt
Projetos
Categorias
Produtos
Recomendações
Descrições
Links de compra
Imagens
Tags
Status
Observações
```

## 18.4. Exemplo de objeto JSON

```json
{
  "project": "johnnys-enxoval",
  "section": "amamentacao-e-alimentacao",
  "component": "editorial-table",
  "items": [
    {
      "title": "Almofada de amamentação",
      "recommendation": "Essencial",
      "comment": "Ajuda no conforto da mãe e do bebê durante as mamadas.",
      "cta": "Clique e compre agora",
      "url": "https://exemplo.com/produto"
    }
  ]
}
```

---

# 19. Workflow recomendado para agentes IDE

## 19.1. Papel do agente

O agente IDE deve atuar como arquiteto e executor técnico do app Canva, sem inventar recursos que o Canva Apps SDK não suporta.

## 19.2. Prompt pronto para agente IDE

```md
# ROLE
Você é um Senior Frontend Engineer especialista em Canva Apps SDK, React, TypeScript, arquitetura de design systems, automação criativa e integrações com APIs.

# CONTEXTO DO PROJETO
Estou criando um app interno para Canva com base no Canva Apps SDK starter kit. O objetivo é acelerar a produção de apresentações, guias editoriais, templates, assets e componentes reutilizáveis para projetos de branding e advertising.

# STACK
- Canva Apps SDK
- React
- TypeScript
- Node.js
- Express ou backend equivalente
- Google Sheets API
- Supabase
- OpenAI API
- n8n ou Make.com via webhooks

# OBJETIVO
Criar uma arquitetura limpa para um app Canva com:
1. seleção de projeto;
2. visualização de Brand Kit;
3. seleção de templates;
4. importação de dados estruturados;
5. geração de componentes editoriais;
6. integração segura com backend;
7. preparação para produção.

# REGRAS
- Não colocar chaves de API no frontend.
- Usar variáveis de ambiente.
- Separar componentes, serviços, tipos e configurações.
- Criar código TypeScript completo e substituível.
- Antes de implementar, revisar a documentação oficial do Canva Apps SDK.
- Não inventar APIs inexistentes do Canva.
- Quando houver limitação do SDK, explicar claramente e propor alternativa.

# ENTREGA ESPERADA
Responda com:
1. análise da arquitetura;
2. estrutura de pastas;
3. arquivos a criar ou editar;
4. código completo;
5. comandos de instalação e execução;
6. checklist de teste no Developer Portal;
7. riscos e limitações.
```

---

# 20. Checklist de configuração inicial

```txt
[ ] Instalar Node.js v24
[ ] Instalar npm v11
[ ] Clonar starter kit
[ ] Rodar npm install
[ ] Criar app no Canva Developer Portal
[ ] Configurar Development URL
[ ] Copiar .env do Developer Portal
[ ] Rodar npm start
[ ] Testar preview no Canva
[ ] Ativar HMR
[ ] Configurar backend se necessário
[ ] Configurar variáveis sensíveis apenas no backend
[ ] Criar estrutura de componentes
[ ] Criar módulo de projeto/Brand Kit/templates
[ ] Conectar dados externos
[ ] Testar inserção de elementos no design
[ ] Testar build de produção
```

---

# 21. Checklist de segurança

```txt
[ ] Nunca expor API keys no frontend
[ ] Nunca commitar .env
[ ] Adicionar .env ao .gitignore
[ ] Validar origem das requisições do Canva
[ ] Usar CANVA_APP_ID no backend
[ ] Verificar assinatura de requisições quando aplicável
[ ] Sanitizar conteúdo vindo de planilhas
[ ] Controlar CORS no backend
[ ] Separar ambientes dev/staging/prod
[ ] Rotacionar tokens periodicamente
```

---

# 22. Checklist de produção

```txt
[ ] Backend hospedado em HTTPS
[ ] CANVA_BACKEND_HOST apontando para produção
[ ] Variáveis configuradas no provedor de hosting
[ ] Logs habilitados
[ ] Tratamento de erro no frontend
[ ] Loading states no app
[ ] Empty states para dados ausentes
[ ] Controle de versão no GitHub
[ ] Documentação do fluxo de uso
[ ] Testes no Canva Developer Portal
```

---

# 23. Estratégia de ROI

O Canva Apps SDK vale a pena quando reduz repetição operacional. Para o seu contexto, o maior ROI está em:

1. **Gerar componentes editoriais padronizados**
   - reduz retrabalho visual;
   - mantém consistência;
   - acelera produção de guias e apresentações.

2. **Conectar dados externos**
   - evita copiar e colar conteúdo;
   - reduz erro humano;
   - facilita atualização de versões.

3. **Criar assistente de QA visual**
   - valida se slides seguem regras do design system;
   - ajuda agentes IDE a auditar templates;
   - gera checklist antes da entrega.

4. **Automatizar conteúdo com IA via backend**
   - cria textos, prompts e descrições;
   - preserva tom de voz;
   - acelera variações.

Ponto crítico: não vale criar app Canva para cada microtarefa. O ideal é criar um app-base modular e reaproveitável por projeto.

---

# 24. Roadmap sugerido

## Fase 1 — Setup técnico

```txt
Canva Developer Portal
Starter kit local
HMR
Backend simples
.env seguro
```

## Fase 2 — Módulo de projeto

```txt
Selecionar projeto
Carregar configuração JSON
Listar templates
Listar assets
```

## Fase 3 — Integração de dados

```txt
Google Sheets ou Supabase
Normalização dos dados
Preview no app
Inserção manual no Canva
```

## Fase 4 — IA e automação

```txt
OpenAI API via backend
Geração de copy
Geração de prompts
Classificação de assets
QA textual
```

## Fase 5 — Escala

```txt
Ambiente produção
Controle de permissões
Logs
Templates por cliente
Biblioteca multi-projeto
```

---

# 25. Comandos úteis

```bash
# Instalar dependências
npm install

# Rodar app local
npm start

# Rodar com HTTPS
npm start --use-https

# Listar exemplos
npm start examples

# Rodar exemplo específico
npm start <example_name>

# Ver versão do Node
node -v

# Ver versão do npm
npm -v

# Usar versão definida no .nvmrc
nvm use
```

---

# 26. Estrutura mínima de `.env`

```env
CANVA_APP_ID=AABBccddeeff
CANVA_APP_ORIGIN=https://app-aabbccddeeff.canva-apps.com
CANVA_BACKEND_PORT=3001
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_HMR_ENABLED=true
OPENAI_API_KEY=sk-proj-xxxx
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
GOOGLE_SHEETS_ID=xxxx
N8N_WEBHOOK_URL=https://xxxx/webhook/canva
```

Nunca envie esse arquivo para GitHub.

Adicione ao `.gitignore`:

```gitignore
.env
.env.local
.env.production
node_modules
```

---

# 27. Conclusão estratégica

O Canva Apps SDK deve ser tratado como uma camada de produto interno para operação criativa. O ganho real não está em “abrir um app dentro do Canva”, mas em transformar Brand Kit, templates, dados, assets e automações em um fluxo controlado.

Para seus projetos, a melhor direção é criar um **Canva Creative Operations App** modular, com suporte a:

- múltiplos clientes;
- múltiplos Brand Kits;
- templates editoriais;
- dados externos;
- IA via backend;
- QA de consistência;
- automação com n8n/Make;
- assets versionados.

Esse modelo evita retrabalho, melhora governança visual e reduz dependência de processos manuais frágeis.
