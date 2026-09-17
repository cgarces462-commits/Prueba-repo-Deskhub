const usuarioRepository = require('../repositories/UsuarioRepository');
const rolRepository = require('../repositories/RolRepository');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generarToken } = require('../utils/jwt.util');
const { ROLES } = require('../config/roles');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Registro público. Por seguridad, cualquier persona que se registre por su cuenta
 * queda como "cliente". Los roles administrativos (super_admin, admin, recepcionista)
 * solo pueden asignarse por un super_admin/admin a través de la gestión de usuarios.
 */
async function registrar({ nombre, apellido, email, password, telefono }) {
  if (!nombre || !email || !password) {
    throw new HttpError(400, 'nombre, email y password son obligatorios');
  }

  const existente = await usuarioRepository.findByEmail(email);
  if (existente) {
    throw new HttpError(409, 'Ya existe un usuario registrado con ese email');
  }

  const rolCliente = await rolRepository.findByNombre(ROLES.CLIENTE);
  if (!rolCliente) {
    throw new HttpError(
      500,
      'Los roles no están inicializados. Ejecuta "npm run seed" primero.'
    );
  }

  const hashed = await hashPassword(password);
  const usuario = await usuarioRepository.create({
    nombre,
    apellido,
    email,
    password: hashed,
    telefono,
    roleId: rolCliente.id,
  });

  return sanitizarUsuario(await usuarioRepository.findById(usuario.id));
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, 'email y password son obligatorios');
  }

  const usuario = await usuarioRepository.findByEmail(email);
  if (!usuario) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  if (!usuario.activo) {
    throw new HttpError(403, 'El usuario está inactivo. Contacta a un administrador.');
  }

  const passwordValido = await comparePassword(password, usuario.password);
  if (!passwordValido) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const token = generarToken({
    id: usuario.id,
    email: usuario.email,
    role: usuario.role.nombre,
  });

  return { token, usuario: sanitizarUsuario(usuario) };
}

/** Perfil del usuario autenticado. Pasa por servicio para mantener la jerarquía de capas. */
async function obtenerPerfil(id) {
  const usuario = await usuarioRepository.findById(id);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  return sanitizarUsuario(usuario);
}

function sanitizarUsuario(usuario) {
  const plano = usuario.toJSON ? usuario.toJSON() : usuario;
  delete plano.password;
  return plano;
}

module.exports = { registrar, login, obtenerPerfil, HttpError };