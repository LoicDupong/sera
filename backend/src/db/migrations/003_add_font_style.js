'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'font_style', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'classic',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('events', 'font_style');
  },
};
