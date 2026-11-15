/**
 * Descobre qual coluna violou UNIQUE.
 * No PostgreSQL em PT-BR, errors[] e fields às vezes vêm vazios —
 * aí lemos parent.detail ("Chave (placa)=(ABC1D23) já existe.") ou a constraint.
 */
function campoUnico(error) {
  const peloErrors = error.errors?.[0]?.path;
  if (peloErrors) return peloErrors;

  const pelosFields = Object.keys(error.fields || {})[0];
  if (pelosFields) return pelosFields;

  const detalhe = error.parent?.detail || '';
  const matchDetalhe = detalhe.match(/Chave \(([^)]+)\)=/i) || detalhe.match(/Key \(([^)]+)\)=/i);
  if (matchDetalhe) return matchDetalhe[1];

  const constraint = error.parent?.constraint || '';
  if (constraint.includes('placa')) return 'placa';
  if (constraint.includes('email')) return 'email';
  if (constraint.includes('cpf')) return 'cpf';

  return '';
}

/**
 * Traduz erros do Sequelize/PostgreSQL para status HTTP e mensagens em português.
 * Retorna true se já enviou a resposta; false se o controller deve usar o 500 genérico.
 *
 * UNIQUE  → 409 (conflito: email/placa etc. já existem)
 * FK      → 400 (referência inválida)
 * validação → 400
 */
export function responderSeErroSequelize(res, error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    const campo = campoUnico(error);

    const mensagensPorCampo = {
      email: 'Este e-mail já está cadastrado',
      placa: 'Esta placa já está cadastrada',
      cpf: 'Este CPF já está cadastrado',
    };

    res.status(409).json({
      mensagem: mensagensPorCampo[campo] || 'Registro duplicado: valor já existe',
    });
    return true;
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      mensagem: 'Referência inválida: o registro relacionado não existe',
    });
    return true;
  }

  if (error.name === 'SequelizeValidationError') {
    const detalhe = error.errors?.[0]?.message;
    res.status(400).json({
      mensagem: detalhe || 'Dados inválidos',
    });
    return true;
  }

  return false;
}
