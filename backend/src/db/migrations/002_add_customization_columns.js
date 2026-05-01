// backend/src/db/migrations/002_add_customization_columns.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'theme', {
      type: Sequelize.VARCHAR(50),
      allowNull: false,
      defaultValue: 'minimal',
    });

    await queryInterface.addColumn('events', 'cover_type', {
      type: Sequelize.VARCHAR(20),
      allowNull: false,
      defaultValue: 'gradient',
    });

    await queryInterface.addColumn('events', 'cover_value', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('events', 'custom_message', {
      type: Sequelize.VARCHAR(160),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('events', 'theme');
    await queryInterface.removeColumn('events', 'cover_type');
    await queryInterface.removeColumn('events', 'cover_value');
    await queryInterface.removeColumn('events', 'custom_message');
  },
};
