const { Router } = require('express');
const reservationController = require('../controllers/reservation.controller');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

const router = Router();

router.use(autenticar);

// cliente/invitado ven solo las suyas; el resto de roles ven todas (lógica en el service)
router.get('/', reservationController.listar);
router.get('/:id', reservationController.obtenerPorId);

// cualquier usuario autenticado puede crear una reserva para sí mismo
router.post('/', reservationController.crear);

// recepcionista, admin y super_admin confirman/cambian el estado de una reserva
router.patch(
  '/:id/status',
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPCIONISTA),
  reservationController.cambiarEstado
);

// el dueño de la reserva o el staff puede cancelarla (lógica de permisos en el service)
router.patch('/:id/cancel', reservationController.cancelar);

module.exports = router;
