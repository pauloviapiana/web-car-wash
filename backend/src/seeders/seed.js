/**
 * Seed de demonstração — Fase 6
 *
 * Dados: usuários + proprietários + veículos + ordens de serviço.
 * Próximo passo de tooling: script npm run seed (Passo 9).
 *
 * Uso (depois que o script npm existir — Passo 9):
 *   npm run seed
 *
 * Por agora você pode testar com:
 *   node src/seeders/seed.js
 * (rodando de dentro da pasta backend/)
 */
import bcrypt from 'bcrypt';
import {
  sequelize,
  Usuario,
  Proprietario,
  Veiculo,
  OrdemServico,
} from '../models/index.js';

const SALT_ROUNDS = 10;
const SENHA_DEMO = '123456'; // só usada para gerar o hash — nunca gravamos texto puro

async function seed() {
  try {
    // 1) Confere se o PostgreSQL aceita a conexão (usuário/senha/banco do .env)
    await sequelize.authenticate();
    console.log('Conexão com o banco OK.');

    // 2) Abre uma transação: tudo dentro dela é "um pacote"
    //    - sucesso → commit (grava de verdade)
    //    - erro    → rollback (desfaz o pacote)
    await sequelize.transaction(async (t) => {
      // Hash UMA vez; os 3 usuários demo compartilham a mesma senha de demonstração
      const senhaHash = await bcrypt.hash(SENHA_DEMO, SALT_ROUNDS);

      const usuariosDemo = [
        {
          nome: 'Admin Demo',
          email: 'admin@email.com',
          perfil: 'admin',
        },
        {
          nome: 'Atendente Demo',
          email: 'atendente@email.com',
          perfil: 'atendente',
        },
        {
          nome: 'Técnico Demo',
          email: 'tecnico@email.com',
          perfil: 'tecnico',
        },
      ];

      console.log('Semeando usuários...');

      for (const dados of usuariosDemo) {
        // where = "como reconheço se já existe" (unicidade por email)
        // defaults = "o que preencher só se for criar"
        const [usuario, criado] = await Usuario.findOrCreate({
          where: { email: dados.email },
          defaults: {
            nome: dados.nome,
            email: dados.email,
            senha: senhaHash,
            perfil: dados.perfil,
          },
          transaction: t,
        });

        console.log(
          `  ${criado ? 'criado' : 'já existia'}: ${usuario.email} (${usuario.perfil})`
        );
      }

      // --- Proprietários (unicidade por email) ---
      // Guardamos os registros em um mapa para, no próximo passo, ligar veículos a eles.
      const proprietariosDemo = [
        {
          nome: 'Ana Souza',
          email: 'ana.souza@demo.com',
          telefone: '11990001111',
          cpf: '11122233344',
        },
        {
          nome: 'Bruno Lima',
          email: 'bruno.lima@demo.com',
          telefone: '11990002222',
          cpf: '22233344455',
        },
        {
          nome: 'Carla Mendes',
          email: 'carla.mendes@demo.com',
          telefone: '11990003333',
          cpf: '33344455566',
        },
      ];

      console.log('Semeando proprietários...');
      const proprietariosPorEmail = {};

      for (const dados of proprietariosDemo) {
        const [proprietario, criado] = await Proprietario.findOrCreate({
          where: { email: dados.email },
          defaults: {
            nome: dados.nome,
            email: dados.email,
            telefone: dados.telefone,
            cpf: dados.cpf,
          },
          transaction: t,
        });

        proprietariosPorEmail[dados.email] = proprietario;
        console.log(
          `  ${criado ? 'criado' : 'já existia'}: ${proprietario.email} (${proprietario.nome})`
        );
      }

      // --- Veículos (unicidade por placa; FK → proprietarioId) ---
      const veiculosDemo = [
        {
          marca: 'Volkswagen',
          modelo: 'Gol',
          placa: 'ABC1D23',
          ano: 2018,
          cor: 'Prata',
          emailProprietario: 'ana.souza@demo.com',
        },
        {
          marca: 'Fiat',
          modelo: 'Argo',
          placa: 'EFG4H56',
          ano: 2021,
          cor: 'Branco',
          emailProprietario: 'bruno.lima@demo.com',
        },
        {
          marca: 'Chevrolet',
          modelo: 'Onix',
          placa: 'IJK7L89',
          ano: 2020,
          cor: 'Preto',
          emailProprietario: 'carla.mendes@demo.com',
        },
      ];

      console.log('Semeando veículos...');
      const veiculosPorPlaca = {};

      for (const dados of veiculosDemo) {
        const proprietario = proprietariosPorEmail[dados.emailProprietario];

        const [veiculo, criado] = await Veiculo.findOrCreate({
          where: { placa: dados.placa },
          defaults: {
            marca: dados.marca,
            modelo: dados.modelo,
            placa: dados.placa,
            ano: dados.ano,
            cor: dados.cor,
            proprietarioId: proprietario.id,
          },
          transaction: t,
        });

        veiculosPorPlaca[dados.placa] = veiculo;
        console.log(
          `  ${criado ? 'criado' : 'já existia'}: ${veiculo.placa} → proprietário ${proprietario.email}`
        );
      }

      // --- Ordens de serviço (unicidade estável: descricao + veiculoId) ---
      // Todas lava-car; status variados para a demo.
      const ordensDemo = [
        {
          placa: 'ABC1D23',
          descricao: 'Lavagem completa externa e interna — demo seed',
          tipoServico: 'lava-car',
          valor: 90.0,
          status: 'aberto',
        },
        {
          placa: 'EFG4H56',
          descricao: 'Lavagem completa externa e interna — demo seed',
          tipoServico: 'lava-car',
          valor: 90.0,
          status: 'em_andamento',
        },
        {
          placa: 'IJK7L89',
          descricao: 'Lavagem completa externa e interna — demo seed',
          tipoServico: 'lava-car',
          valor: 90.0,
          status: 'concluido',
        },
      ];

      console.log('Semeando ordens de serviço...');

      for (const dados of ordensDemo) {
        const veiculo = veiculosPorPlaca[dados.placa];

        const [ordem, criado] = await OrdemServico.findOrCreate({
          where: {
            descricao: dados.descricao,
            veiculoId: veiculo.id,
          },
          defaults: {
            descricao: dados.descricao,
            tipoServico: dados.tipoServico,
            valor: dados.valor,
            status: dados.status,
            veiculoId: veiculo.id,
          },
          transaction: t,
        });

        console.log(
          `  ${criado ? 'criada' : 'já existia'}: [${ordem.status}] ${ordem.tipoServico} — placa ${dados.placa}`
        );
      }
    });

    console.log('Seed de demonstração finalizado com sucesso (commit).');
  } catch (error) {
    // Se algo falhar dentro da transaction, o Sequelize já faz rollback sozinho
    // quando usamos sequelize.transaction(callback).
    console.error('Falha no seed:', error.message);
    process.exitCode = 1;
  } finally {
    // 3) Sempre fecha a conexão, senão o Node pode ficar "pendurado"
    await sequelize.close();
  }
}

seed();
