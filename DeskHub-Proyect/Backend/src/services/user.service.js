const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const { HttpError } = require('./auth.service');
const { ROLES_LIST } = require('../config/roles');

async function listar() {
  return userRepository.findAll();
}

async function obtenerPorId(id) {
  const usuario = await userRepository.findById(id);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
  return usuario;
}

async function cambiarRol(id, nombreRol) {
  if (!ROLES_LIST.includes(nombreRol)) {
    throw new HttpError(400, `Rol inválido. Roles válidos: ${ROLES_LIST.join(', ')}`);
  }
  const rol = await roleRepository.findByNombre(nombreRol);
  const actualizado = await userRepository.updateById(id, { roleId: rol.id });
  if (!actualizado) throw new HttpError(404, 'Usuario no encontrado');
  return userRepository.findById(id);
}

async function cambiarEstado(id, activo) {
  const actualizado = await userRepository.updateById(id, { activo: Boolean(activo) });
  if (!actualizado) throw new HttpError(404, 'Usuario no encontrado');
  return userRepository.findById(id);
}

async function eliminar(id) {
  const eliminado = await userRepository.deleteById(id);
  if (!eliminado) throw new HttpError(404, 'Usuario no encontrado');
  return eliminado;
}

module.exports = { listar, obtenerPorId, cambiarRol, cambiarEstado, eliminar };
