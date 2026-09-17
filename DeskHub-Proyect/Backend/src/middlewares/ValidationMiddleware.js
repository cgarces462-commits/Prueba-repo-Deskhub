const Joi = require('joi');

/**
 * Middleware de validación de esquemas (Joi).
 * Capa transversal previa a la ejecución del controlador: valida el body
 * de la petición, normaliza el valor y, si hay errores, responde 400 sin
 * llegar a la capa de servicios.
 */

const TIPOS_ESPACIO = ['escritorio', 'oficina_privada', 'sala_reunion', 'sala_conferencia'];
const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'cancelada', 'completada'];

const esquemas = {
  registro: Joi.object({
    nombre: Joi.string().trim().required().max(80),
    apellido: Joi.string().trim().allow('', null).max(80),
    email: Joi.string().trim().email().required().max(120),
    password: Joi.string().min(6).max(100).required(),
    telefono: Joi.string().trim().allow('', null).max(20),
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required().max(120),
    password: Joi.string().required().max(100),
  }),

  crearEspacio: Joi.object({
    nombre: Joi.string().trim().required().max(100),
    tipo: Joi.string().valid(...TIPOS_ESPACIO).required(),
    ubicacion: Joi.string().trim().allow('', null).max(150),
    capacidad: Joi.number().integer().min(1).default(1),
    precioPorHora: Joi.number().min(0).default(0),
    descripcion: Joi.string().trim().allow('', null),
  }),

  actualizarEspacio: Joi.object({
    nombre: Joi.string().trim().max(100),
    tipo: Joi.string().valid(...TIPOS_ESPACIO),
    ubicacion: Joi.string().trim().allow('', null).max(150),
    capacidad: Joi.number().integer().min(1),
    precioPorHora: Joi.number().min(0),
    descripcion: Joi.string().trim().allow('', null),
    disponible: Joi.boolean(),
  }).min(1),

  crearReserva: Joi.object({
    spaceId: Joi.number().integer().positive().required(),
    fechaInicio: Joi.date().iso().required(),
    fechaFin: Joi.date().iso().required().greater(Joi.ref('fechaInicio')),
    notas: Joi.string().trim().allow('', null).max(255),
  }),

  cambiarEstado: Joi.object({
    estado: Joi.string().valid(...ESTADOS_RESERVA).required(),
  }),

  cambiarRol: Joi.object({
    rol: Joi.string().required().max(30),
  }),

  cambiarEstadoUsuario: Joi.object({
    activo: Joi.boolean().required(),
  }),
};

function mensajesDe(error) {
  return error.details.map((detalle) => detalle.message.replace(/"/g, "'"));
}

/**
 * Devuelve un middleware que valida req.body contra el esquema recibido.
 * Si la validación falla responde 400; si pasa, reemplaza req.body por el
 * valor normalizado (con valores por defecto aplicados) y continúa.
 */
function validarCuerpo(esquema) {
  return (req, res, next) => {
    const { error, value } = esquema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return res.status(400).json({
        mensaje: 'Datos de entrada inválidos',
        errores: mensajesDe(error),
      });
    }
    req.body = value;
    next();
  };
}

module.exports = { esquemas, validarCuerpo };