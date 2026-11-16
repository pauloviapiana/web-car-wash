# Checklist de conclusão — Gestão Automotiva

Checklist baseado na **seção 14** do material da aula e nos itens de entrega (RF10–RF12 + pacote).  
Marcação conforme o estado **real do repositório** após as Fases 1–9 e a documentação da Fase 10.

Legenda: `[x]` pronto no código/artefatos · `[ ]` ainda não feito (não implementar aqui se for Fase 11).

---

## 1. Banco e persistência

- [x] Banco com quatro tabelas (`usuarios`, `proprietarios`, `veiculos`, `ordens_servico`), chaves primárias e estrangeiras (migrations Sequelize)
- [x] Backend conecta ao PostgreSQL (`sequelize.authenticate()` em `server.js`)
- [x] Uma única estratégia de persistência de ponta a ponta: **Sequelize**
- [x] Models e associações implementados (`backend/src/models/`)
- [x] Seed com pelo menos três registros por tabela (`npm run seed`, reexecutável sem duplicar)

---

## 2. Segurança e autenticação (RF01, RF02, RF10)

- [x] Senhas armazenadas com **bcrypt**
- [x] Login e **JWT** funcionando (expiração **30m**)
- [x] Rotas protegidas com middleware `autenticar`
- [x] CPF **fora** das listagens / respostas de listagem
- [x] Segredos em `.env` (não documentar valores reais no Git)
- [x] `backend/.env.example` presente (modelo sem segredos)
- [x] `frontend/.env.example` presente (`VITE_API_URL`)

---

## 3. API de negócio (RF04–RF09)

- [x] Cadastro e listagem de proprietários (busca `?q=` / `?nome=`)
- [x] Cadastro e listagem de veículos (vínculo a proprietário)
- [x] Ordens de serviço vinculadas aos veículos
- [x] Listagens apresentam relacionamentos (veículo + proprietário, sem CPF)
- [x] Atualização de status da ordem (`PATCH /ordens-servico/:id/status`)
- [x] RBAC por perfil (`autorizarPerfil`) — além do mínimo da aula, já no projeto

---

## 4. Frontend (Fases 7–9)

- [x] Frontend React consumindo a API por **Axios** (interceptor JWT + `sessionStorage`)
- [x] Login com nome do usuário e botão **Sair**
- [x] Dashboard com as listagens principais (Proprietários, Veículos, Ordens)
- [x] Cadastros na UI (proprietários, veículos, ordens)
- [x] Busca de proprietários na UI
- [x] Atualização de status na UI
- [x] Estados de carregamento e mensagem de erro nas telas principais

---

## 5. Testes e documentação de entrega (RF11, RF12 + pacote)

- [x] Testes manuais com coleção **Postman**  
      (`backend/postman/Gestao-Automotiva.postman_collection.json`)
- [x] Script SQL de referência com CREATE + ≥ 3 INSERTs por tabela  
      (`docs/schema_referencia.sql`)
- [x] DER compatível com o banco (`docs/DER.md` — Mermaid)
- [x] Documentação do projeto (`docs/DOCUMENTACAO.md`)
- [x] README da raiz com setup executável (`README.md`)
- [x] Este checklist (`docs/CHECKLIST_ENTREGA.md`)

---

## 6. Versão curta (slides da aula)

Itens do checklist compacto dos slides — todos cobertos acima:

- [x] Banco com quatro tabelas, PKs e FKs
- [x] Login e JWT com rotas protegidas
- [x] Cadastros e listagens de proprietários e veículos
- [x] Ordens de serviço vinculadas aos veículos
- [x] Atualização de status funcionando
- [x] Frontend consumindo a API por Axios
- [x] Senhas com bcrypt e CPF fora das listagens
- [x] Documentação e DER compatíveis com o banco

---

## 7. Fora do escopo desta entrega (Fase 11 — NÃO implementar agora)

Marcado como pendente de propósito; não bloqueia o MVP da aula:

- [ ] Validação de entrada com Zod (ou similar)
- [ ] Rate limit / tratamento centralizado de erros mais completo
- [ ] Criptografia/cifra de CPF em repouso
- [ ] Regras extras citadas no material “melhorias” (ex.: restringir transições de status, transações em operações compostas além do seed)

---

## Observação para a banca

O schema operacional do projeto é criado por **migrations Sequelize** (`npx sequelize-cli db:migrate`).  
O arquivo `docs/schema_referencia.sql` é a entrega didática (RF11), alinhada a essas migrations.
