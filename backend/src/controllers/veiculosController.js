import { OrdemServico, Proprietario, Veiculo } from '../models/index.js';
import { responderSeErroSequelize } from '../utils/errosSequelize.js';

const includeProprietario = {
  model: Proprietario,
  as: 'proprietario',
  attributes: { exclude: ['cpf'] },
};

export async function listar(req, res) {
  try {
    const veiculos = await Veiculo.findAll({
      include: [includeProprietario],
      order: [['id', 'ASC']],
    });

    return res.json(veiculos);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar veículos',
    });
  }
}

export async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const veiculo = await Veiculo.findByPk(id, {
      include: [includeProprietario],
    });

    if (!veiculo) {
      return res.status(404).json({
        mensagem: 'Veículo não encontrado',
      });
    }

    return res.json(veiculo);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar veículo',
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
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao criar veículo',
    });
  }
}

/**
 * Atualiza campos enviados (marca, modelo, placa, ano, cor, proprietarioId).
 * PUT e PATCH usam a mesma função.
 */
export async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { marca, modelo, placa, ano, cor, proprietarioId } = req.body;

    const veiculo = await Veiculo.findByPk(id);

    if (!veiculo) {
      return res.status(404).json({
        mensagem: 'Veículo não encontrado',
      });
    }

    if (proprietarioId !== undefined) {
      const proprietario = await Proprietario.findByPk(proprietarioId);

      if (!proprietario) {
        return res.status(404).json({
          mensagem: 'Proprietário não encontrado',
        });
      }

      veiculo.proprietarioId = proprietarioId;
    }

    if (marca !== undefined) veiculo.marca = marca;
    if (modelo !== undefined) veiculo.modelo = modelo;
    if (placa !== undefined) veiculo.placa = placa;
    if (ano !== undefined) veiculo.ano = ano;
    if (cor !== undefined) veiculo.cor = cor;

    await veiculo.save();

    await veiculo.reload({ include: [includeProprietario] });

    return res.json(veiculo);
  } catch (error) {
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao atualizar veículo',
    });
  }
}

/**
 * Só exclui se o veículo NÃO tiver ordens de serviço.
 */
export async function excluir(req, res) {
  try {
    const { id } = req.params;

    const veiculo = await Veiculo.findByPk(id);

    if (!veiculo) {
      return res.status(404).json({
        mensagem: 'Veículo não encontrado',
      });
    }

    const qtdOrdens = await OrdemServico.count({
      where: { veiculoId: id },
    });

    if (qtdOrdens > 0) {
      return res.status(409).json({
        mensagem:
          'Não é possível excluir: veículo possui ordens de serviço vinculadas',
      });
    }

    await veiculo.destroy();

    return res.json({
      mensagem: 'Veículo excluído com sucesso',
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao excluir veículo',
    });
  }
}
