import { Op } from 'sequelize';
import { Proprietario, Veiculo } from '../models/index.js';
import { responderSeErroSequelize } from '../utils/errosSequelize.js';

/** Remove CPF antes de devolver ao cliente. */
function semCpf(proprietario) {
  const dados = proprietario.toJSON ? proprietario.toJSON() : { ...proprietario };
  delete dados.cpf;
  return dados;
}

/**
 * Lista proprietários. Com ?q= ou ?nome=, filtra por nome OU email (RF04).
 * CPF nunca retorna na listagem.
 */
export async function listar(req, res) {
  try {
    const termo = String(req.query.q || req.query.nome || '').trim();

    const where = {};

    if (termo) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${termo}%` } },
        { email: { [Op.iLike]: `%${termo}%` } },
      ];
    }

    const proprietarios = await Proprietario.findAll({
      where,
      attributes: { exclude: ['cpf'] },
      order: [['id', 'ASC']],
    });

    return res.json(proprietarios);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar proprietários',
    });
  }
}

export async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const proprietario = await Proprietario.findByPk(id, {
      attributes: { exclude: ['cpf'] },
    });

    if (!proprietario) {
      return res.status(404).json({
        mensagem: 'Proprietário não encontrado',
      });
    }

    return res.json(proprietario);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar proprietário',
    });
  }
}

export async function criar(req, res) {
  try {
    const { nome, email, telefone, cpf } = req.body;

    if (!nome || !email || !telefone || !cpf) {
      return res.status(400).json({
        mensagem: 'Preencha nome, email, telefone e cpf',
      });
    }

    const proprietario = await Proprietario.create({
      nome,
      email,
      telefone,
      cpf,
    });

    return res.status(201).json(semCpf(proprietario));
  } catch (error) {
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao criar proprietário',
    });
  }
}

/**
 * Atualiza campos enviados no body (nome, email, telefone, cpf).
 * Usado por PUT e PATCH na mesma rota.
 */
export async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf } = req.body;

    const proprietario = await Proprietario.findByPk(id);

    if (!proprietario) {
      return res.status(404).json({
        mensagem: 'Proprietário não encontrado',
      });
    }

    if (nome !== undefined) proprietario.nome = nome;
    if (email !== undefined) proprietario.email = email;
    if (telefone !== undefined) proprietario.telefone = telefone;
    if (cpf !== undefined) proprietario.cpf = cpf;

    await proprietario.save();

    return res.json(semCpf(proprietario));
  } catch (error) {
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao atualizar proprietário',
    });
  }
}

/**
 * Só exclui se o proprietário NÃO tiver veículos vinculados.
 */
export async function excluir(req, res) {
  try {
    const { id } = req.params;

    const proprietario = await Proprietario.findByPk(id);

    if (!proprietario) {
      return res.status(404).json({
        mensagem: 'Proprietário não encontrado',
      });
    }

    const qtdVeiculos = await Veiculo.count({
      where: { proprietarioId: id },
    });

    if (qtdVeiculos > 0) {
      return res.status(409).json({
        mensagem:
          'Não é possível excluir: proprietário possui veículos vinculados',
      });
    }

    await proprietario.destroy();

    return res.json({
      mensagem: 'Proprietário excluído com sucesso',
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao excluir proprietário',
    });
  }
}
