const reservationService = require('../services/reservation.service');

async function listar(req, res, next) {
  try {
    const reservas = await reservationService.listar(req.usuario);
    res.status(200).json({ reservas });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const reserva = await reservationService.obtenerPorId(req.params.id, req.usuario);
    res.status(200).json({ reserva });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const reserva = await reservationService.crear(req.body, req.usuario);
    res.status(201).json({ mensaje: 'Reserva creada', reserva });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const reserva = await reservationService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ mensaje: 'Estado de la reserva actualizado', reserva });
  } catch (error) {
    next(error);
  }
}

async function cancelar(req, res, next) {
  try {
    const reserva = await reservationService.cancelar(req.params.id, req.usuario);
    res.status(200).json({ mensaje: 'Reserva cancelada', reserva });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, cambiarEstado, cancelar };
