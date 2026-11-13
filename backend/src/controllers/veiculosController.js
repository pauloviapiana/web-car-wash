import { Proprietario, Veiculo } from '../models/index.js';

export async function listar(req, res) {
  try {
    const veiculos = await Veiculo.findAll({
      include: [
        {
          model: Proprietario,
          as: 'proprietario',
          attributes: { exclude: ['cpf'] },
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(veiculos);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar veículos',
    });
  }
}

export async function criar(req, res) {
  try {
    const { marca, modelo, placa, ano, cor, proprietarioId } = req.body;

    if (!marca || !modelo || !placa || !proprietarioId) {
      return res.status(400).json({
        mensagem: 'Preencha marca, modelo, placa e proprietarioId',
      });
    }

    const proprietario = await Proprietario.findByPk(proprietarioId);

    if (!proprietario) {
      return res.status(404).json({
        mensagem: 'Proprietário não encontrado',
      });
    }

    const veiculo = await Veiculo.create({
      marca,
      modelo,
      placa,
      ano: ano ?? null,
      cor: cor ?? null,
      proprietarioId,
    });

    return res.status(201).json(veiculo);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao criar veículo',
    });
  }
}
