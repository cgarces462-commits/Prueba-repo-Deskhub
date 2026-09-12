const { Space } = require('../models');

const findAll = (where = {}) => Space.findAll({ where });

const findById = (id) => Space.findByPk(id);

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
