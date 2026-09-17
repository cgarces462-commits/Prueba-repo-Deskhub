const { ImagenEspacioModel } = require('../models/ModelosIndex');

const listarImagenes = (spaceId) =>
  ImagenEspacioModel.findAll({
    where: { spaceId },
    order: [
      ['orden', 'ASC'],
      ['id', 'ASC'],
    ],
  });

const crear = (data) => ImagenEspacioModel.create(data);

const encontrarPorId = (id) => ImagenEspacioModel.findByPk(id);

const eliminar = async (imagen) => {
  await imagen.destroy();
};

module.exports = { listarImagenes, crear, encontrarPorId, eliminar };