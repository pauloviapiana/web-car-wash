# Project context analysis
_Exported on 11/16/2026 at 17:27:35 GMT-3 from Cursor (3.30.14)_

---

**User**

Analise o contexto do projeto que preciso desenvolver em @contexto/ . Analise os arquivos por completo e entenda o que será necessário.

---

**Cursor**

Vou ler o conteúdo de `contexto/` por completo para mapear o escopo e o que será necessário desenvolver.

Os PDFs não abriram direto; vou extrair o texto por outra via.

Os PDFs usam fontes codificadas; vou decodificar o texto via mapas ToUnicode e, se preciso, renderizar páginas.

O texto veio caractere a caractere; vou recombinar e extrair o segundo PDF.

Extração ok. Vou ler os dois documentos por completo.

O repositório ainda está vazio (`README.md` só). Em `contexto/` há dois materiais da mesma aula/projeto **Gestão Automotiva**: um roteiro técnico completo e slides de apoio.

## O que é o projeto

Sistema web para **oficina mecânica ou lava-car**, com a mesma estrutura. Centraliza:

- funcionários (login)
- clientes (proprietários)
- veículos
- ordens de serviço com status

Só muda a **descrição/tipo de serviço** (ex.: “Troca de óleo” vs “Lavagem completa”).

## Stack definida

| Camada | Tecnologia |
|--------|------------|
| Banco | PostgreSQL — 4 tabelas |
| Backend | Node.js + Express (ES modules) |
| Persistência | **escolher uma**: `pg` (SQL) **ou** Sequelize |
| Auth | bcrypt + JWT (expira em 30 min) |
| Frontend | React (Vite) + Axios |
| Testes API | Insomnia ou Postman |

Monorepo sugerido: `gestao-automotiva/server` + `gestao-automotiva/client`.

## Modelo de dados

```
USUARIOS (independente)
PROPRIETARIOS 1──N VEICULOS 1──N ORDENS_SERVICO
```

- **Usuario:** nome, email (unique), senha (hash), perfil (`admin` \| `atendente` \| `tecnico`)
- **Proprietario:** nome, email, telefone, cpf (**não** expor em listagens)
- **Veiculo:** marca, modelo, placa (**unique**), ano, cor, `proprietarioId`
- **OrdemServico:** dataEntrada, descricao, tipoServico (texto), valor ≥ 0, status (`aberto` \| `em_andamento` \| `concluido` \| `cancelado`), `veiculoId`

## Requisitos funcionais (RF01–RF12)

1. Login com falha em credenciais inválidas  
2. Sessão JWT com expiração  
3. Nome do usuário logado + sair  
4. Pesquisa/listagem de proprietários  
5. Cadastro de veículo ligado a proprietário existente  
6. Listagem de veículos com proprietário  
7. Cadastro de ordem ligada a veículo  
8. Listagem de ordens com veículo + proprietário, por data  
9. Atualizar status da ordem  
10. Proteger dados pessoais e segredos (`.env`)  
11. Script SQL / seed com ≥ 3 registros por tabela  
12. Documentação + DER alinhados ao banco  

## API mínima

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | público |
| GET/POST | `/api/proprietarios` | JWT |
| GET/POST | `/api/veiculos` | JWT |
| GET/POST | `/api/ordens-servico` | JWT |
| PATCH | `/api/ordens-servico/:id/status` | JWT |

O material sugere completar CRUD (PUT/PATCH/DELETE) e RBAC por perfil depois.

## Frontend mínimo

- Login → guarda token em `sessionStorage`
- Dashboard com listagens: Proprietários, Veículos, Ordens
- Axios com interceptor `Authorization: Bearer …`
- Estados de carregamento e erro

## Entregáveis esperados

1. SQL das 4 tabelas + seed (≥ 3 por tabela, reexecutável sem duplicar)  
2. Backend com **uma** estratégia de persistência  
3. Coleção Postman/Insomnia  
4. Frontend (login + dashboard + listagens)  
5. Documentação + DER  

## Ordem recomendada de desenvolvimento

1. Requisitos/documentação  
2. Banco e tabelas  
3. Escolher `pg` **ou** Sequelize  
4. Conexão  
5. Camada de dados  
6. Auth (bcrypt + JWT)  
7. Controllers/rotas  
8. Seed  
9. Testar API  
10. Frontend Vite + Axios  
11. Login + dashboard  

