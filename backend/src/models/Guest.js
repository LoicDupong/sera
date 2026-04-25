const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Guest = sequelize.define('Guest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rsvp_status: {
    type: DataTypes.ENUM('pending', 'yes', 'no', 'maybe'),
    defaultValue: 'pending',
    allowNull: false,
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'guests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['event_id', 'first_name', 'last_name'] },
  ],
});

module.exports = Guest;
