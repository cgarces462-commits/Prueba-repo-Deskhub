const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class SpaceImage extends Model {}

SpaceImage.init(
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
    modelName: 'SpaceImage',
    tableName: 'space_images',
  }
);

module.exports = SpaceImage;