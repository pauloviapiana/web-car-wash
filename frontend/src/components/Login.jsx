import { useState } from 'react';
import api from '../services/api';

/**
 * Tela de login.
 * - Coleta email e senha
 * - Chama POST /auth/login via Axios (api)
 * - Em sucesso: avisa o App pelo onLogin (App grava token/usuario no sessionStorage)
 * - Em erro: mostra a mensagem vinda da API
 * - Enquanto espera a API: botão em loading (evita clique duplo)
 */
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function realizarLogin(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await api.post('/auth/login', { email, senha });
      // resposta.data = { token, usuario: { id, nome, perfil } }
      onLogin(resposta.data);
    } catch (error) {
      setErro(error.response?.data?.mensagem || 'Falha ao entrar.');
    } finally {
      // Roda sempre: sucesso ou erro — libera o botão
      setCarregando(false);
    }
  }

  return (
    <form className="login-form" onSubmit={realizarLogin}>
      <h2>Gestão Automotiva</h2>
      <p className="login-subtitulo">Entre com seu e-mail e senha</p>

      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={carregando}
        required
      />

      <label htmlFor="senha">Senha</label>
      <input
        id="senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        disabled={carregando}
        required
      />

      <button type="submit" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}

export default Login;
