const { RolModel } = require('../models/ModelosIndex');

const findAll = () => RolModel.findAll();

const findById = (id) => RolModel.findByPk(id);

const findByNombre = (nombre) => RolModel.findOne({ where: { nombre } });

module.exports = { findAll, findById, findByNombre };