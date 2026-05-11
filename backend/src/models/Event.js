const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  host_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.ENUM('private', 'open'),
    defaultValue: 'private',
    allowNull: false,
  },
  theme: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'elegant_minimal',
    validate: {
      isIn: {
        args: [['elegant_minimal', 'luxury_party', 'editorial_chic', 'feminine_luxe', 'bold_celebration']],
        msg: 'Invalid theme',
      },
    },
  },
  cover_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'gradient',
    validate: {
      isIn: {
        args: [['gradient', 'image']],
        msg: 'cover_type must be gradient or image',
      },
    },
  },
  cover_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  custom_message: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  font_style: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'classic',
    validate: {
      isIn: {
        args: [['classic', 'script', 'modern']],
        msg: 'font_style must be classic, script, or modern',
      },
    },
  },
  slug: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Event;
