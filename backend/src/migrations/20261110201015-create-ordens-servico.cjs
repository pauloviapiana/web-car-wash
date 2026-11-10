'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ordens_servico', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dataEntrada: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      descricao: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipoServico: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM(
          'aberto',
          'em_andamento',
          'concluido',
          'cancelado'
        ),
        allowNull: false,
        defaultValue: 'aberto',
      },
      veiculoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'veiculos',
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

    await queryInterface.sequelize.query(`
      ALTER TABLE ordens_servico
      ADD CONSTRAINT ordens_servico_valor_gte_0
      CHECK (valor >= 0);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ordens_servico');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_ordens_servico_status";'
    );
  },
};