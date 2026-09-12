const { Role } = require('../models');

const findAll = () => Role.findAll();

const findById = (id) => Role.findByPk(id);

const findByNombre = (nombre) => Role.findOne({ where: { nombre } });

module.exports = { findAll, findById, findByNombre };
