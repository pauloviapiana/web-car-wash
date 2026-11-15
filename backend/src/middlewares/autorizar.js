/**
 * Autorização por perfil (RBAC leve).
 *
 * Diferença importante:
 * - autenticar  = "quem é você?" (tem JWT válido?)
 * - autorizar   = "o que você pode fazer?" (seu perfil está na lista?)
 *
 * Uso: autenticar primeiro, depois autorizarPerfil(...):
 *   router.post('/veiculos', autenticar, autorizarPerfil('admin', 'atendente'), criar)
 *
 * 401 = sem login / token inválido (middleware autenticar)
 * 403 = logado, mas perfil sem permissão (este middleware)
 */
export function autorizarPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario?.perfil) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado',
      });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        mensagem: 'Acesso negado para este perfil',
      });
    }

    return next();
  };
}
