const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ImagenEspacioModel extends Model {}

ImagenEspacioModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'space_id',
    },
    url: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'ImagenEspacioModel',
    tableName: 'space_images',
  }
);

module.exports = ImagenEspacioModel;