## Decisão que você precisa tomar

**Persistência:** `pg` (SQL/JOIN explícitos) ou Sequelize (Models/`include`). O frontend e os endpoints são os mesmos; o material pede **uma** abordagem de ponta a ponta.

---

**Resumo:** é um CRUD acadêmico full-stack (auth + 3 entidades de negócio + relacionamentos 1:N), com contrato de API e checklist de aceite bem definidos. O repo `web-car-wash` ainda não tem código — só o contexto.

Se quiser, no próximo passo posso detalhar o DER, a ordem de implementação arquivo a arquivo, ou comparar `pg` vs Sequelize para este escopo. Para eu **implementar**, é preciso sair do Ask mode e ir para o Agent mode.

---

**User**

Baseado no que voce entendeu, agora quero que voce monte um plano de como o projeto deve ser desenvolvido por partes

---

**Cursor**

Plano em partes, alinhado à ordem do material e aos RF01–RF12. Cada fase só avança quando a anterior estiver testada.

---

## Fase 0 — Preparação e decisões

**Objetivo:** alinhar escopo antes de codificar.

1. Confirmar cenário inicial (oficina, lava-car ou ambos só mudando textos de serviço).
2. Escolher **uma** persistência: `pg` **ou** Sequelize.
3. Definir telas mínimas: Login, Dashboard (3 listagens), e se haverá formulários de cadastro na UI ou só via API no início.
4. Entregar rascunho de documentação + DER (mesmo que incompleto).

**Critério de pronto:** decisão de stack registrada; DER com as 4 entidades e 1:N.

---

## Fase 1 — Banco PostgreSQL

**Objetivo:** modelagem física correta.

1. Criar banco `gestao_automotiva`.
2. Criar tabelas nesta ordem (por causa das FKs):
   - `usuarios`
   - `proprietarios`
   - `veiculos`
   - `ordens_servico`
3. Aplicar restrições: UNIQUE (email, placa), CHECK (perfil, status, valor ≥ 0), FKs, timestamps.
4. Validar no pgAdmin/DBeaver: INSERT inválido de veículo sem proprietário deve falhar.

**Critério de pronto:** script SQL das 4 tabelas; DER final bate com o SQL (RF12 parcial).

---

## Parte A — Backend base

### Fase 2 — Projeto `server`

1. `npm init`, Express, CORS, dotenv, bcrypt, jsonwebtoken, `pg` (+ Sequelize/`pg-hstore` se for a opção B).
2. Estrutura de pastas (`config`, `controllers`, `middlewares`, `routes`, `seeders`, `models` se Sequelize).
3. `.env` (PORT, DB_*, JWT_SECRET, FRONTEND_ORIGIN) — nunca versionar.
4. `server.js` com CORS, `express.json()`, prefixo `/api`.

**Critério de pronto:** servidor sobe e confirma conexão (`SELECT 1` ou `authenticate()`).

### Fase 3 — Camada de dados

**Se `pg`:** pool + queries parametrizadas nos controllers.  
**Se Sequelize:** Models + associações em `models/index.js` + `sync()` só em dev.

Implementar primeiro as operações de leitura/escrita sem auth nas funções (auth vem na fase seguinte):

- Proprietários: listar (sem CPF), criar  
- Veículos: listar com JOIN/include do proprietário, criar  
- Ordens: listar com veículo + proprietário, criar, atualizar status  

**Critério de pronto:** cada operação funciona isolada (pode testar temporariamente sem JWT).

---

## Parte B — Autenticação e API completa

### Fase 4 — Auth (RF01, RF02, RF10)

1. Cadastro/seed de usuário com senha em bcrypt.
2. `POST /api/auth/login` → token JWT 30m + dados do usuário.
3. Middleware `autenticar` (Bearer token → 401 se inválido/ausente).
4. Credenciais inválidas → 401.

**Critério de pronto:** login ok / senha errada 401 / rota protegida sem token 401.

### Fase 5 — Rotas REST + proteção

Montar `routes/index.js` com o contrato oficial:

| Rota | RF |
|------|-----|
| POST `/auth/login` | RF01–02 |
| GET/POST `/proprietarios` | RF04 (listagem; busca pode ser query `?nome=`) |
| GET/POST `/veiculos` | RF05–06 |
| GET/POST `/ordens-servico` | RF07–08 |
| PATCH `/ordens-servico/:id/status` | RF09 |

