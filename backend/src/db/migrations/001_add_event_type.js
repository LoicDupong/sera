module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'event_type', {
      type: Sequelize.ENUM('private', 'open'),
      defaultValue: 'private',
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('events', 'event_type');
  },
};
