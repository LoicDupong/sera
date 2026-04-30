module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'event_type', {
      // Distinguishes private (pre-selected guests) from open (self-registration) events
      type: Sequelize.ENUM('private', 'open'),
      defaultValue: 'private',
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    // Remove the column
    await queryInterface.removeColumn('events', 'event_type');

    // Drop the ENUM type (PostgreSQL cleanup)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_events_event_type;');
  },
};
