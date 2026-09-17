const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ReservaModel extends Model {}

ReservaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'space_id',
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_inicio',
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_fin',
    },
    estado: {
      type: DataTypes.ENUM(
        'pendiente',
        'confirmada',
        'cancelada',
        'completada'
      ),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    notas: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ReservaModel',
    tableName: 'reservations',
  }
);

module.exports = ReservaModel;