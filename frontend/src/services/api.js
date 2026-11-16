import axios from 'axios';

/**
 * Instância central do Axios.
 * Todos os pedidos à API devem usar este "api", não o axios solto.
 * A URL base vem do .env (VITE_API_URL) — não hardcodeamos no componente.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Interceptor de requisição:
 * Antes de cada pedido sair, lemos o token no sessionStorage
 * e, se existir, colocamos no header Authorization como Bearer.
 * Assim o backend reconhece o usuário logado nas rotas protegidas.
 */
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
