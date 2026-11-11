import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrdemServico = sequelize.define(
  'OrdemServico',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dataEntrada: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipoServico: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('aberto', 'em_andamento', 'concluido', 'cancelado'),
      allowNull: false,
      defaultValue: 'aberto',
    },
    veiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'ordens_servico',
  }
);

export default OrdemServico;
