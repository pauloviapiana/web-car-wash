import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Proprietario from './Proprietario.js';
import Veiculo from './Veiculo.js';
import OrdemServico from './OrdemServico.js';

// Proprietario 1:N Veiculo
Proprietario.hasMany(Veiculo, {
  foreignKey: 'proprietarioId',
  as: 'veiculos',
});
Veiculo.belongsTo(Proprietario, {
  foreignKey: 'proprietarioId',
  as: 'proprietario',
});

// Veiculo 1:N OrdemServico
Veiculo.hasMany(OrdemServico, {
  foreignKey: 'veiculoId',
  as: 'ordensServico',
});
OrdemServico.belongsTo(Veiculo, {
  foreignKey: 'veiculoId',
  as: 'veiculo',
});

export {
  sequelize,
  Usuario,
  Proprietario,
  Veiculo,
  OrdemServico,
};
