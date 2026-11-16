import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Listagem + cadastro + busca de proprietários.
 * - carregarProprietarios(termo?): GET (lista toda ou filtrada com ?q=)
 * - Formulário controlado → POST /proprietarios (admin/atendente)
 * - Técnico: form oculto (RBAC); listagem pode retornar 403
 * - CPF só no form de cadastro; a listagem NÃO exibe CPF
 */
function Proprietarios() {
  const [proprietarios, setProprietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Campos do formulário (controlled inputs: value + onChange)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Texto digitado na busca (query string ?q= na API)
  const [busca, setBusca] = useState('');

  // Opção mais simples: ler o perfil do sessionStorage (já gravado no login).
  // Assim não precisamos mudar o App.jsx só para passar uma prop.
  const usuarioSalvo = sessionStorage.getItem('usuario');
  const perfil = usuarioSalvo ? JSON.parse(usuarioSalvo).perfil : null;
  const podeCadastrar = perfil === 'admin' || perfil === 'atendente';

  // termo opcional: se vier texto, manda ?q=...; se vazio, lista completa
  async function carregarProprietarios(termo = '') {
    setLoading(true);
    setErro('');

    try {
      const resposta = await api.get('/proprietarios', {
        params: termo ? { q: termo } : {},
      });
      // Axios monta a URL: /proprietarios?q=maria  (query string)
      setProprietarios(resposta.data);
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
            'Seu perfil não tem permissão para ver proprietários (RBAC).'
        );
      } else {
        setErro(mensagemApi || 'Não foi possível carregar os proprietários.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProprietarios();
  }, []);

  function handleBuscar(evento) {
    evento.preventDefault();
    carregarProprietarios(busca.trim());
  }

  function handleLimparBusca() {
    setBusca('');
    carregarProprietarios(); // sem termo = lista completa
  }

  async function handleSubmit(evento) {
    // Evita o reload padrão do <form> no navegador
    evento.preventDefault();
    setErroForm('');
    setSucesso('');
    setEnviando(true);

    try {
      await api.post('/proprietarios', {
        nome,
        email,
        telefone,
        cpf,
      });

      // Sucesso: limpa o form e recarrega a lista (usa a função do Passo 2)
      setNome('');
      setEmail('');
      setTelefone('');
      setCpf('');
      setSucesso('Proprietário cadastrado.');
      await carregarProprietarios();
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
            'Seu perfil não tem permissão para cadastrar proprietários (RBAC).'
        );
      } else {
        setErroForm(
          mensagemApi || 'Não foi possível cadastrar o proprietário.'
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="painel-listagem">
      <h2>Proprietários</h2>

      {/* Busca: disponível para quem pode ver a listagem (admin/atendente) */}
      {podeCadastrar && (
        <form className="formulario-busca" onSubmit={handleBuscar}>
          <label htmlFor="prop-busca">Buscar por nome ou e-mail</label>
          <input
            id="prop-busca"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: Maria ou maria@email.com"
          />
          <div className="acoes-busca">
            <button type="submit">Buscar</button>
            <button type="button" className="botao-secundario" onClick={handleLimparBusca}>
              Limpar
            </button>
          </div>
        </form>
      )}

      {podeCadastrar && (
        <form className="formulario-cadastro" onSubmit={handleSubmit}>
          <h3>Novo proprietário</h3>

          <label htmlFor="prop-nome">Nome</label>
          <input
            id="prop-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="prop-email">E-mail</label>
          <input
            id="prop-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="prop-telefone">Telefone</label>
          <input
            id="prop-telefone"
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            disabled={enviando}
            required
          />

          <label htmlFor="prop-cpf">CPF</label>
          <input
            id="prop-cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            disabled={enviando}
            required
          />

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

      {!loading && !erro && proprietarios.length === 0 && (
        <p>
          {busca.trim()
            ? 'Nenhum proprietário encontrado para essa busca.'
            : 'Nenhum proprietário cadastrado.'}
        </p>
      )}

      {!loading && !erro && proprietarios.length > 0 && (
        <div className="lista-painel">
          <ul className="lista-simples">
            {proprietarios.map((p) => (
              <li key={p.id}>
                <strong>{p.nome}</strong>
                <span>{p.email}</span>
                <span>{p.telefone || '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Proprietarios;
