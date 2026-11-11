import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Veiculo = sequelize.define(
  'Veiculo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    placa: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cor: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    proprietarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'veiculos',
  }
);

export default Veiculo;
