const { Router } = require('express');
const reservaController = require('../controllers/ReservaController');
const { autenticar, autorizar } = require('../middlewares/AuthMiddleware');
const { validarCuerpo, esquemas } = require('../middlewares/ValidationMiddleware');
const { ROLES } = require('../config/roles');

const router = Router();

router.use(autenticar);

// cliente/invitado ven solo las suyas; el resto de roles ven todas (lógica en el service)
router.get('/', reservaController.listar);
router.get('/:id', reservaController.obtenerPorId);

// cualquier usuario autenticado puede crear una reserva para sí mismo
router.post('/', validarCuerpo(esquemas.crearReserva), reservaController.crear);

// recepcionista, admin y super_admin confirman/cambian el estado de una reserva
router.patch(
  '/:id/status',
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPCIONISTA),
  validarCuerpo(esquemas.cambiarEstado),
  reservaController.cambiarEstado
);

// el dueño de la reserva o el staff puede cancelarla (lógica de permisos en el service)
router.patch('/:id/cancel', reservaController.cancelar);

module.exports = router;