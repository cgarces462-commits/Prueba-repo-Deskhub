const { Router } = require('express');
const espacioController = require('../controllers/EspacioController');
const { autenticar, autorizar } = require('../middlewares/AuthMiddleware');
const { subirImagen } = require('../middlewares/UploadMiddleware');
const { validarCuerpo, esquemas } = require('../middlewares/ValidationMiddleware');
const { ROLES } = require('../config/roles');

const router = Router();

// Cualquier usuario autenticado (incluido invitado) puede ver los espacios disponibles
router.get('/', autenticar, espacioController.listar);
router.get('/:id', autenticar, espacioController.obtenerPorId);

// Solo super_admin y admin gestionan el catálogo de espacios
router.post(
  '/',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validarCuerpo(esquemas.crearEspacio),
  espacioController.crear
);
router.put(
  '/:id',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validarCuerpo(esquemas.actualizarEspacio),
  espacioController.actualizar
);
router.delete('/:id', autenticar, autorizar(ROLES.SUPER_ADMIN), espacioController.eliminar);

// Galería de imágenes del espacio
router.post(
  '/:id/images',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  subirImagen.single('imagen'),
  espacioController.subirImagen
);
router.delete(
  '/:id/images/:imagenId',
  autenticar,
  autorizar(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  espacioController.eliminarImagen
);

module.exports = router;