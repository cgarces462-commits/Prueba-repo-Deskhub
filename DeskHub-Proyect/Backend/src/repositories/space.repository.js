const { Space, SpaceImage } = require('../models');

const CON_INCLUYE_IMAGENES = {
  include: [{ model: SpaceImage, as: 'imagenes', separate: true }],
};

const findAll = (where = {}) => Space.findAll({ ...CON_INCLUYE_IMAGENES, where });

const findById = (id) => Space.findByPk(id, CON_INCLUYE_IMAGENES);

const create = (data) => Space.create(data);

const updateById = async (id, data) => {
  const space = await Space.findByPk(id);
  if (!space) return null;
  return space.update(data);
};

const deleteById = async (id) => {
  const space = await Space.findByPk(id);
  if (!space) return null;
  await space.destroy();
  return space;
};

module.exports = { findAll, findById, create, updateById, deleteById };