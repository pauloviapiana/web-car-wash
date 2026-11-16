# Documentação — Gestão Automotiva

Documentação alinhada ao código implementado no monorepo `web-car-wash` (RF12).  
Artefatos relacionados: `docs/DER.md`, `docs/schema_referencia.sql`.

---

## 1. Objetivo do sistema

Aplicação web para **oficina mecânica ou lava-car**: cadastrar proprietários, vincular veículos e acompanhar ordens de serviço (status e valor).

Usuários internos (admin, atendente, técnico) fazem login e usam um dashboard com listagens e cadastros. A API REST é o contrato entre frontend e banco.

---

## 2. Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Banco | PostgreSQL |
| Backend | Node.js + Express |
| Persistência | **Sequelize** (ORM) — única estratégia do projeto (não usamos `pg` “cru” nas rotas) |
| Auth | bcrypt (senha) + JWT (sessão, **30 minutos**) |
| Frontend | Vite + React (JavaScript) + Axios |
| Testes manuais de API | Coleção Postman em `backend/postman/` |

---

## 3. Estrutura de pastas (visão geral)

```
web-car-wash/
├── backend/
│   ├── .env.example          # modelo de variáveis (sem segredos reais)
│   ├── .sequelizerc          # caminhos do Sequelize CLI
│   ├── package.json
│   ├── postman/              # coleção de testes da API
│   └── src/
│       ├── config/           # conexão Sequelize / config CLI
│       ├── controllers/      # regras HTTP (login, CRUD…)
│       ├── middlewares/      # autenticar (JWT) + autorizarPerfil (RBAC)
│       ├── migrations/       # cria as 4 tabelas (fonte de verdade do schema)
│       ├── models/           # models + associações Sequelize
│       ├── routes/           # mapa de endpoints em /api
│       ├── seeders/          # npm run seed
│       ├── scripts/          # utilitários (ex.: criar usuário teste)
│       ├── utils/
│       └── server.js         # sobe Express na porta 3001
├── frontend/
│   ├── src/
│   │   ├── components/       # Login, Proprietarios, Veiculos, OrdensServico
│   │   ├── services/api.js   # Axios + interceptor JWT (sessionStorage)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── docs/
│   ├── DER.md
│   ├── schema_referencia.sql
│   └── DOCUMENTACAO.md       # este arquivo
└── README.md                 # como subir o projeto (próximo passo da Fase 10)
```

---

## 4. Modelo de dados

Quatro tabelas (detalhe visual em `docs/DER.md`; SQL didático em `docs/schema_referencia.sql`):

| Tabela | Papel | Destaques |
|--------|-------|-----------|
| `usuarios` | Login interno | `email` UNIQUE; `senha` = hash bcrypt; `perfil` ENUM |
| `proprietarios` | Clientes | `email` UNIQUE; `cpf` gravado, **omitido nas respostas de listagem** |
| `veiculos` | Carros | `placa` UNIQUE; FK `proprietarioId` → proprietarios |
| `ordens_servico` | Atendimentos | FK `veiculoId` → veiculos; `status` ENUM; CHECK `valor >= 0` |

**Relacionamentos 1:N**

- 1 proprietário → N veículos  
- 1 veículo → N ordens de serviço  

`usuarios` não se liga por FK às demais entidades neste modelo (só autenticação/autorização).

**Persistência:** schema criado por **migrations Sequelize** (`backend/src/migrations/`). O script SQL em `docs/` é referência de entrega, não o fluxo operacional.

---

## 5. Regras de segurança e negócio (resumo)

| Regra | Como está no projeto |
|-------|----------------------|
| Senha | Hash com **bcrypt**; nunca texto puro no banco |
| Sessão | **JWT** assinado com `JWT_SECRET`; validade **30m** (`expiresIn: '30m'`) |
| Token no cliente | Guardado em `sessionStorage`; Axios envia `Authorization: Bearer …` |
| Segredos | Em `.env` (não versionar valores reais); usar `.env.example` como modelo |
| CPF | Existe no banco; **excluído** das listagens/respostas (`attributes.exclude` / `semCpf`) |
| CORS | Origem permitida = `FRONTEND_ORIGIN` (ex.: `http://localhost:5173`) |
| Base da API | Prefixo `/api` — ex.: `http://localhost:3001/api` |

