import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Listagem de proprietários (GET /proprietarios).
 * - Ao montar o componente, useEffect busca os dados na API
 * - Trio de estados: loading / erro / dados
 * - CPF NÃO aparece: a API de listagem não envia esse campo
 * - Perfis liberados no backend: admin e atendente (técnico recebe 403)
 */
function Proprietarios() {
  const [proprietarios, setProprietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarProprietarios() {
      setLoading(true);
      setErro('');

      try {
        // api já coloca Authorization: Bearer <token> (interceptor da Fase 7)
        const resposta = await api.get('/proprietarios');
        // resposta.data = array [{ id, nome, email, telefone, createdAt, updatedAt }]
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
        // Sempre desliga o loading — sucesso ou erro
        setLoading(false);
      }
    }

    carregarProprietarios();
  }, []); // [] = roda só quando o componente monta na tela

  if (loading) {
    return (
      <section className="painel-listagem">
        <h2>Proprietários</h2>
        <p>Carregando...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="painel-listagem">
        <h2>Proprietários</h2>
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      </section>
    );
  }

  if (proprietarios.length === 0) {
    return (
      <section className="painel-listagem">
        <h2>Proprietários</h2>
        <p>Nenhum proprietário cadastrado.</p>
      </section>
    );
  }

  return (
    <section className="painel-listagem">
      <h2>Proprietários</h2>
      <ul className="lista-simples">
        {proprietarios.map((p) => (
          <li key={p.id}>
            <strong>{p.nome}</strong>
            <span>{p.email}</span>
            <span>{p.telefone || '—'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Proprietarios;
