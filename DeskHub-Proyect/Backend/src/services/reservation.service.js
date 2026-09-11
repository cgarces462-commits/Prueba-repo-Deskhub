const reservationRepository = require('../repositories/reservation.repository');
const spaceRepository = require('../repositories/space.repository');
const { HttpError } = require('./auth.service');
const { ROLES } = require('../config/roles');

async function listar(usuarioAutenticado) {
  // cliente/invitado solo ven sus propias reservas; el resto de roles ven todas
  if ([ROLES.CLIENTE, ROLES.INVITADO].includes(usuarioAutenticado.role)) {
    return reservationRepository.findByUser(usuarioAutenticado.id);
  }
  return reservationRepository.findAll();
}

async function obtenerPorId(id, usuarioAutenticado) {
  const reserva = await reservationRepository.findById(id);
  if (!reserva) throw new HttpError(404, 'Reserva no encontrada');

  const esPropia = reserva.userId === usuarioAutenticado.id;
  const puedeVerTodas = ![ROLES.CLIENTE, ROLES.INVITADO].includes(
    usuarioAutenticado.role
  );
  if (!esPropia && !puedeVerTodas) {
    throw new HttpError(403, 'No tienes permiso para ver esta reserva');
  }
  return reserva;
}

async function crear(data, usuarioAutenticado) {
  const { spaceId, fechaInicio, fechaFin, notas } = data;
  if (!spaceId || !fechaInicio || !fechaFin) {
    throw new HttpError(400, 'spaceId, fechaInicio y fechaFin son obligatorios');
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || inicio >= fin) {
    throw new HttpError(400, 'El rango de fechas de la reserva no es válido');
  }

  const espacio = await spaceRepository.findById(spaceId);
  if (!espacio) throw new HttpError(404, 'El espacio indicado no existe');
  if (!espacio.disponible) {
    throw new HttpError(409, 'El espacio no está disponible actualmente');
  }

  const traslapes = await reservationRepository.findOverlapping(spaceId, inicio, fin);
  if (traslapes.length > 0) {
    throw new HttpError(409, 'El espacio ya está reservado en ese horario');
  }

  return reservationRepository.create({
    userId: usuarioAutenticado.id,
    spaceId,
    fechaInicio: inicio,
    fechaFin: fin,
    notas,
    estado: 'pendiente',
  });
}

async function cambiarEstado(id, estado) {
  const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!estadosValidos.includes(estado)) {
    throw new HttpError(400, `Estado inválido. Valores válidos: ${estadosValidos.join(', ')}`);
  }
  const actualizada = await reservationRepository.updateById(id, { estado });
  if (!actualizada) throw new HttpError(404, 'Reserva no encontrada');
  return reservationRepository.findById(id);
}

async function cancelar(id, usuarioAutenticado) {
  const reserva = await reservationRepository.findById(id);
  if (!reserva) throw new HttpError(404, 'Reserva no encontrada');

  const esPropia = reserva.userId === usuarioAutenticado.id;
  const puedeGestionarTodas = ![ROLES.CLIENTE, ROLES.INVITADO].includes(
    usuarioAutenticado.role
  );
  if (!esPropia && !puedeGestionarTodas) {
    throw new HttpError(403, 'No tienes permiso para cancelar esta reserva');
  }

  return cambiarEstado(id, 'cancelada');
}

module.exports = { listar, obtenerPorId, crear, cambiarEstado, cancelar };
