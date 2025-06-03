'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, vamos buscar um usuário para associar aos vídeos
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado para associar aos vídeos');
      return;
    }

    const userId = users[0].id;

    await queryInterface.bulkInsert('videos', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        titulo: 'Vídeo de Demonstração 1',
        descricao: 'Um vídeo de exemplo para demonstração do sistema',
        status: 'uploaded',
        original_url: 'https://example.com/videos/demo1.mp4',
        processed_url_720p: 'https://example.com/videos/demo1_720p.mp4',
        processed_url_480p: 'https://example.com/videos/demo1_480p.mp4',
        data_upload: new Date(),
        usuario_criador_id: userId,
        metadata: JSON.stringify({
          duration: 120,
          size: 1024000,
          format: 'mp4',
          resolution: '1080p'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        titulo: 'Vídeo de Demonstração 2',
        descricao: 'Outro vídeo de exemplo para demonstração',
        status: 'processing',
        original_url: 'https://example.com/videos/demo2.mp4',
        data_upload: new Date(),
        usuario_criador_id: userId,
        metadata: JSON.stringify({
          duration: 180,
          size: 2048000,
          format: 'mp4',
          resolution: '720p'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('videos', null, {});
  }
}; 