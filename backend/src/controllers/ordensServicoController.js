import { OrdemServico, Proprietario, Veiculo } from '../models/index.js';

const STATUS_VALIDOS = ['aberto', 'em_andamento', 'concluido', 'cancelado'];

export async function listar(req, res) {
  try {
    const ordens = await OrdemServico.findAll({
      include: [
        {
          model: Veiculo,
          as: 'veiculo',
          include: [
            {
              model: Proprietario,
              as: 'proprietario',
              attributes: { exclude: ['cpf'] },
            },
          ],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(ordens);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao listar ordens de serviço',
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
    return res.status(500).json({
      mensagem: 'Erro ao criar ordem de serviço',
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
