import { useState } from 'react';
import Login from './components/Login';
import Proprietarios from './components/Proprietarios';
import Veiculos from './components/Veiculos';
import OrdensServico from './components/OrdensServico';
import './App.css';

/**
 * Lê o usuário salvo (se existir) para sobreviver ao F5 / refresh.
 * sessionStorage some ao fechar a aba — bom para ambiente de estudo.
 */
function lerUsuarioSalvo() {
  const bruto = sessionStorage.getItem('usuario');
  if (!bruto) return null;

  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

function App() {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);

  function handleLogin({ token, usuario: dadosUsuario }) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
  }

  function sair() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setUsuario(null);
  }

  if (!usuario) {
    return (
      <main className="container">
        <Login onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <main className="container container-logado">
      <header className="topo">
        <div>
          <h1>Gestão Automotiva</h1>
          <p>Bem-vindo(a), {usuario.nome}</p>
        </div>
        <button type="button" className="botao-sair" onClick={sair}>
          Sair
        </button>
      </header>

      {/* grade-listagens = 3 colunas no desktop, 1 no mobile (CSS) */}
      <section className="area-logada grade-listagens">
        <Proprietarios />
        <Veiculos />
        <OrdensServico />
      </section>
    </main>
  );
}

export default App;
