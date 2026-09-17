const { Op } = require('sequelize');
const { ReservaModel, EspacioModel, UsuarioModel } = require('../models/ModelosIndex');

const include = [
  { model: EspacioModel, as: 'espacio' },
  { model: UsuarioModel, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
];

const findAll = (where = {}) => ReservaModel.findAll({ where, include });

const findById = (id) => ReservaModel.findByPk(id, { include });

const findByUser = (userId) => ReservaModel.findAll({ where: { userId }, include });

// Busca reservas que se traslapen en el mismo espacio y rango de horario
const findOverlapping = (spaceId, fechaInicio, fechaFin, excludeId = null) => {
  const where = {
    spaceId,
    estado: { [Op.ne]: 'cancelada' },
    fechaInicio: { [Op.lt]: fechaFin },
    fechaFin: { [Op.gt]: fechaInicio },
  };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  return ReservaModel.findAll({ where });
};

const create = (data) => ReservaModel.create(data);

const updateById = async (id, data) => {
  const reserva = await ReservaModel.findByPk(id);
  if (!reserva) return null;
  return reserva.update(data);
};

const deleteById = async (id) => {
  const reserva = await ReservaModel.findByPk(id);
  if (!reserva) return null;
  await reserva.destroy();
  return reserva;
};

module.exports = {
  findAll,
  findById,
  findByUser,
  findOverlapping,
  create,
  updateById,
  deleteById,
};