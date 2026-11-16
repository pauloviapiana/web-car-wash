import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Listagem + cadastro de veículos.
 * - carregarVeiculos: GET reutilizável (montagem + após POST)
 * - Select de proprietários (GET /proprietarios) para enviar proprietarioId
 * - Técnico: form oculto (RBAC)
 */
function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Opções do <select> (donos já cadastrados)
  const [opcoesProprietarios, setOpcoesProprietarios] = useState([]);

  // Campos do formulário (controlled)
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [proprietarioId, setProprietarioId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');

  const usuarioSalvo = sessionStorage.getItem('usuario');
  const perfil = usuarioSalvo ? JSON.parse(usuarioSalvo).perfil : null;
  const podeCadastrar = perfil === 'admin' || perfil === 'atendente';

  async function carregarVeiculos() {
    setLoading(true);
    setErro('');

    try {
      const resposta = await api.get('/veiculos');
      // Cada item traz proprietario aninhado, ex.:
      // { id, marca, modelo, placa, ..., proprietario: { id, nome, email, telefone } }
      setVeiculos(resposta.data);
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
            'Seu perfil não tem permissão para ver veículos (RBAC).'
        );
      } else {
        setErro(mensagemApi || 'Não foi possível carregar os veículos.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Carrega donos só para preencher o select (quem pode cadastrar)
  async function carregarOpcoesProprietarios() {
    try {
      const resposta = await api.get('/proprietarios');
      setOpcoesProprietarios(resposta.data);
    } catch {
      // Se falhar, o select fica vazio; o POST ainda valida no backend
      setOpcoesProprietarios([]);
    }
  }

  useEffect(() => {
    carregarVeiculos();
    if (podeCadastrar) {
      carregarOpcoesProprietarios();
    }
  }, []);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroForm('');
    setSucesso('');
    setEnviando(true);

    try {
      // Number(...) garante que proprietarioId vá como número (API espera ID numérico)
      await api.post('/veiculos', {
        marca,
        modelo,
        placa,
        ano: ano ? Number(ano) : undefined,
        cor: cor || undefined,
        proprietarioId: Number(proprietarioId),
      });

      setMarca('');
      setModelo('');
      setPlaca('');
      setAno('');
      setCor('');
      setProprietarioId('');
      setSucesso('Veículo cadastrado.');
      await carregarVeiculos();
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
            'Seu perfil não tem permissão para cadastrar veículos (RBAC).'
        );
      } else if (status === 404) {
        setErroForm(
          mensagemApi || 'Proprietário não encontrado. Escolha outro dono.'
        );
      } else {
        setErroForm(mensagemApi || 'Não foi possível cadastrar o veículo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="painel-listagem">
      <h2>Veículos</h2>

      {podeCadastrar && (
        <form className="formulario-cadastro" onSubmit={handleSubmit}>
          <h3>Novo veículo</h3>

          <label htmlFor="vei-marca">Marca</label>
          <input
            id="vei-marca"
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="vei-modelo">Modelo</label>
          <input
            id="vei-modelo"
            type="text"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="vei-placa">Placa</label>
          <input
            id="vei-placa"
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="vei-ano">Ano (opcional)</label>
          <input
            id="vei-ano"
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            disabled={enviando}
          />

          <label htmlFor="vei-cor">Cor (opcional)</label>
          <input
            id="vei-cor"
            type="text"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            disabled={enviando}
          />

          <label htmlFor="vei-dono">Proprietário</label>
          <select
            id="vei-dono"
            value={proprietarioId}
            onChange={(e) => setProprietarioId(e.target.value)}
            disabled={enviando}
            required
          >
            <option value="">Selecione o dono</option>
            {opcoesProprietarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          {erroForm && (
            <p className="mensagem-erro" role="alert">
              {erroForm}
            </p>
          )}

          {sucesso && (
            <p className="mensagem-sucesso" role="status">
              {sucesso}
            </p>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>
      )}

      {loading && <p>Carregando...</p>}

      {!loading && erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!loading && !erro && veiculos.length === 0 && (
        <p>Nenhum veículo cadastrado.</p>
      )}

      {!loading && !erro && veiculos.length > 0 && (
        <div className="lista-painel">
          <ul className="lista-simples">
            {veiculos.map((v) => (
              <li key={v.id}>
                <strong>
                  {v.marca} {v.modelo}
                </strong>
                <span>Placa: {v.placa}</span>
                {/* ?. = se proprietario existir, pegue o nome; senão, não quebra */}
                <span>Dono: {v.proprietario?.nome || '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Veiculos;
