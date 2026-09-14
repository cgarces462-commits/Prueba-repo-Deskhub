const fs = require('fs');
const path = require('path');
const spaceRepository = require('../repositories/space.repository');
const spaceImageRepository = require('../repositories/spaceImage.repository');
const { Space } = require('../models');
const { HttpError } = require('./auth.service');

const DIR_UPLOADS = path.join(__dirname, '..', '..', 'uploads', 'espacios');

function serializar(espacio) {
  const datos = espacio instanceof Space ? espacio.toJSON() : espacio;
  return {
    ...datos,
    imagenes: (datos.imagenes || []).map((im) => ({ id: im.id, url: im.url })),
  };
}

async function listar(filtros = {}) {
  const where = {};
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.disponible !== undefined) {
    where.disponible = filtros.disponible === 'true' || filtros.disponible === true;
  }
  const espacios = await spaceRepository.findAll(where);
  return espacios.map(serializar);
}

async function obtenerPorId(id) {
  const espacio = await spaceRepository.findById(id);
  if (!espacio) throw new HttpError(404, 'Espacio no encontrado');
  return serializar(espacio);
}

async function crear(data) {
  if (!data.nombre || !data.tipo) {
    throw new HttpError(400, 'nombre y tipo son obligatorios');
  }
  const espacio = await spaceRepository.create(data);
  return obtenerPorId(espacio.id);
}

async function actualizar(id, data) {
  const actualizado = await spaceRepository.updateById(id, data);
  if (!actualizado) throw new HttpError(404, 'Espacio no encontrado');
  return serializar(await spaceRepository.findById(id));
}

async function eliminar(id) {
  const eliminado = await spaceRepository.deleteById(id);
  if (!eliminado) throw new HttpError(404, 'Espacio no encontrado');
  return eliminado;
}

async function subirImagen(spaceId, archivo) {
  if (!archivo) throw new HttpError(400, 'Debes adjuntar una imagen');

  const espacio = await spaceRepository.findById(spaceId);
  if (!espacio) throw new HttpError(404, 'Espacio no encontrado');

  const imagenes = await spaceImageRepository.listarImagenes(spaceId);
  const imagen = await spaceImageRepository.crear({
    spaceId,
    url: `/uploads/espacios/${archivo.filename}`,
    orden: imagenes.length,
  });

  return serializar(await spaceRepository.findById(spaceId)).imagenes.find(
    (im) => im.id === imagen.id
  );
}

async function eliminarImagen(spaceId, imagenId) {
  const imagen = await spaceImageRepository.encontrarPorId(imagenId);
  if (!imagen || imagen.spaceId !== Number(spaceId)) {
    throw new HttpError(404, 'Imagen no encontrada');
  }

  const ruta = path.join(DIR_UPLOADS, path.basename(imagen.url));
  fs.promises.unlink(ruta).catch(() => {});
  await spaceImageRepository.eliminar(imagen);
  return { id: imagen.id };
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  subirImagen,
  eliminarImagen,
};