const spaceRepository = require('../repositories/space.repository');
const { HttpError } = require('./auth.service');

async function listar(filtros = {}) {
  const where = {};
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.disponible !== undefined) {
    where.disponible = filtros.disponible === 'true' || filtros.disponible === true;
  }
  return spaceRepository.findAll(where);
}

async function obtenerPorId(id) {
  const espacio = await spaceRepository.findById(id);
  if (!espacio) throw new HttpError(404, 'Espacio no encontrado');
  return espacio;
}

async function crear(data) {
  if (!data.nombre || !data.tipo) {
    throw new HttpError(400, 'nombre y tipo son obligatorios');
  }
  return spaceRepository.create(data);
}

async function actualizar(id, data) {
  const actualizado = await spaceRepository.updateById(id, data);
  if (!actualizado) throw new HttpError(404, 'Espacio no encontrado');
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await spaceRepository.deleteById(id);
  if (!eliminado) throw new HttpError(404, 'Espacio no encontrado');
  return eliminado;
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
