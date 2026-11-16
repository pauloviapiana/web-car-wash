-- =============================================================================
-- Gestão Automotiva — Script SQL de REFERÊNCIA (entrega didática / RF11)
-- =============================================================================
-- Este arquivo NÃO é a fonte de verdade do projeto.
--
-- Fonte de verdade (o que o app realmente usa):
--   backend/src/migrations/*.cjs  → aplicadas com Sequelize CLI
--   backend: npm run seed        → popular dados com bcrypt real (caminho oficial)
--
-- Este script existe para:
--   - mostrar o modelo de dados em SQL “puro” (PostgreSQL)
--   - cumprir RF11 (≥ 3 registros de exemplo por tabela)
--   - apoiar a apresentação e a documentação (RF12)
--
-- Ordem das tabelas (respeita FKs):
--   1) usuarios
--   2) proprietarios
--   3) veiculos        (FK → proprietarios)
--   4) ordens_servico  (FK → veiculos)
--
-- Nomes de colunas em camelCase (ex.: "createdAt") ficam entre aspas duplas,
-- como o Sequelize cria no PostgreSQL.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) usuarios
-- ---------------------------------------------------------------------------
CREATE TYPE "enum_usuarios_perfil" AS ENUM ('admin', 'atendente', 'tecnico');

CREATE TABLE "usuarios" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(120) NOT NULL,
  "email" VARCHAR(160) NOT NULL UNIQUE,
  "senha" VARCHAR(255) NOT NULL,
  "perfil" "enum_usuarios_perfil" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2) proprietarios
-- ---------------------------------------------------------------------------
CREATE TABLE "proprietarios" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(120) NOT NULL,
  "email" VARCHAR(160) NOT NULL UNIQUE,
  "telefone" VARCHAR(20) NOT NULL,
  "cpf" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ---------------------------------------------------------------------------
-- 3) veiculos  (1 proprietário → N veículos)
-- ---------------------------------------------------------------------------
CREATE TABLE "veiculos" (
  "id" SERIAL PRIMARY KEY,
  "marca" VARCHAR(80) NOT NULL,
  "modelo" VARCHAR(100) NOT NULL,
  "placa" VARCHAR(10) NOT NULL UNIQUE,
  "ano" INTEGER NULL,
  "cor" VARCHAR(40) NULL,
  "proprietarioId" INTEGER NOT NULL
    REFERENCES "proprietarios" ("id")
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ---------------------------------------------------------------------------
-- 4) ordens_servico  (1 veículo → N ordens)
-- ---------------------------------------------------------------------------
CREATE TYPE "enum_ordens_servico_status" AS ENUM (
  'aberto',
  'em_andamento',
  'concluido',
  'cancelado'
);

CREATE TABLE "ordens_servico" (
  "id" SERIAL PRIMARY KEY,
  "dataEntrada" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "descricao" VARCHAR(255) NOT NULL,
  "tipoServico" VARCHAR(100) NOT NULL,
  "valor" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "status" "enum_ordens_servico_status" NOT NULL DEFAULT 'aberto',
  "veiculoId" INTEGER NOT NULL
    REFERENCES "veiculos" ("id")
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT ordens_servico_valor_gte_0 CHECK ("valor" >= 0)
);

-- =============================================================================
-- DADOS DE EXEMPLO (≥ 3 registros por tabela) — RF11
-- =============================================================================
-- Alinhados ao seed Node (backend/src/seeders/seed.js) para a apresentação
-- bater com o que o sistema demo já mostra.
--
-- SENHAS (usuarios."senha"):
--   No banco NUNCA guardamos a senha em texto puro (ex.: 123456).
--   Guardamos um HASH bcrypt (texto longo que começa com $2b$...).
--
--   Abaixo usamos UM hash bcrypt de exemplo correspondente à senha demo
--   "123456", só para o SQL de entrega ficar completo e legível.
--
--   Caminho CORRETO no projeto real:
--     cd backend
--     npm run seed
--   O seed gera o hash com a biblioteca bcrypt e ainda evita duplicar
--   registros (findOrCreate). Prefira sempre o seed Node no dia a dia.
--
-- Reexecução com cuidado:
--   - usuarios / proprietarios / veiculos: ON CONFLICT DO NOTHING
--     (respeita UNIQUE de email/placa)
--   - ordens_servico: INSERT só se ainda não existir o mesmo
--     (descricao + veiculoId), espelhando a lógica do seed
--   - Os IDs 1, 2, 3 abaixo pressupõem tabelas vazias (banco limpo de demo).
--     Se o banco já tiver dados, use npm run seed em vez deste SQL.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- INSERTS: usuarios (3)
-- ---------------------------------------------------------------------------
INSERT INTO "usuarios" ("nome", "email", "senha", "perfil", "createdAt", "updatedAt")
VALUES
  (
    'Admin Demo',
    'admin@email.com',
    '$2b$10$Rcbtvn1YvkDROJojf7M/e.onXh/8LCCrbz3oLIXhghzVvyGLYBr36',
    'admin',
    NOW(),
    NOW()
  ),
  (
    'Atendente Demo',
    'atendente@email.com',
    '$2b$10$Rcbtvn1YvkDROJojf7M/e.onXh/8LCCrbz3oLIXhghzVvyGLYBr36',
    'atendente',
    NOW(),
    NOW()
  ),
  (
    'Técnico Demo',
    'tecnico@email.com',
    '$2b$10$Rcbtvn1YvkDROJojf7M/e.onXh/8LCCrbz3oLIXhghzVvyGLYBr36',
    'tecnico',
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO NOTHING;

-- ---------------------------------------------------------------------------
-- INSERTS: proprietarios (3)
-- ---------------------------------------------------------------------------
INSERT INTO "proprietarios" ("nome", "email", "telefone", "cpf", "createdAt", "updatedAt")
VALUES
  ('Ana Souza', 'ana.souza@demo.com', '11990001111', '11122233344', NOW(), NOW()),
  ('Bruno Lima', 'bruno.lima@demo.com', '11990002222', '22233344455', NOW(), NOW()),
  ('Carla Mendes', 'carla.mendes@demo.com', '11990003333', '33344455566', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- ---------------------------------------------------------------------------
-- INSERTS: veiculos (3) — FK proprietarioId = 1, 2, 3 (banco limpo de demo)
-- ---------------------------------------------------------------------------
INSERT INTO "veiculos" (
  "marca", "modelo", "placa", "ano", "cor", "proprietarioId", "createdAt", "updatedAt"
)
VALUES
  ('Volkswagen', 'Gol', 'ABC1D23', 2018, 'Prata', 1, NOW(), NOW()),
  ('Fiat', 'Argo', 'EFG4H56', 2021, 'Branco', 2, NOW(), NOW()),
  ('Chevrolet', 'Onix', 'IJK7L89', 2020, 'Preto', 3, NOW(), NOW())
ON CONFLICT ("placa") DO NOTHING;

-- ---------------------------------------------------------------------------
-- INSERTS: ordens_servico (3) — FK veiculoId = 1, 2, 3 (banco limpo de demo)
-- ---------------------------------------------------------------------------
INSERT INTO "ordens_servico" (
  "descricao", "tipoServico", "valor", "status", "veiculoId", "createdAt", "updatedAt"
)
SELECT
  v.descricao,
  v."tipoServico",
  v.valor,
  v.status::"enum_ordens_servico_status",
  v."veiculoId",
  NOW(),
  NOW()
FROM (
  VALUES
    (
      'Lavagem completa externa e interna — demo seed',
      'lava-car',
      90.00,
      'aberto',
      1
    ),
    (
      'Lavagem completa externa e interna — demo seed',
      'lava-car',
      90.00,
      'em_andamento',
      2
    ),
    (
      'Lavagem completa externa e interna — demo seed',
      'lava-car',
      90.00,
      'concluido',
      3
    )
) AS v(descricao, "tipoServico", valor, status, "veiculoId")
WHERE NOT EXISTS (
  SELECT 1
  FROM "ordens_servico" o
  WHERE o."descricao" = v.descricao
    AND o."veiculoId" = v."veiculoId"
);

-- =============================================================================
-- Lembrete final
-- Popular o banco do projeto no dia a dia:
--   cd backend
--   npm run seed
-- =============================================================================
