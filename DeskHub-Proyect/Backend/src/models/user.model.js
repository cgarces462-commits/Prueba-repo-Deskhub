const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

module.exports = User;
