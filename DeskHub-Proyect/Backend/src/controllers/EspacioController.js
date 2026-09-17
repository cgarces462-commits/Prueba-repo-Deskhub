const espacioService = require('../services/EspacioService');

async function listar(req, res, next) {
  try {
    const espacios = await espacioService.listar(req.query);
    res.status(200).json({ espacios });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const espacio = await espacioService.obtenerPorId(req.params.id);
    res.status(200).json({ espacio });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const espacio = await espacioService.crear(req.body);
    res.status(201).json({ mensaje: 'Espacio creado', espacio });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const espacio = await espacioService.actualizar(req.params.id, req.body);
    res.status(200).json({ mensaje: 'Espacio actualizado', espacio });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await espacioService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Espacio eliminado' });
  } catch (error) {
    next(error);
  }
}

async function subirImagen(req, res, next) {
  try {
    const imagen = await espacioService.subirImagen(req.params.id, req.file);
    res.status(201).json({ mensaje: 'Imagen agregada', imagen });
  } catch (error) {
    next(error);
  }
}

async function eliminarImagen(req, res, next) {
  try {
    await espacioService.eliminarImagen(req.params.id, req.params.imagenId);
    res.status(200).json({ mensaje: 'Imagen eliminada' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, subirImagen, eliminarImagen };