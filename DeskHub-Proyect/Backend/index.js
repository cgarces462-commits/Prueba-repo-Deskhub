require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./src/routes');
const { sequelize } = require('./src/models');
const { manejadorErrores, rutaNoEncontrada } = require('./src/middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('✔ Conexión a la base de datos establecida correctamente.');

    await sequelize.sync(); // crea las tablas si no existen
    console.log('✔ Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`🚀 DeskHub API escuchando en http://localhost:${PORT}/api`);
      console.log(
        'ℹ Si es la primera vez que corres el proyecto, ejecuta "npm run seed" para crear los 5 roles y el usuario super_admin.'
      );
    });
  } catch (error) {
    console.error('✘ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

iniciarServidor();

module.exports = app;
