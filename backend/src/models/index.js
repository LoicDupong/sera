const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Guest = require('./Guest');
const PushSubscription = require('./PushSubscription');

User.hasMany(Event, { foreignKey: 'host_id', as: 'events' });
Event.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

Event.hasMany(Guest, { foreignKey: 'event_id', as: 'guests' });
Guest.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(PushSubscription, { foreignKey: 'host_id', as: 'pushSubscriptions' });
PushSubscription.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

module.exports = { sequelize, User, Event, Guest, PushSubscription };
