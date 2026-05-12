'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('events', 'custom_message', {
      type: Sequelize.STRING(300),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('events', 'custom_message', {
      type: Sequelize.STRING(160),
      allowNull: true,
    });
  },
};
