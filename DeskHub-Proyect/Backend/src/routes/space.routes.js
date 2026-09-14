const { Router } = require('express');
const spaceController = require('../controllers/space.controller');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { subirImagen } = require('../middlewares/upload.middleware');
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

// Galería de imágenes del espacio
router.post(
  '/:id/images',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  subirImagen.single('imagen'),
  spaceController.subirImagen
);
router.delete(
  '/:id/images/:imagenId',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  spaceController.eliminarImagen
);

module.exports = router;
