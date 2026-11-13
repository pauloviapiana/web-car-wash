import { Router } from 'express';
import {
  listar as listarProprietarios,
  criar as criarProprietario,
} from '../controllers/proprietariosController.js';
import {
  listar as listarVeiculos,
  criar as criarVeiculo,
} from '../controllers/veiculosController.js';
import {
  listar as listarOrdensServico,
  criar as criarOrdemServico,
  atualizarStatus as atualizarStatusOrdemServico,
} from '../controllers/ordensServicoController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Temporárias (sem auth) — só para testar a Fase 3
router.get('/proprietarios', listarProprietarios);
router.post('/proprietarios', criarProprietario);

router.get('/veiculos', listarVeiculos);
router.post('/veiculos', criarVeiculo);

router.get('/ordens-servico', listarOrdensServico);
router.post('/ordens-servico', criarOrdemServico);
router.patch('/ordens-servico/:id/status', atualizarStatusOrdemServico);

export default router;
