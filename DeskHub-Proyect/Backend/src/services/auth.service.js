const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
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

  const existente = await userRepository.findByEmail(email);
  if (existente) {
    throw new HttpError(409, 'Ya existe un usuario registrado con ese email');
  }

  const rolCliente = await roleRepository.findByNombre(ROLES.CLIENTE);
  if (!rolCliente) {
    throw new HttpError(
      500,
      'Los roles no están inicializados. Ejecuta "npm run seed" primero.'
    );
  }

  const hashed = await hashPassword(password);
  const usuario = await userRepository.create({
    nombre,
    apellido,
    email,
    password: hashed,
    telefono,
    roleId: rolCliente.id,
  });

  return sanitizarUsuario(await userRepository.findById(usuario.id));
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, 'email y password son obligatorios');
  }

  const usuario = await userRepository.findByEmail(email);
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

function sanitizarUsuario(usuario) {
  const plano = usuario.toJSON ? usuario.toJSON() : usuario;
  delete plano.password;
  return plano;
}

module.exports = { registrar, login, HttpError };
