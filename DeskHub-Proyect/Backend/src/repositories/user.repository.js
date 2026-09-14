const { User, Role } = require('../models');

const findAll = () =>
  User.findAll({ include: { model: Role, as: 'role', attributes: ['id', 'nombre'] } });

const findById = (id) =>
  User.findByPk(id, {
    include: { model: Role, as: 'role', attributes: ['id', 'nombre'] },
  });

const findByEmail = (email) =>
  User.scope('withPassword').findOne({
    where: { email },
    include: { model: Role, as: 'role', attributes: ['id', 'nombre'] },
  });

const create = (data) => User.create(data);

const updateById = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update(data);
};

const deleteById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return user;
};

module.exports = { findAll, findById, findByEmail, create, updateById, deleteById };
