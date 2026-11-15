import jwt from 'jsonwebtoken';

/**
 * Porteiro das rotas protegidas (Fase 4).
 * Espera: Authorization: Bearer <token>
 * Se ok: preenche req.usuario com { id, perfil } e chama next().
 * Se faltar / inválido / expirado: HTTP 401.
 */
export function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      mensagem: 'Token de autenticação não informado',
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      mensagem: 'Token de autenticação não informado',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: payload.id,
      perfil: payload.perfil,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      mensagem: 'Token inválido ou expirado',
    });
  }
}
