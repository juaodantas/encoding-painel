'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, removemos o ENUM se ele existir
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_videos_status;
    `);

    // Criamos o tipo ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_videos_status AS ENUM ('pending', 'uploaded', 'processing', 'done', 'error');
    `);

    // Depois criamos a tabela
    await queryInterface.createTable('videos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'uploaded', 'processing', 'done', 'error'),
        allowNull: false,
        defaultValue: 'pending'
      },
      original_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      processed_url_720p: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      processed_url_480p: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      data_upload: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      usuario_criador_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('videos');
    // Removemos o tipo ENUM
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_videos_status;
    `);
  }
}; 