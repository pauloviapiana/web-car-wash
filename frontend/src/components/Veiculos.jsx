import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Listagem de veículos (GET /veiculos).
 * - Ao montar, useEffect busca os dados na API
 * - Trio: loading / erro / dados
 * - JSON Sequelize aninhado: o dono vem em veiculo.proprietario
 * - Ler o nome com optional chaining: veiculo.proprietario?.nome
 * - Perfis: admin e atendente (técnico recebe 403)
 */
function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
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

    carregarVeiculos();
  }, []);

  if (loading) {
    return (
      <section className="painel-listagem">
        <h2>Veículos</h2>
        <p>Carregando...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="painel-listagem">
        <h2>Veículos</h2>
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      </section>
    );
  }

  if (veiculos.length === 0) {
    return (
      <section className="painel-listagem">
        <h2>Veículos</h2>
        <p>Nenhum veículo cadastrado.</p>
      </section>
    );
  }

  return (
    <section className="painel-listagem">
      <h2>Veículos</h2>
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
    </section>
  );
}

export default Veiculos;
