const { EspacioModel, ImagenEspacioModel } = require('../models/ModelosIndex');

const CON_INCLUYE_IMAGENES = {
  include: [{ model: ImagenEspacioModel, as: 'imagenes', separate: true }],
};

const findAll = (where = {}) => EspacioModel.findAll({ ...CON_INCLUYE_IMAGENES, where });

const findById = (id) => EspacioModel.findByPk(id, CON_INCLUYE_IMAGENES);

const create = (data) => EspacioModel.create(data);

const updateById = async (id, data) => {
  const espacio = await EspacioModel.findByPk(id);
  if (!espacio) return null;
  return espacio.update(data);
};

const deleteById = async (id) => {
  const espacio = await EspacioModel.findByPk(id);
  if (!espacio) return null;
  await espacio.destroy();
  return espacio;
};

module.exports = { findAll, findById, create, updateById, deleteById };