const { UsuarioModel, RolModel } = require('../models/ModelosIndex');

const findAll = () =>
  UsuarioModel.findAll({
    include: { model: RolModel, as: 'role', attributes: ['id', 'nombre'] },
  });

const findById = (id) =>
  UsuarioModel.findByPk(id, {
    include: { model: RolModel, as: 'role', attributes: ['id', 'nombre'] },
  });

const findByEmail = (email) =>
  UsuarioModel.scope('withPassword').findOne({
    where: { email },
    include: { model: RolModel, as: 'role', attributes: ['id', 'nombre'] },
  });

const create = (data) => UsuarioModel.create(data);

const updateById = async (id, data) => {
  const usuario = await UsuarioModel.findByPk(id);
  if (!usuario) return null;
  return usuario.update(data);
};

const deleteById = async (id) => {
  const usuario = await UsuarioModel.findByPk(id);
  if (!usuario) return null;
  await usuario.destroy();
  return usuario;
};

module.exports = { findAll, findById, findByEmail, create, updateById, deleteById };