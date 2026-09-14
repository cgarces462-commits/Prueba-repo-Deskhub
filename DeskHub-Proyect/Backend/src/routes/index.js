const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const spaceRoutes = require('./space.routes');
const reservationRoutes = require('./reservation.routes');

const router = Router();

router.get('/', (req, res) => {
  res.json({ mensaje: 'API de reservas de espacios de coworking - DeskHub' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/spaces', spaceRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
