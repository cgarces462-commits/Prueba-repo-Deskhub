const usuarioService = require('../services/UsuarioService');
const { HttpError } = require('../services/AuthService');

async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar();
    res.status(200).json({ usuarios });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json({ usuario });
  } catch (error) {
    next(error);
  }
}

async function cambiarRol(req, res, next) {
  try {
    const { id } = req.params;
    if (Number(id) === req.usuario.id) {
      throw new HttpError(400, 'No puedes cambiar tu propio rol');
    }
    const usuario = await usuarioService.cambiarRol(id, req.body.rol);
    res.status(200).json({ mensaje: 'Rol actualizado', usuario });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { id } = req.params;
    if (Number(id) === req.usuario.id) {
      throw new HttpError(400, 'No puedes desactivar tu propia cuenta');
    }
    const usuario = await usuarioService.cambiarEstado(id, req.body.activo);
    res.status(200).json({ mensaje: 'Estado actualizado', usuario });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    if (Number(id) === req.usuario.id) {
      throw new HttpError(400, 'No puedes eliminar tu propia cuenta');
    }
    await usuarioService.eliminar(id);
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, cambiarRol, cambiarEstado, eliminar };