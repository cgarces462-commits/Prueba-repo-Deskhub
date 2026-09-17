const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class EspacioModel extends Model {}

EspacioModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM(
        'escritorio',
        'oficina_privada',
        'sala_reunion',
        'sala_conferencia'
      ),
      allowNull: false,
      defaultValue: 'escritorio',
    },
    ubicacion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precioPorHora: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'precio_por_hora',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'EspacioModel',
    tableName: 'spaces',
  }
);

module.exports = EspacioModel;