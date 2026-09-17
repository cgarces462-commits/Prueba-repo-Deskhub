const reservaService = require('../services/ReservaService');

async function listar(req, res, next) {
  try {
    const reservas = await reservaService.listar(req.usuario);
    res.status(200).json({ reservas });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const reserva = await reservaService.obtenerPorId(req.params.id, req.usuario);
    res.status(200).json({ reserva });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const reserva = await reservaService.crear(req.body, req.usuario);
    res.status(201).json({ mensaje: 'Reserva creada', reserva });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const reserva = await reservaService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ mensaje: 'Estado de la reserva actualizado', reserva });
  } catch (error) {
    next(error);
  }
}

async function cancelar(req, res, next) {
  try {
    const reserva = await reservaService.cancelar(req.params.id, req.usuario);
    res.status(200).json({ mensaje: 'Reserva cancelada', reserva });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, cambiarEstado, cancelar };