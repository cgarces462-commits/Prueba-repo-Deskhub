const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

const router = Router();

// Todas las rutas de gestión de usuarios requieren estar autenticado
router.use(autenticar);

// admin y super_admin pueden ver el listado / detalle de usuarios
router.get('/', autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN), userController.listar);
router.get('/:id', autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN), userController.obtenerPorId);

// solo super_admin puede cambiar roles (evita que un admin se autoascienda)
router.patch('/:id/role', autorizar(ROLES.SUPER_ADMIN), userController.cambiarRol);

// super_admin y admin pueden activar/desactivar usuarios
router.patch(
  '/:id/status',
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  userController.cambiarEstado
);

// solo super_admin puede eliminar usuarios
router.delete('/:id', autorizar(ROLES.SUPER_ADMIN), userController.eliminar);

module.exports = router;
