import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Proprietario = sequelize.define(
  'Proprietario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'proprietarios',
  }
);

export default Proprietario;
