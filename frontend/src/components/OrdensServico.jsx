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

/** Status EXATOS que a API aceita no PATCH (não invente outros textos) */
const STATUS_OPCOES = [
  { valor: 'aberto', rotulo: 'Aberto' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'concluido', rotulo: 'Concluído' },
  { valor: 'cancelado', rotulo: 'Cancelado' },
];

/**
 * Listagem + cadastro + mudança de status de ordens.
 * - carregarOrdens: GET reutilizável (montagem + após POST/PATCH)
 * - Criar: admin/atendente | Status: admin + atendente + tecnico
 */
function OrdensServico() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Opções do <select> (carros já cadastrados)
  const [opcoesVeiculos, setOpcoesVeiculos] = useState([]);

  // Campos do formulário (controlled)
  const [descricao, setDescricao] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [valor, setValor] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Qual ordem está com PATCH em andamento (desabilita o select daquele item)
  const [atualizandoId, setAtualizandoId] = useState(null);
  const [erroStatus, setErroStatus] = useState('');

  const usuarioSalvo = sessionStorage.getItem('usuario');
  const perfil = usuarioSalvo ? JSON.parse(usuarioSalvo).perfil : null;
  const podeCadastrar = perfil === 'admin' || perfil === 'atendente';
  // Listar + mudar status: os três perfis (quem chegou logado nesta tela)
  const podeMudarStatus =
    perfil === 'admin' || perfil === 'atendente' || perfil === 'tecnico';

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

  // Carrega veículos só para preencher o select (quem pode cadastrar)
  async function carregarOpcoesVeiculos() {
    try {
      const resposta = await api.get('/veiculos');
      setOpcoesVeiculos(resposta.data);
    } catch {
      setOpcoesVeiculos([]);
    }
  }

  useEffect(() => {
    carregarOrdens();
    if (podeCadastrar) {
      carregarOpcoesVeiculos();
    }
  }, []);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroForm('');
    setSucesso('');
    setEnviando(true);

    try {
      // valor omitido → API usa default 0; Number(veiculoId) alinha o tipo do ID
      const corpo = {
        descricao,
        tipoServico,
        veiculoId: Number(veiculoId),
      };
      if (valor !== '') {
        corpo.valor = Number(valor);
      }

      await api.post('/ordens-servico', corpo);

      setDescricao('');
      setTipoServico('');
      setValor('');
      setVeiculoId('');
      setSucesso('Ordem cadastrada.');
      await carregarOrdens();
    } catch (error) {
      setSucesso('');
      const status = error.response?.status;
      const mensagemApi = error.response?.data?.mensagem;

      if (status === 401) {
        setErroForm(
          mensagemApi ||
            'Sessão expirada ou inválida. Faça login novamente.'
        );
      } else if (status === 403) {
        setErroForm(
          mensagemApi ||
            'Seu perfil não tem permissão para cadastrar ordens (RBAC).'
        );
      } else {
        setErroForm(
          mensagemApi || 'Não foi possível cadastrar a ordem de serviço.'
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  // PATCH parcial: só atualiza o status, não recria a ordem
  async function handleMudarStatus(ordemId, novoStatus) {
    setErroStatus('');
    setSucesso('');
    setAtualizandoId(ordemId);

    try {
      await api.patch(`/ordens-servico/${ordemId}/status`, {
        status: novoStatus,
      });
      setSucesso('Status atualizado.');
      await carregarOrdens();
    } catch (error) {
      setSucesso('');
      const statusHttp = error.response?.status;
      const mensagemApi = error.response?.data?.mensagem;

      if (statusHttp === 401) {
        setErroStatus(
          mensagemApi ||
            'Sessão expirada ou inválida. Faça login novamente.'
        );
      } else if (statusHttp === 403) {
        setErroStatus(
          mensagemApi ||
            'Seu perfil não tem permissão para alterar status (RBAC).'
        );
      } else {
        setErroStatus(
          mensagemApi || 'Não foi possível atualizar o status da ordem.'
        );
      }
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <section className="painel-listagem">
      <h2>Ordens de serviço</h2>

      {podeCadastrar && (
        <form className="formulario-cadastro" onSubmit={handleSubmit}>
          <h3>Nova ordem</h3>

          <label htmlFor="os-descricao">Descrição</label>
          <input
            id="os-descricao"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="os-tipo">Tipo de serviço</label>
          <input
            id="os-tipo"
            type="text"
            value={tipoServico}
            onChange={(e) => setTipoServico(e.target.value)}
            disabled={enviando}
            placeholder="Ex.: lavagem, revisão, funilaria"
            required
          />

          <label htmlFor="os-valor">Valor (opcional)</label>
          <input
            id="os-valor"
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={enviando}
            placeholder="Se vazio, a API usa 0"
          />

          <label htmlFor="os-veiculo">Veículo</label>
          <select
            id="os-veiculo"
            value={veiculoId}
            onChange={(e) => setVeiculoId(e.target.value)}
            disabled={enviando}
            required
          >
            <option value="">Selecione o veículo</option>
            {opcoesVeiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.marca} {v.modelo}
                {v.proprietario?.nome ? ` (${v.proprietario.nome})` : ''}
              </option>
            ))}
          </select>

          {erroForm && (
            <p className="mensagem-erro" role="alert">
              {erroForm}
            </p>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>
      )}

      {sucesso && (
        <p className="mensagem-sucesso" role="status">
          {sucesso}
        </p>
      )}

      {loading && <p>Carregando...</p>}

      {!loading && erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!loading && !erro && ordens.length === 0 && (
        <p>Nenhuma ordem de serviço cadastrada.</p>
      )}

      {erroStatus && (
        <p className="mensagem-erro" role="alert">
          {erroStatus}
        </p>
      )}

      {!loading && !erro && ordens.length > 0 && (
        <div className="lista-painel">
          <ul className="lista-simples">
            {ordens.map((o) => (
              <li key={o.id}>
                <strong>{o.descricao}</strong>
                <span>Tipo: {o.tipoServico}</span>
                <span>Valor: R$ {Number(o.valor).toFixed(2)}</span>
                <span>Status: {o.status}</span>
                <span>Placa: {o.veiculo?.placa || '—'}</span>
                <span>Dono: {o.veiculo?.proprietario?.nome || '—'}</span>
                <span>Entrada: {formatarDataEntrada(o.dataEntrada)}</span>

                {podeMudarStatus && (
                  <div className="controle-status">
                    <label htmlFor={`status-${o.id}`}>Alterar status</label>
                    <select
                      id={`status-${o.id}`}
                      value={o.status}
                      disabled={atualizandoId === o.id}
                      onChange={(e) => handleMudarStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPCOES.map((op) => (
                        <option key={op.valor} value={op.valor}>
                          {op.rotulo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default OrdensServico;
