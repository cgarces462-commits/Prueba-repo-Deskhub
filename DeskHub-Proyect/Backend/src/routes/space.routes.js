const { Router } = require('express');
const spaceController = require('../controllers/space.controller');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

const router = Router();

// Cualquier usuario autenticado (incluido invitado) puede ver los espacios disponibles
router.get('/', autenticar, spaceController.listar);
router.get('/:id', autenticar, spaceController.obtenerPorId);

// Solo super_admin y admin gestionan el catálogo de espacios
router.post('/', autenticar, autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN), spaceController.crear);
router.put(
  '/:id',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  spaceController.actualizar
);
router.delete('/:id', autenticar, autorizar(ROLES.SUPER_ADMIN), spaceController.eliminar);

module.exports = router;
