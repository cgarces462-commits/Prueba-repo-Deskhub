const spaceService = require('../services/space.service');

async function listar(req, res, next) {
  try {
    const espacios = await spaceService.listar(req.query);
    res.status(200).json({ espacios });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const espacio = await spaceService.obtenerPorId(req.params.id);
    res.status(200).json({ espacio });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const espacio = await spaceService.crear(req.body);
    res.status(201).json({ mensaje: 'Espacio creado', espacio });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const espacio = await spaceService.actualizar(req.params.id, req.body);
    res.status(200).json({ mensaje: 'Espacio actualizado', espacio });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await spaceService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Espacio eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