Opcional nesta fase (recomendado pelo material, não bloqueante): PUT/DELETE e checagem de perfil (admin/atendente/técnico).

**Critério de pronto:** coleção Postman/Insomnia cobrindo os testes obrigatórios da seção 12.6.

### Fase 6 — Seed (RF11)

1. ≥ 3 usuários, 3 proprietários, 3 veículos, 3 ordens.
2. Senhas com bcrypt.
3. Transação + `findOrCreate` / unicidade para reexecução sem duplicar.
4. Script `npm run seed`.

**Critério de pronto:** seed roda 2 vezes sem duplicar; dados bastam para as listagens.

---

## Parte C — Frontend

### Fase 7 — Projeto `client` (Vite + React)

1. Criar app Vite (React + JS).
2. Axios em `services/api.js` com `VITE_API_URL` e interceptor JWT.
3. Login → `sessionStorage` (RF01, RF03).
4. Layout pós-login: nome do usuário + botão Sair.

**Critério de pronto:** login real contra a API; token anexado nas próximas requests.

### Fase 8 — Dashboard e listagens (RF03–RF08)

1. Componentes: `Proprietarios`, `Veiculos`, `OrdensServico`.
2. `useEffect` para carregar; estados loading/erro/dados.
3. Padronizar leitura do JSON (pg vs Sequelize: `proprietarioNome` vs `proprietario.nome`).
4. CSS básico responsivo (grid 3 colunas → 1 no mobile).

**Critério de pronto:** após login, as 3 listagens mostram relacionamentos corretos.

### Fase 9 — Cadastros na UI (recomendado para fechar RF04–RF07/RF09)

Na ordem do domínio:

1. Formulário de proprietário (+ campo de busca se RF04 exigir pesquisa).
2. Formulário de veículo (select de proprietários).
3. Formulário de ordem (select de veículos).
4. Ação para mudar status (select/botões: aberto → em_andamento → concluido/cancelado).

**Critério de pronto:** fluxo completo só pela interface, sem Postman.

---

## Parte D — Entrega e endurecimento

### Fase 10 — Documentação e pacote de entrega (RF10–RF12)

1. DER final (imagem/PDF) idêntico ao banco.
2. Script SQL + instruções de setup (`.env.example` sem segredos).
3. Coleção Postman/Insomnia.
4. README: como subir banco, seed, server, client.
5. Checklist da seção 14 do material.

### Fase 11 — Melhorias (depois do MVP)

Só após o checklist verde:

- Validação com Zod  
- RBAC por perfil  
- Rate limit / erros centralizados  
- Impedir delete de veículo com ordens  
- Criptografia de CPF (mencionado no material)  

---

## Ordem visual das partes

```
0 Decisões + DER
    ↓
1 Banco (4 tabelas)
    ↓
2–3 Server + persistência
    ↓
4–5 Auth + rotas JWT
    ↓
6 Seed
    ↓
7–8 Frontend login + listagens
    ↓
9 Formulários / status na UI
    ↓
10 Docs + Postman + checklist
    ↓
11 Melhorias (opcional)
```

---

## Sugestão de marcos (milestones)

| Marco | Entrega | Valida |
|-------|---------|--------|
| M1 | Banco + DER | FKs e UNIQUE |
| M2 | API autenticada + seed + Postman | RF01–02, RF05–11 (API) |
| M3 | Frontend login + dashboard | RF03, RF06, RF08 |
| M4 | Cadastros/status na UI + docs | RF04–09, RF12, checklist |

---

## O que não misturar

- Não começar o React antes da API testada.
- Não implementar `pg` **e** Sequelize juntos.
- Não expor CPF/senha nas listagens.
- Não commitar `.env`.

Se quiser, no próximo passo monto o **backlog tarefa a tarefa** (ex.: tickets do tipo “criar `proprietarioController.listar`”) já no formato pronto para Agent mode executar a Parte A.

---

**User**

Ok. Fase 2 está feita. Monte um prompt altamente eficiente para me ajudar desenvolver a Fase 3 do projeto. Por que digo ajudar? Porque quero entender o projeto pois posteriormente terei que apresentar. Quero também que o desenvolvimento do dessa Fase 3 seja por partes e um passo de cada vez para entender cada detalhe. Lembrando que sou iniciante na area de desenvolvimento e não possuo muito conhecimento técnico das coisas. Só não quero que fique fazendo perguntas para eu responder

