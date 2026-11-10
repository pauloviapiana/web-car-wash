'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('veiculos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      marca: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      modelo: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      placa: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      ano: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cor: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      proprietarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proprietarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('veiculos');
  },
};