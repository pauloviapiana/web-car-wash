import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizarPerfil } from '../middlewares/autorizar.js';
import {
  listar as listarProprietarios,
  buscarPorId as buscarProprietario,
  criar as criarProprietario,
  atualizar as atualizarProprietario,
  excluir as excluirProprietario,
} from '../controllers/proprietariosController.js';
import {
  listar as listarVeiculos,
  buscarPorId as buscarVeiculo,
  criar as criarVeiculo,
  atualizar as atualizarVeiculo,
  excluir as excluirVeiculo,
} from '../controllers/veiculosController.js';
import {
  listar as listarOrdensServico,
  buscarPorId as buscarOrdemServico,
  criar as criarOrdemServico,
  atualizar as atualizarOrdemServico,
  atualizarStatus as atualizarStatusOrdemServico,
  excluir as excluirOrdemServico,
} from '../controllers/ordensServicoController.js';

const router = Router();

// Atalhos didáticos de perfil (evitam repetir a mesma lista em toda rota)
const adminAtendente = autorizarPerfil('admin', 'atendente');
const soAdmin = autorizarPerfil('admin');
const adminAtendenteTecnico = autorizarPerfil('admin', 'atendente', 'tecnico');

// Rotas públicas (sem JWT)
router.get('/health', (req, res) => {
  res.json({ ok: true });
});

router.post('/auth/login', login);

// --- Proprietários: admin + atendente; exclusão só admin ---
router.get('/proprietarios', autenticar, adminAtendente, listarProprietarios);
router.get('/proprietarios/:id', autenticar, adminAtendente, buscarProprietario);
router.post('/proprietarios', autenticar, adminAtendente, criarProprietario);
router.put('/proprietarios/:id', autenticar, adminAtendente, atualizarProprietario);
router.patch('/proprietarios/:id', autenticar, adminAtendente, atualizarProprietario);
router.delete('/proprietarios/:id', autenticar, soAdmin, excluirProprietario);

// --- Veículos: admin + atendente; exclusão só admin ---
router.get('/veiculos', autenticar, adminAtendente, listarVeiculos);
router.get('/veiculos/:id', autenticar, adminAtendente, buscarVeiculo);
router.post('/veiculos', autenticar, adminAtendente, criarVeiculo);
router.put('/veiculos/:id', autenticar, adminAtendente, atualizarVeiculo);
router.patch('/veiculos/:id', autenticar, adminAtendente, atualizarVeiculo);
router.delete('/veiculos/:id', autenticar, soAdmin, excluirVeiculo);

// --- Ordens: técnico lista + status; criar/atualizar dados = admin/atendente; delete = admin ---
router.get('/ordens-servico', autenticar, adminAtendenteTecnico, listarOrdensServico);
router.get('/ordens-servico/:id', autenticar, adminAtendenteTecnico, buscarOrdemServico);
router.post('/ordens-servico', autenticar, adminAtendente, criarOrdemServico);
router.put('/ordens-servico/:id', autenticar, adminAtendente, atualizarOrdemServico);
router.patch('/ordens-servico/:id', autenticar, adminAtendente, atualizarOrdemServico);
router.patch(
  '/ordens-servico/:id/status',
  autenticar,
  adminAtendenteTecnico,
  atualizarStatusOrdemServico
);
router.delete('/ordens-servico/:id', autenticar, soAdmin, excluirOrdemServico);

export default router;