---

**Cursor**

Vou olhar o que já existe no backend para o prompt da Fase 3 bater exatamente com o seu projeto.

Abaixo está um prompt pronto para colar em uma **nova conversa no Agent mode**. Ele já assume o que existe no seu repo (Sequelize + migrations) e manda o agente ensinar **um passo por vez**, sem te fazer perguntas.

---

```text
# Papel
Você é um mentor técnico paciente para um iniciante absoluto em desenvolvimento web.
Seu objetivo NÃO é só entregar código: é me fazer ENTENDER cada peça, porque depois eu preciso apresentar o projeto.

# Projeto
Sistema "Gestão Automotiva" (oficina/lava-car).
Monorepo em: c:\Users\paulo\Projetos\web-car-wash
Backend já existe em: backend/
Persistência escolhida: Sequelize + PostgreSQL (NÃO usar SQL cru com pg nos controllers).
Tabelas já criadas por migrations:
- usuarios
- proprietarios
- veiculos (FK proprietarioId)
- ordens_servico (FK veiculoId)

Estado atual da Fase 2 (já pronta — NÃO refazer):
- server.js sobe, autentica sequelize, usa cors/json, monta /api
- routes/index.js só tem GET /health
- database.js exporta instância Sequelize
- NÃO existem models nem controllers ainda

# O que é a Fase 3 (escopo desta conversa)
Camada de dados + controllers das entidades de negócio.
Nesta fase NÃO implementar:
- login/JWT/middleware de auth (isso é Fase 4)
- seed completo (Fase 6)
- frontend (Fase 7+)
- rotas protegidas finais

Nesta fase SIM implementar, em ordem:
1) Models Sequelize alinhados às migrations
2) Associações (Proprietario 1:N Veiculo; Veiculo 1:N OrdemServico)
3) Controllers: listar/criar proprietários; listar/criar veículos; listar/criar/atualizar status de ordens
4) Rotas temporárias SEM auth só para eu testar a Fase 3 no Postman/Insomnia
5) Conferir que CPF NÃO aparece na listagem de proprietários

# Como você deve trabalhar comigo (obrigatório)
1. Um passo de cada vez. Nunca implemente a fase inteira de uma vez.
2. Em CADA passo, use esta estrutura fixa:
   A) Objetivo do passo (1 frase)
   B) Por que isso existe no projeto (explicação simples, analogia do dia a dia se ajudar)
   C) Conceitos novos em português claro (ex.: o que é Model, association, include, controller, async/await)
   D) O que vamos criar/alterar (arquivos e responsabilidade de cada um)
   E) Código/implementação deste passo apenas
   F) Como eu testo este passo (comando ou request HTTP concreto)
   G) "O que você precisa saber para apresentar" (2–4 bullets que eu posso falar na banca)
   H) Pare e diga: "Quando quiser, diga: próximo passo"
3. NÃO faça perguntas para eu decidir. Se houver dúvida técnica, escolha a opção mais alinhada ao material do projeto e siga.
4. NÃO pule explicação. Eu sou iniciante: evite jargão sem traduzir.
5. NÃO altere migrations já existentes, a menos que esteja quebrado de verdade.
6. Mantenha o estilo do código atual: ES modules (`import`/`export`), pastas em backend/src/.
7. Ao criar models, espelhe EXATAMENTE os campos/tipos das migrations existentes (incluindo ENUM de perfil e status, e constraint valor >= 0).
8. Usuario: criar o Model agora (vai ser usado na auth depois), mas controllers de auth ficam para a Fase 4.
9. Padronize respostas JSON simples e mensagens em português.
10. Se eu mandar só "próximo passo", continue do ponto exato onde paramos, sem recapitular a fase inteira.

# Ordem obrigatória dos passos da Fase 3
Passo 1 — Explicar a diferença entre migration e Model (só explicação; no máximo criar a pasta models se necessário)
Passo 2 — Criar Model Usuario
Passo 3 — Criar Model Proprietario
Passo 4 — Criar Model Veiculo
Passo 5 — Criar Model OrdemServico
Passo 6 — Criar models/index.js com associações hasMany/belongsTo e aliases
Passo 7 — Importar models no boot do server (sem sync force/alter) só para registrar associações
Passo 8 — Controller proprietarios: listar (exclude cpf) + criar
Passo 9 — Rotas temporárias GET/POST /api/proprietarios e teste
Passo 10 — Controller veiculos: listar com include do proprietario + criar
Passo 11 — Rotas temporárias GET/POST /api/veiculos e teste
Passo 12 — Controller ordensServico: criar + listar com veiculo+proprietario + atualizarStatus
Passo 13 — Rotas temporárias GET/POST /api/ordens-servico e PATCH /api/ordens-servico/:id/status
Passo 14 — Mini-revisão da Fase 3 para apresentação (mapa mental: migration → model → association → controller → rota)

# Comece agora
Inicie pelo Passo 1, com a estrutura A–H.
Não faça os outros passos ainda.
```

