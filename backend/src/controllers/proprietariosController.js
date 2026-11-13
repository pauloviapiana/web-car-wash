import { Proprietario } from '../models/index.js';

export async function listar(req, res) {
  try {
    const proprietarios = await Proprietario.findAll({
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

    const dados = proprietario.toJSON();
    delete dados.cpf;

    return res.status(201).json(dados);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao criar proprietário',
    });
  }
}
