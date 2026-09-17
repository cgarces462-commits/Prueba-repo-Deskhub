const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RolModel extends Model {}

RolModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RolModel',
    tableName: 'roles',
  }
);

module.exports = RolModel;