### RBAC (controle por perfil) — resumido

Middlewares: `autenticar` (JWT válido?) → `autorizarPerfil(...)` (perfil permitido?).

| Ação | admin | atendente | tecnico |
|------|:-----:|:---------:|:-------:|
| Login | sim | sim | sim |
| CRUD proprietários / veículos (exceto delete) | sim | sim | não |
| Excluir proprietário / veículo / ordem | sim | não | não |
| Criar / atualizar dados da ordem | sim | sim | não |
| Listar ordens + atualizar **status** | sim | sim | sim |

---

## 6. Endpoints principais

Base: `http://localhost:3001/api`

### Públicos (sem JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check (`{ ok: true }`) |
| POST | `/auth/login` | Body: `{ email, senha }` → token JWT + dados básicos |

### Protegidos (JWT obrigatório)

**Proprietários** — perfis: admin, atendente (delete: só admin)

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/proprietarios` | Busca opcional `?q=` ou `?nome=` (nome ou email); **sem CPF** |
| GET | `/proprietarios/:id` | Sem CPF na resposta |
| POST | `/proprietarios` | Cadastro |
| PUT/PATCH | `/proprietarios/:id` | Atualização |
| DELETE | `/proprietarios/:id` | Só admin |

**Veículos** — perfis: admin, atendente (delete: só admin)

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/veiculos` | Lista (inclui dados do proprietário sem CPF) |
| GET | `/veiculos/:id` | Detalhe |
| POST | `/veiculos` | Exige proprietário existente |
| PUT/PATCH | `/veiculos/:id` | Atualização |
| DELETE | `/veiculos/:id` | Só admin |

**Ordens de serviço**

| Método | Rota | Quem | Notas |
|--------|------|------|-------|
| GET | `/ordens-servico` | admin, atendente, tecnico | Lista com veículo + proprietário (sem CPF) |
| GET | `/ordens-servico/:id` | admin, atendente, tecnico | Detalhe |
| POST | `/ordens-servico` | admin, atendente | Cadastro ligado a veículo |
| PUT/PATCH | `/ordens-servico/:id` | admin, atendente | Atualização de dados |
| PATCH | `/ordens-servico/:id/status` | admin, atendente, tecnico | Atualiza só o status |
| DELETE | `/ordens-servico/:id` | só admin | Exclusão |

Sem token (ou token inválido/expirado) nas rotas protegidas → **HTTP 401**.  
Perfil sem permissão → **HTTP 403** (middleware `autorizarPerfil`).

---

## 7. Frontend (comportamento)

- Tela de **login** → grava token (e dados do usuário) no `sessionStorage`
- **Dashboard** com componentes: Proprietários, Veículos, Ordens de Serviço
- Cadastros na UI, busca de proprietários e atualização de status
- URL da API via `VITE_API_URL` (ex.: `http://localhost:3001/api`)

---

## 8. Dados de demonstração

Popular o banco (caminho oficial):

```powershell
cd backend
npm run seed
```

Usuários demo (senha de demonstração usada no seed — ver README; não colocar segredos de produção aqui):

- `admin@email.com`
- `atendente@email.com`
- `tecnico@email.com`

O seed é reexecutável sem duplicar (estratégia `findOrCreate` por email/placa/chave estável da ordem).

---

## 9. Decisões técnicas (para a banca)

1. **Uma** estratégia de persistência: **Sequelize** (models, migrations, seed).  
2. SQL em `docs/schema_referencia.sql` = entrega didática (RF11), não substitui migrations.  
3. Segredos só em `.env`; repositório leva `.env.example` (RF10).  
4. API primeiro (testável no Postman); React consome o mesmo contrato via Axios.
