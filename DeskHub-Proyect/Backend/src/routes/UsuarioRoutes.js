const { Router } = require('express');
const usuarioController = require('../controllers/UsuarioController');
const { autenticar, autorizar } = require('../middlewares/AuthMiddleware');
const { validarCuerpo, esquemas } = require('../middlewares/ValidationMiddleware');
const { ROLES } = require('../config/roles');

const router = Router();

// Todas las rutas de gestión de usuarios requieren estar autenticado
router.use(autenticar);

// admin y super_admin pueden ver el listado / detalle de usuarios
router.get('/', autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN), usuarioController.listar);
router.get('/:id', autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN), usuarioController.obtenerPorId);

// solo super_admin puede cambiar roles (evita que un admin se autoascienda)
router.patch(
  '/:id/role',
  autorizar(ROLES.SUPER_ADMIN),
  validarCuerpo(esquemas.cambiarRol),
  usuarioController.cambiarRol
);

// super_admin y admin pueden activar/desactivar usuarios
router.patch(
  '/:id/status',
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validarCuerpo(esquemas.cambiarEstadoUsuario),
  usuarioController.cambiarEstado
);

// solo super_admin puede eliminar usuarios
router.delete('/:id', autorizar(ROLES.SUPER_ADMIN), usuarioController.eliminar);

module.exports = router;