const userService = require('../services/user.service');

async function listar(req, res, next) {
  try {
    const usuarios = await userService.listar();
    res.status(200).json({ usuarios });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const usuario = await userService.obtenerPorId(req.params.id);
    res.status(200).json({ usuario });
  } catch (error) {
    next(error);
  }
}

async function cambiarRol(req, res, next) {
  try {
    const usuario = await userService.cambiarRol(req.params.id, req.body.rol);
    res.status(200).json({ mensaje: 'Rol actualizado', usuario });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const usuario = await userService.cambiarEstado(req.params.id, req.body.activo);
    res.status(200).json({ mensaje: 'Estado actualizado', usuario });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await userService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, cambiarRol, cambiarEstado, eliminar };