---

### Como usar

1. Abra um chat novo em **Agent mode**.
2. Cole o prompt acima.
3. Em cada etapa, diga só: `próximo passo`.
4. Só avance quando tiver entendido o passo atual (é isso que vai te ajudar na apresentação).

### Dica rápida

Se o agente tentar ir rápido demais, responda:

`Pare. Refaça só este passo com mais explicação e sem código além do necessário.`

---

**User**

Fase 6 está feita. Monte um prompt altamente eficiente para me ajudar desenvolver a Fase 7 do projeto. Pode ser no mesmo modelo de prompt que voce desenvolveu para a fase 3. Pois foi super legal de desenvolver a parte 3 com aquele prompt.

---

**Cursor**

Vou conferir o estado atual do backend e se já existe algo de frontend, para o prompt da Fase 7 ficar preciso como o da Fase 3.

Prompt pronto para colar em um chat novo no **Agent mode** — no mesmo estilo da Fase 3, já alinhado ao seu backend real.

---

```text
# Papel
Você é um mentor técnico paciente para um iniciante absoluto em desenvolvimento web.
Seu objetivo NÃO é só entregar código: é me fazer ENTENDER cada peça, porque depois eu preciso apresentar o projeto.

# Projeto
Sistema "Gestão Automotiva" (oficina/lava-car).
Monorepo em: c:\Users\paulo\Projetos\web-car-wash

Backend JÁ PRONTO em: backend/
- Node.js + Express + Sequelize + PostgreSQL
- Auth: bcrypt + JWT (expira em 30m)
- Rotas em /api com autenticação e autorização por perfil
- Seed: npm run seed (dentro de backend/)
- Servidor: porta 3001 (PORT no .env)
- CORS liberado para FRONTEND_ORIGIN=http://localhost:5173

Contrato de login que o frontend deve consumir:
- POST http://localhost:3001/api/auth/login
- Body JSON: { "email": "...", "senha": "..." }
- Sucesso 200: { "token": "...", "usuario": { "id", "nome", "perfil" } }
- Erro 401: { "mensagem": "Credenciais inválidas" }

Usuários demo do seed (senha de todos: 123456):
- admin@email.com (perfil admin)
- atendente@email.com (perfil atendente)
- tecnico@email.com (perfil tecnico)

Estado atual:
- Pasta frontend/client AINDA NÃO existe (ou está vazia)
- NÃO criar/alterar backend nesta fase, salvo se for estritamente necessário e eu pedir
- Fase 6 (seed) já está feita

# O que é a Fase 7 (escopo desta conversa)
Criar o frontend React e fazer o login funcionar de ponta a ponta.

Nesta fase SIM implementar, em ordem:
1) App React com Vite (JavaScript)
2) Variável de ambiente VITE_API_URL
3) Instância Axios central + interceptor JWT
4) Tela de Login
5) Guardar token (e dados básicos do usuário) no sessionStorage
6) Shell pós-login: mostrar nome do usuário + botão Sair
7) Fluxo: sem token → Login; com token/usuário → área logada

Nesta fase NÃO implementar:
- Listagens de proprietários/veículos/ordens (isso é Fase 8)
- Formulários de cadastro / atualizar status (isso é Fase 9)
- React Router completo (pode ficar simples com estado no App.jsx, como no material)
- Alterações de API, seed, migrations ou middlewares

# Como você deve trabalhar comigo (obrigatório)
1. Um passo de cada vez. Nunca implemente a fase inteira de uma vez.
2. Em CADA passo, use esta estrutura fixa:
   A) Objetivo do passo (1 frase)
   B) Por que isso existe no projeto (explicação simples, analogia do dia a dia se ajudar)
   C) Conceitos novos em português claro (ex.: o que é Vite, componente, estado, async/await, Axios, interceptor, sessionStorage, CORS, variável VITE_)
   D) O que vamos criar/alterar (arquivos e responsabilidade de cada um)
   E) Código/implementação deste passo apenas
   F) Como eu testo este passo (comando no terminal e/ou o que olhar no navegador/DevTools)
   G) "O que você precisa saber para apresentar" (2–4 bullets que eu posso falar na banca)
   H) Pare e diga: "Quando quiser, diga: próximo passo"
3. NÃO faça perguntas para eu decidir. Se houver dúvida, escolha a opção mais alinhada ao material do projeto (React + Vite + Axios + sessionStorage) e siga.
4. NÃO pule explicação. Eu sou iniciante: evite jargão sem traduzir.
5. Mantenha o frontend simples e didático: JavaScript (não TypeScript), componentes em .jsx.
6. Preferir pasta: frontend/  (criar com Vite o projeto React dentro dela; se o scaffold gerar subpasta client/, organize de forma clara e explique).
7. NÃO instalar bibliotecas extras sem necessidade (sem React Router, sem UI kit, sem Redux nesta fase).
8. CSS pode ser simples e limpo; não precisa ser design elaborado nesta fase.
9. Sempre lembrar: o React NÃO fala com o PostgreSQL — ele só chama a API HTTP.
10. Se eu mandar só "próximo passo", continue do ponto exato onde paramos, sem recapitular a fase inteira.
11. Antes de pedir teste de login na UI, lembrar que o backend precisa estar rodando (npm run dev na pasta backend) e o seed já ter sido executado.

# Ordem obrigatória dos passos da Fase 7
Passo 1 — Explicar a arquitetura frontend ↔ API ↔ banco (só explicação; desenhar o fluxo do login em texto)
Passo 2 — Criar o projeto React com Vite (React + JavaScript) na estrutura do monorepo
Passo 3 — Instalar Axios e criar frontend/.env com VITE_API_URL=http://localhost:3001/api
Passo 4 — Criar services/api.js (instância Axios + interceptor Authorization Bearer)
Passo 5 — Criar componente Login.jsx (form email/senha, chama POST /auth/login, trata erro)
Passo 6 — Integrar Login no App.jsx: salvar token + usuario no sessionStorage e subir estado do usuário logado
Passo 7 — Criar área logada mínima (header com "Bem-vindo(a), {nome}" + botão Sair que limpa sessionStorage)
Passo 8 — Melhorar UX básica do Login/área logada (loading no botão, mensagem de erro visível, CSS simples)
Passo 9 — Checklist de teste manual completo (backend up, seed, login ok, login inválido, sair, token no sessionStorage e no header da request)
Passo 10 — Mini-revisão da Fase 7 para apresentação (mapa mental: Vite → componente → Axios → JWT no sessionStorage → shell logado)

# Regras de implementação importantes
- Token: sessionStorage.setItem("token", ...)
- Usuário: pode salvar também um JSON simples no sessionStorage (ex.: "usuario") para sobreviver a refresh da página, OU recuperar só o token e manter usuario em estado — escolha a opção didática mais simples e explique o trade-off em 2 linhas, sem perguntar.
- No logout: remover token/usuario do sessionStorage e voltar para a tela de Login.
- Interceptor: ler token do sessionStorage e setar config.headers.Authorization = `Bearer ${token}`
- Não hardcodear URL da API no componente; usar import.meta.env.VITE_API_URL
- Mensagens de erro: preferir error.response?.data?.mensagem

# Comece agora
Inicie pelo Passo 1, com a estrutura A–H.
Não faça os outros passos ainda.
```

---

### Como usar

1. Chat novo em **Agent mode**
2. Cole o prompt
3. Avance com: `próximo passo`
4. Antes dos testes de login, deixe o backend no ar (`backend` → `npm run dev`) e o seed já rodado

### Se o agente acelerar demais

`Pare. Refaça só este passo com mais explicação e sem código além do necessário.`

