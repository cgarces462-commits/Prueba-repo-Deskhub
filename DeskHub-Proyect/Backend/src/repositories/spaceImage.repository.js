const { SpaceImage } = require('../models');

const listarImagenes = (spaceId) =>
  SpaceImage.findAll({
    where: { spaceId },
    order: [
      ['orden', 'ASC'],
      ['id', 'ASC'],
    ],
  });

const crear = (data) => SpaceImage.create(data);

const encontrarPorId = (id) => SpaceImage.findByPk(id);

const eliminar = async (imagen) => {
  await imagen.destroy();
};

module.exports = { listarImagenes, crear, encontrarPorId, eliminar };