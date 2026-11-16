# Gestão Automotiva

Sistema web para oficina / lava-car: login, proprietários, veículos e ordens de serviço.

Monorepo: **backend** (Node.js + Express + Sequelize + PostgreSQL) e **frontend** (Vite + React + Axios).

Documentação detalhada: [`docs/DOCUMENTACAO.md`](docs/DOCUMENTACAO.md) · DER: [`docs/DER.md`](docs/DER.md) · SQL de referência: [`docs/schema_referencia.sql`](docs/schema_referencia.sql)

---

## Pré-requisitos

- Node.js (LTS) e npm
- PostgreSQL instalado e em execução
- Conta/usuário do PostgreSQL (ex.: `postgres`)

Comandos abaixo são para **PowerShell** no Windows.

---

## Como subir o projeto (ordem sugerida)

### 1) Criar o banco

No `psql` ou em outra ferramenta PostgreSQL:

```sql
CREATE DATABASE gestao_automotiva;
```

### 2) Configurar o backend (`.env`)

```powershell
cd backend
copy .env.example .env
```

Edite `backend/.env` e preencha `DB_PASSWORD` e `JWT_SECRET` com os **seus** valores.  
Não versionar o arquivo `.env` (só o `.env.example`).

### 3) Instalar dependências do backend

```powershell
cd backend
npm install
```

### 4) Rodar as migrations (criar as 4 tabelas)

Ainda em `backend/` (usa `.sequelizerc` + `src/config/config.cjs`):

```powershell
npx sequelize-cli db:migrate
```

### 5) Popular dados de demonstração (seed)

```powershell
npm run seed
```

Reexecutável sem duplicar registros (`findOrCreate`).

### 6) Subir o backend

```powershell
npm run dev
```

API em `http://localhost:3001` (rotas sob `/api`).  
CORS espera o frontend em `http://localhost:5173` (`FRONTEND_ORIGIN`).

### 7) Configurar e subir o frontend

Em **outro** terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (em geral `http://localhost:5173`).

---

## Usuários demo (após o seed)

| E-mail | Perfil | Senha demo |
|--------|--------|------------|
| `admin@email.com` | admin | `123456` |
| `atendente@email.com` | atendente | `123456` |
| `tecnico@email.com` | tecnico | `123456` |

Senhas no banco são **hash bcrypt** (o seed gera o hash). Em produção, use senhas fortes e outro `JWT_SECRET`.

---

## Estrutura do repositório

```
web-car-wash/
├── backend/          # API Express + Sequelize + migrations + seed + Postman
├── frontend/         # React (Vite) + Axios
├── docs/             # Documentação, DER, SQL de referência, checklist
└── README.md         # este arquivo
```

---

## Testar a API (Postman)

Importe `backend/postman/Gestao-Automotiva.postman_collection.json` no Postman (base: `http://localhost:3001/api`).

---

## Segurança (RF10)

- Segredos (`DB_PASSWORD`, `JWT_SECRET`, etc.) ficam só no `.env` local.
- O Git deve receber `.env.example` (modelo), **não** o `.env` com valores reais.
