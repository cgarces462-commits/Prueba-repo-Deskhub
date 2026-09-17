const authService = require('../services/AuthService');

async function registrar(req, res, next) {
  try {
    const usuario = await authService.registrar(req.body);
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { token, usuario } = await authService.login(req.body);
    res.status(200).json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    next(error);
  }
}

async function perfil(req, res, next) {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    res.status(200).json({ usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { registrar, login, perfil };