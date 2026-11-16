import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Converte data ISO da API para formato brasileiro legível.
 * Ex.: 2024-01-15T10:30:00.000Z → 15/01/2024 07:30:00 (fuso local)
 */
function formatarDataEntrada(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString('pt-BR');
}

/**
 * Listagem de ordens de serviço (GET /ordens-servico).
 * - Backend já ordena por dataEntrada DESC
 * - JSON Sequelize aninhado em 2 níveis:
 *     ordem.veiculo?.placa
 *     ordem.veiculo?.proprietario?.nome
 * - Perfis: admin, atendente E tecnico (esta rota o técnico pode ver)
 */
function OrdensServico() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarOrdens() {
      setLoading(true);
      setErro('');

      try {
        const resposta = await api.get('/ordens-servico');
        // Ex.: { id, dataEntrada, descricao, tipoServico, valor, status, veiculo: { placa, proprietario: { nome } } }
        setOrdens(resposta.data);
      } catch (error) {
        const status = error.response?.status;
        const mensagemApi = error.response?.data?.mensagem;

        if (status === 401) {
          setErro(
            mensagemApi ||
              'Sessão expirada ou inválida. Faça login novamente (token vale 30 minutos).'
          );
        } else if (status === 403) {
          setErro(
            mensagemApi ||
              'Seu perfil não tem permissão para ver ordens de serviço (RBAC).'
          );
        } else {
          setErro(mensagemApi || 'Não foi possível carregar as ordens de serviço.');
        }
      } finally {
        setLoading(false);
      }
    }

    carregarOrdens();
  }, []);

  if (loading) {
    return (
      <section className="painel-listagem">
        <h2>Ordens de serviço</h2>
        <p>Carregando...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="painel-listagem">
        <h2>Ordens de serviço</h2>
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      </section>
    );
  }

  if (ordens.length === 0) {
    return (
      <section className="painel-listagem">
        <h2>Ordens de serviço</h2>
        <p>Nenhuma ordem de serviço cadastrada.</p>
      </section>
    );
  }

  return (
    <section className="painel-listagem">
      <h2>Ordens de serviço</h2>
      <ul className="lista-simples">
        {ordens.map((o) => (
          <li key={o.id}>
            <strong>{o.descricao}</strong>
            <span>Tipo: {o.tipoServico}</span>
            <span>Valor: R$ {Number(o.valor).toFixed(2)}</span>
            <span>Status: {o.status}</span>
            {/* 1 nível: placa do veículo */}
            <span>Placa: {o.veiculo?.placa || '—'}</span>
            {/* 2 níveis: dono dentro do veículo */}
            <span>Dono: {o.veiculo?.proprietario?.nome || '—'}</span>
            <span>Entrada: {formatarDataEntrada(o.dataEntrada)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default OrdensServico;
