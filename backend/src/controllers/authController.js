import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

/**
 * Login: email + senha → JWT + dados básicos do usuário.
 * Nunca retorna senha nem hash.
 */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: 'Informe email e senha',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    // Mensagem genérica: não revela se o email existe ou se a senha está errada
    if (!usuario) {
      return res.status(401).json({
        mensagem: 'Credenciais inválidas',
      });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({
        mensagem: 'Credenciais inválidas',
      });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Erro ao realizar login',
    });
  }
}
