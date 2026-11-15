/**
 * Script da Fase 4 — cria 1 usuário de teste com senha hasheada (bcrypt).
 * Uso (na pasta backend/):
 *   npm run criar-usuario-teste
 *
 * Opcional via .env (não obriga senha no comando):
 *   SEED_NOME, SEED_EMAIL, SEED_SENHA, SEED_PERFIL
 */
import bcrypt from 'bcrypt';
import { sequelize, Usuario } from '../models/index.js';

const SALT_ROUNDS = 10;

const nome = process.env.SEED_NOME || 'Admin Teste';
const email = process.env.SEED_EMAIL || 'admin@email.com';
const senhaPura = process.env.SEED_SENHA || '123456';
const perfil = process.env.SEED_PERFIL || 'admin';

async function criarUsuarioTeste() {
  try {
    await sequelize.authenticate();

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      console.log(`Usuário já existe: ${email} (id ${existente.id}). Nada a fazer.`);
      return;
    }

    const senhaHash = await bcrypt.hash(senhaPura, SALT_ROUNDS);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      perfil,
    });

    console.log('Usuário de teste criado com sucesso:');
    console.log(`  id: ${usuario.id}`);
    console.log(`  nome: ${usuario.nome}`);
    console.log(`  email: ${usuario.email}`);
    console.log(`  perfil: ${usuario.perfil}`);
    console.log('(A senha e o hash NÃO são exibidos.)');
  } catch (error) {
    console.error('Falha ao criar usuário de teste:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

criarUsuarioTeste();
