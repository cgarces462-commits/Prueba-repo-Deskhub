const { Router } = require('express');

const authRoutes = require('./AuthRoutes');
const usuarioRoutes = require('./UsuarioRoutes');
const espacioRoutes = require('./EspacioRoutes');
const reservaRoutes = require('./ReservaRoutes');

const router = Router();

router.get('/', (req, res) => {
  res.json({ mensaje: 'API de reservas de espacios de coworking - DeskHub' });
});

router.use('/auth', authRoutes);
router.use('/users', usuarioRoutes);
router.use('/spaces', espacioRoutes);
router.use('/reservations', reservaRoutes);

module.exports = router;