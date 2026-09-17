const { Router } = require('express');
const authController = require('../controllers/AuthController');
const { autenticar } = require('../middlewares/AuthMiddleware');
const { validarCuerpo, esquemas } = require('../middlewares/ValidationMiddleware');

const router = Router();

router.post('/register', validarCuerpo(esquemas.registro), authController.registrar);
router.post('/login', validarCuerpo(esquemas.login), authController.login);
router.get('/profile', autenticar, authController.perfil);

module.exports = router;