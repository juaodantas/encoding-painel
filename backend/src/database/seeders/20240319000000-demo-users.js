'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
}; 