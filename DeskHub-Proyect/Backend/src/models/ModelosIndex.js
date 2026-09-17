const sequelize = require('../config/database');
const RolModel = require('./RolModel');
const UsuarioModel = require('./UsuarioModel');
const EspacioModel = require('./EspacioModel');
const ReservaModel = require('./ReservaModel');
const ImagenEspacioModel = require('./ImagenEspacioModel');

// Rol <-> Usuario (1:N)
RolModel.hasMany(UsuarioModel, { foreignKey: 'roleId', as: 'usuarios' });
UsuarioModel.belongsTo(RolModel, { foreignKey: 'roleId', as: 'role' });

// Usuario <-> Reserva (1:N)
UsuarioModel.hasMany(ReservaModel, { foreignKey: 'userId', as: 'reservas' });
ReservaModel.belongsTo(UsuarioModel, { foreignKey: 'userId', as: 'usuario' });

// Espacio <-> Reserva (1:N)
EspacioModel.hasMany(ReservaModel, { foreignKey: 'spaceId', as: 'reservas' });
ReservaModel.belongsTo(EspacioModel, { foreignKey: 'spaceId', as: 'espacio' });

// Espacio <-> ImagenEspacio (1:N)
EspacioModel.hasMany(ImagenEspacioModel, {
  foreignKey: 'spaceId',
  as: 'imagenes',
  onDelete: 'CASCADE',
});
ImagenEspacioModel.belongsTo(EspacioModel, { foreignKey: 'spaceId', as: 'espacio' });

module.exports = {
  sequelize,
  RolModel,
  UsuarioModel,
  EspacioModel,
  ReservaModel,
  ImagenEspacioModel,
};