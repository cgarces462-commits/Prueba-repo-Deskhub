const sequelize = require('../config/database');
const Role = require('./role.model');
const User = require('./user.model');
const Space = require('./space.model');
const Reservation = require('./reservation.model');

// Role <-> User (1:N)
Role.hasMany(User, { foreignKey: 'roleId', as: 'usuarios' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// User <-> Reservation (1:N)
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservas' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

// Space <-> Reservation (1:N)
Space.hasMany(Reservation, { foreignKey: 'spaceId', as: 'reservas' });
Reservation.belongsTo(Space, { foreignKey: 'spaceId', as: 'espacio' });

module.exports = {
  sequelize,
  Role,
  User,
  Space,
  Reservation,
};
