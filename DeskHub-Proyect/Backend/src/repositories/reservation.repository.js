const { Op } = require('sequelize');
const { Reservation, Space, User } = require('../models');

const include = [
  { model: Space, as: 'espacio' },
  { model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
];

const findAll = (where = {}) => Reservation.findAll({ where, include });

const findById = (id) => Reservation.findByPk(id, { include });

const findByUser = (userId) => Reservation.findAll({ where: { userId }, include });

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
  return Reservation.findAll({ where });
};

const create = (data) => Reservation.create(data);

const updateById = async (id, data) => {
  const reserva = await Reservation.findByPk(id);
  if (!reserva) return null;
  return reserva.update(data);
};

const deleteById = async (id) => {
  const reserva = await Reservation.findByPk(id);
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
