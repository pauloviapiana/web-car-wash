import { OrdemServico, Proprietario, Veiculo } from '../models/index.js';
import { responderSeErroSequelize } from '../utils/errosSequelize.js';

const STATUS_VALIDOS = ['aberto', 'em_andamento', 'concluido', 'cancelado'];

const includeVeiculoComProprietario = {
  model: Veiculo,
  as: 'veiculo',
  include: [
    {
      model: Proprietario,
      as: 'proprietario',
      attributes: { exclude: ['cpf'] },
    },
  ],
};

export async function listar(req, res) {
  try {
    const ordens = await OrdemServico.findAll({
      include: [includeVeiculoComProprietario],
      order: [['dataEntrada', 'DESC']],
    });

    return res.json(ordens);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar ordens de serviço',
    });
  }
}

export async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const ordem = await OrdemServico.findByPk(id, {
      include: [includeVeiculoComProprietario],
    });

    if (!ordem) {
      return res.status(404).json({
        mensagem: 'Ordem de serviço não encontrada',
      });
    }

    return res.json(ordem);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao buscar ordem de serviço',
    });
  }
}

export async function criar(req, res) {
  try {
    const { descricao, tipoServico, valor, veiculoId } = req.body;

    if (!descricao || !tipoServico || !veiculoId) {
      return res.status(400).json({
        mensagem: 'Preencha descricao, tipoServico e veiculoId',
      });
    }

    const veiculo = await Veiculo.findByPk(veiculoId);

    if (!veiculo) {
      return res.status(404).json({
        mensagem: 'Veículo não encontrado',
      });
    }

    const ordem = await OrdemServico.create({
      descricao,
      tipoServico,
      valor: valor ?? 0,
      veiculoId,
    });

    return res.status(201).json(ordem);
  } catch (error) {
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao criar ordem de serviço',
    });
  }
}

/**
 * Atualiza dados básicos (descricao, tipoServico, valor, veiculoId).
 * Status NÃO muda aqui — use PATCH /ordens-servico/:id/status.
 */
export async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { descricao, tipoServico, valor, veiculoId, status } = req.body;

    if (status !== undefined) {
      return res.status(400).json({
        mensagem:
          'Para alterar o status, use PATCH /api/ordens-servico/:id/status',
      });
    }

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: 'Ordem de serviço não encontrada',
      });
    }

    if (veiculoId !== undefined) {
      const veiculo = await Veiculo.findByPk(veiculoId);

      if (!veiculo) {
        return res.status(404).json({
          mensagem: 'Veículo não encontrado',
        });
      }

      ordem.veiculoId = veiculoId;
    }

    if (descricao !== undefined) ordem.descricao = descricao;
    if (tipoServico !== undefined) ordem.tipoServico = tipoServico;
    if (valor !== undefined) ordem.valor = valor;

    await ordem.save();
    await ordem.reload({ include: [includeVeiculoComProprietario] });

    return res.json(ordem);
  } catch (error) {
    if (responderSeErroSequelize(res, error)) return;
    return res.status(500).json({
      mensagem: 'Erro ao atualizar ordem de serviço',
    });
  }
}

export async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        mensagem: 'Informe o status',
      });
    }

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        mensagem:
          'Status inválido. Use: aberto, em_andamento, concluido ou cancelado',
      });
    }

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: 'Ordem de serviço não encontrada',
      });
    }

    ordem.status = status;
    await ordem.save();

    return res.json(ordem);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao atualizar status da ordem de serviço',
    });
  }
}

/** Exclusão permitida (sem trava extra neste material). */
export async function excluir(req, res) {
  try {
    const { id } = req.params;

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: 'Ordem de serviço não encontrada',
      });
    }

    await ordem.destroy();

    return res.json({
      mensagem: 'Ordem de serviço excluída com sucesso',
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao excluir ordem de serviço',
    });
  }
}
